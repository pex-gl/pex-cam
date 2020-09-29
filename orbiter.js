'use strict'
const vec3 = require('pex-math/vec3')
const mat4 = require('pex-math/mat4')
const ray = require('pex-geom/ray')
const clamp = require('pex-math/utils').clamp
const raf = require('raf')
const interpolateAngle = require('interpolate-angle')
const lerp = require('pex-math/utils').lerp
const toRadians = require('pex-math/utils').toRadians
const toDegrees = require('pex-math/utils').toDegrees
const latLonToXyz = require('latlon-to-xyz')
const xyzToLatLon = require('xyz-to-latlon')
const eventOffset = require('mouse-event-offset')

function offset (e, target) {
  if (e.touches) return eventOffset(e.touches[0], target)
  else return eventOffset(e, target)
}

function Orbiter (opts) {
  // TODO: split into internal state and public state
  const initialState = {
    camera: opts.camera,
    invViewMatrix: mat4.create(),
    dragging: false,
    lat: 0, // Y
    minLat: -89.5,
    maxLat: 89.5,
    lon: 0, // XZ
    minLon: -Infinity,
    maxLon: Infinity,
    currentLat: 0,
    currentLon: 0,
    easing: 1,
    element: opts.element || window,
    width: 0,
    height: 0,
    clickPosWindow: [0, 0],
    dragPos: [0, 0, 0],
    dragPosWindow: [0, 0],
    distance: 1,
    currentDistance: 1,
    minDistance: 1,
    maxDistance: 1,
    zoomSlowdown: 400,
    zoom: true,
    pan: true,
    drag: true,
    dragSlowdown: 4,
    clickTarget: [0, 0, 0],
    clickPosPlane: [0, 0, 0],
    dragPosPlane: [0, 0, 0],
    clickPosWorld: [0, 0, 0],
    dragPosWorld: [0, 0, 0],
    panPlane: null,
    autoUpdate: true    
  }

  this.set(initialState)
  this.set(opts)
  this.setup()
}

Orbiter.prototype.set = function (opts) {
  if (opts.camera) {
    const distance = vec3.distance(opts.camera.position, opts.camera.target)
    const latLon = xyzToLatLon(vec3.normalize(vec3.sub(vec3.copy(opts.camera.position), opts.camera.target)))
    this.lat = latLon[0]
    this.lon = latLon[1]
    this.currentLat = this.lat
    this.currentLon = this.lon
    this.distance = distance
    this.currentDistance = this.distance
    this.minDistance = opts.minDistance || distance / 10
    this.maxDistance = opts.maxDistance || distance * 10
  }

  Object.assign(this, opts)
}

Orbiter.prototype.updateWindowSize = function () {
  const width = this.element.clientWidth || this.element.innerWidth
  const height = this.element.clientHeight || this.element.innerHeight
  if (width !== this.width) {
    this.width = width
    this.height = height
    this.radius = Math.min(this.width / 2, this.height / 2)
  }
}

Orbiter.prototype.updateCamera = function () {
  // instad of rotating the object we want to move camera around it
  // state.currRot[3] *= -1
  if (!this.camera) return

  const position = this.camera.position
  const target = this.camera.target

  this.lat = clamp(this.lat, this.minLat, this.maxLat)
  this.lon = clamp(this.lon, this.minLon, this.maxLon) % 360

  this.currentLat = toDegrees(
    interpolateAngle(
      (toRadians(this.currentLat) + 2 * Math.PI) % (2 * Math.PI),
      (toRadians(this.lat) + 2 * Math.PI) % (2 * Math.PI),
      this.easing
    )
  )
  this.currentLon = toDegrees(
    interpolateAngle(
      (toRadians(this.currentLon) + 2 * Math.PI) % (2 * Math.PI),
      (toRadians(this.lon) + 2 * Math.PI) % (2 * Math.PI),
      this.easing
    )
  )
  this.currentDistance = lerp(this.currentDistance, this.distance, this.easing)

  // set new camera position according to the current
  // rotation at distance relative to target
  latLonToXyz(this.currentLat, this.currentLon, position)
  vec3.scale(position, this.currentDistance)
  vec3.add(position, target)

  this.camera.set({
    position: position
  })
}

