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

function Orbiter (opts) {
  // TODO: split into internal state and public state
  const initialState = {
    camera: opts.camera,
    invViewMatrix: mat4.create(),
    dragging: false,
    lat: 0, // Y
    lon: 0, // XZ
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
  if (opts.lat !== undefined) {

  }
  Object.assign(this, opts)

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

  const position = this.camera.position
  const target = this.camera.target

  this.lat = clamp(this.lat, -89.5, 89.5)
  this.lon = this.lon % (360)

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
  vec3.scale(position, this.distance)
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
      return
    }
    orbiter.distance *= 1 + dy / orbiter.zoomSlowdown
    orbiter.distance = clamp(orbiter.distance, orbiter.minDistance, orbiter.maxDistance)
    orbiter.updateCamera()
  }

  function onMouseDown (e) {
    orbiter.updateWindowSize()
    down(
      e.offsetX || e.clientX || (e.touches ? e.touches[0].clientX : 0),
      e.offsetY || e.clientY || (e.touches ? e.touches[0].clientY : 0),
      e.shiftKey || (e.touches && e.touches.length === 2)
    )
  }

  function onMouseMove (e) {
    move(
      e.offsetX || e.clientX || (e.touches ? e.touches[0].clientX : 0),
      e.offsetY || e.clientY || (e.touches ? e.touches[0].clientY : 0),
      e.shiftKey || (e.touches && e.touches.length === 2)
    )
  }

  function onMouseUp (e) {
    up()
  }

  function onWheel (e) {
    scroll(e.deltaY)
    e.preventDefault()
  }

  this.element.addEventListener('mousedown', onMouseDown)
  this.element.addEventListener('touchstart', (e) => {
    e.preventDefault()
    onMouseDown(e)
  })
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('touchmove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('touchend', onMouseUp)
  this.element.addEventListener('wheel', onWheel)

  this.updateCamera()

  if (this.autoUpdate) {
    raf(function tick () {
      orbiter.updateCamera()
      raf(tick)
    })
  }
}

module.exports = function createOrbiter (opts) {
  return new Orbiter(opts)
}