Orbiter.prototype.setup = function () {
  var orbiter = this

  function down (x, y, shift) {
    orbiter.dragging = true
    orbiter.dragPos[0] = x
    orbiter.dragPos[1] = y
    if (shift && orbiter.pan) {
      orbiter.clickPosWindow[0] = x
      orbiter.clickPosWindow[1] = y
      vec3.set(orbiter.clickTarget, orbiter.camera.target)
      const targetInViewSpace = vec3.multMat4(vec3.copy(orbiter.clickTarget), orbiter.camera.viewMatrix)
      orbiter.panPlane = [targetInViewSpace, [0, 0, 1]]
      ray.hitTestPlane(
        orbiter.camera.getViewRay(orbiter.clickPosWindow[0], orbiter.clickPosWindow[1], orbiter.width, orbiter.height),
        orbiter.panPlane[0],
        orbiter.panPlane[1],
        orbiter.clickPosPlane
      )
      ray.hitTestPlane(
        orbiter.camera.getViewRay(orbiter.dragPosWindow[0], orbiter.dragPosWindow[1], orbiter.width, orbiter.height),
        orbiter.panPlane[0],
        orbiter.panPlane[1],
        orbiter.dragPosPlane
      )
    } else {
      orbiter.panPlane = null
    }
  }

  function move (x, y, shift) {
    if (!orbiter.dragging) {
      return
    }
    if (shift && orbiter.panPlane) {
      orbiter.dragPosWindow[0] = x
      orbiter.dragPosWindow[1] = y
      ray.hitTestPlane(
        orbiter.camera.getViewRay(orbiter.clickPosWindow[0], orbiter.clickPosWindow[1], orbiter.width, orbiter.height),
        orbiter.panPlane[0],
        orbiter.panPlane[1],
        orbiter.clickPosPlane
      )
      ray.hitTestPlane(
        orbiter.camera.getViewRay(orbiter.dragPosWindow[0], orbiter.dragPosWindow[1], orbiter.width, orbiter.height),
        orbiter.panPlane[0],
        orbiter.panPlane[1],
        orbiter.dragPosPlane
      )
      mat4.set(orbiter.invViewMatrix, orbiter.camera.viewMatrix)
      mat4.invert(orbiter.invViewMatrix)
      vec3.multMat4(vec3.set(orbiter.clickPosWorld, orbiter.clickPosPlane), orbiter.invViewMatrix)
      vec3.multMat4(vec3.set(orbiter.dragPosWorld, orbiter.dragPosPlane), orbiter.invViewMatrix)
      const diffWorld = vec3.sub(vec3.copy(orbiter.dragPosWorld), orbiter.clickPosWorld)
      const target = vec3.sub(vec3.copy(orbiter.clickTarget), diffWorld)
      orbiter.camera.set({ target: target })
      orbiter.updateCamera()
    } else if (orbiter.drag) {
      const dx = x - orbiter.dragPos[0]
      const dy = y - orbiter.dragPos[1]
      orbiter.dragPos[0] = x
      orbiter.dragPos[1] = y

      orbiter.lat += dy / orbiter.dragSlowdown
      orbiter.lon -= dx / orbiter.dragSlowdown

      // TODO: how to have resolution independed scaling? will this code behave differently with retina/pixelRatio=2?
      orbiter.updateCamera()
    }
  }

  function up () {
    orbiter.dragging = false
    orbiter.panPlane = null
  }

  function scroll (dy) {
    if (!orbiter.zoom) {
      return false
    }
    orbiter.distance *= 1 + dy / orbiter.zoomSlowdown
    orbiter.distance = clamp(orbiter.distance, orbiter.minDistance, orbiter.maxDistance)
    orbiter.updateCamera()
    return true
  }

  function onMouseDown (e) {
    orbiter.updateWindowSize()
    const pos = offset(e, orbiter.element)
    down(
      pos[0],
      pos[1],
      e.shiftKey || (e.touches && e.touches.length === 2)
    )
  }

  function onMouseMove (e) {
    const pos = offset(e, orbiter.element)
    move(
      pos[0],
      pos[1],
      e.shiftKey || (e.touches && e.touches.length === 2)
    )
  }

  function onMouseUp (e) {
    up()
  }

  function onWheel (e) {
    if (scroll(e.deltaY) === true) {
      e.preventDefault()
      return false
    }
  }

  function onTouchStart (e) {
    e.preventDefault()
    onMouseDown(e)
  }

  this._onMouseDown = onMouseDown
  this._onTouchStart = onTouchStart
  this._onMouseMove = onMouseMove
  this._onMouseUp = onMouseUp
  this._onWheel = onWheel

  this.element.addEventListener('mousedown', onMouseDown)
  this.element.addEventListener('touchstart', onTouchStart)
  this.element.addEventListener('wheel', onWheel)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('touchmove', onMouseMove, { passive: false })
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('touchend', onMouseUp)

  this.updateCamera()

  if (this.autoUpdate) {
    const self = this
    this._rafHandle = raf(function tick () {
      orbiter.updateCamera()
      self._rafHandle = raf(tick)
    })
  }
}

Orbiter.prototype.dispose = function () {
  this.element.removeEventListener('mousedown', this._onMouseDown)
  this.element.removeEventListener('touchstart', this._onTouchStart)
  this.element.removeEventListener('wheel', this._onWheel)
  window.removeEventListener('mousemove', this._onMouseMove)
  window.removeEventListener('touchmove', this._onMouseMove)
  window.removeEventListener('mouseup', this._onMouseUp)
  window.removeEventListener('touchend', this._onMouseUp)
  raf.cancel(this._rafHandle)
  this.camera = null
}

module.exports = function createOrbiter (opts) {
  return new Orbiter(opts)
}
