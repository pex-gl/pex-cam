'use strict'
const Vec2 = require('pex-math/Vec2')
const Vec3 = require('pex-math/Vec3')
const Mat4 = require('pex-math/Mat4')
const Ray = require('pex-geom/Ray')
const clamp = require('pex-math/Utils').clamp

function getViewRay (camera, x, y, windowWidth, windowHeight) {
  const hNear = 2 * Math.tan(camera.fov / 2) * camera.near
  const wNear = hNear * camera.aspect
  let px = (x - windowWidth / 2) / (windowWidth / 2)
  let py = -(y - windowHeight / 2) / (windowHeight / 2)
  px *= wNear / 2
  py *= hNear / 2
  const origin = [0, 0, 0]
  const direction = Vec3.normalize([px, py, -camera.near])
  return [origin, direction]
}

function latLonToXyz (lat, lon, out) {
  out = out || [0, 0, 0]
  const theta = lat
  const phi = lon
  out[0] = Math.cos(theta) * Math.cos(phi)
  out[1] = Math.sin(theta)
  out[2] = Math.cos(theta) * Math.sin(phi)
  return out
}

function xyzToLatLon (normalizedPosition, out) {
  out = out || [0, 0]
  out[0] = Math.asin(normalizedPosition[1])// + Math.PI / 2 // lat
  out[1] = Math.atan2(normalizedPosition[2], normalizedPosition[0])// + Math.PI / 2 // lon
  return out
}

function createOrbiter (opts) {
  // TODO: split into internal state and public state
  const initialState = {
    camera: opts.camera,
    invViewMatrix: Mat4.create(),
    dragging: false,
    lat: 0, // Y
    lon: 0, // XZ
    element: opts.element || window,
    width: 0,
    height: 0,
    clickPosWindow: [0, 0],
    dragPos: [0, 0, 0],
    dragPosWindow: [0, 0],
    distance: 1,
    minDistance: 1,
    maxDistance: 1,
    zoom: true,
    // enabled: true,
    clickTarget: [0, 0, 0],
    clickPosPlane: [0, 0, 0],
    dragPosPlane: [0, 0, 0],
    clickPosWorld: [0, 0, 0],
    dragPosWorld: [0, 0, 0],
    panPlane: null
  }

  function orbiter (opts) {
    Object.assign(orbiter, opts)

    if (opts.camera) {
      const distance = Vec3.distance(opts.camera.position, opts.camera.target)
      const latLon = xyzToLatLon(Vec3.normalize(Vec3.sub(Vec3.copy(opts.camera.position), opts.camera.target)))
      orbiter.lat = latLon[0]
      orbiter.lon = latLon[1]
      orbiter.distance = distance
      orbiter.minDistance = distance / 10
      orbiter.maxDistance = distance * 10
    }

    return orbiter
  }

  function updateWindowSize () {
    const width = orbiter.element.clientWidth || orbiter.element.innerWidth
    const height = orbiter.element.clientHeight || orbiter.element.innerHeight
    if (width !== orbiter.width) {
      orbiter.width = width
      orbiter.height = height
      orbiter.radius = Math.min(orbiter.width / 2, orbiter.height / 2)
      orbiter.center = [orbiter.width / 2, orbiter.height / 2]
    }
  }

  function updateCamera () {
    // instad of rotating the object we want to move camera around it
    // state.currRot[3] *= -1

    const position = orbiter.camera.position
    const target = orbiter.camera.target

    // set new camera position according to the current
    // rotation at distance relative to target
    latLonToXyz(orbiter.lat, orbiter.lon, position)
    Vec3.scale(position, orbiter.distance)
    Vec3.add(position, target)

    orbiter.camera({
      position: position
    })
  }

  function down (x, y, shift) {
    orbiter.dragging = true
    orbiter.dragPos[0] = x
    orbiter.dragPos[1] = y
    if (shift) {
      Vec2.set2(orbiter.clickPosWindow, x, y)
      Vec3.set(orbiter.clickTarget, orbiter.camera.target)
      const targetInViewSpace = Vec3.multMat4(Vec3.copy(orbiter.clickTarget), orbiter.camera.viewMatrix)
      orbiter.panPlane = [targetInViewSpace, [0, 0, 1]]
      Ray.hitTestPlane(
        getViewRay(orbiter.camera, orbiter.clickPosWindow[0], orbiter.clickPosWindow[1], orbiter.width, orbiter.height),
        orbiter.panPlane[0],
        orbiter.panPlane[1],
        orbiter.clickPosPlane
      )
      Ray.hitTestPlane(
        getViewRay(orbiter.camera, orbiter.dragPosWindow[0], orbiter.dragPosWindow[1], orbiter.width, orbiter.height),
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
      Vec2.set2(orbiter.dragPosWindow, x, y)
      Ray.hitTestPlane(
        getViewRay(orbiter.camera, orbiter.clickPosWindow[0], orbiter.clickPosWindow[1], orbiter.width, orbiter.height),
        orbiter.panPlane[0],
        orbiter.panPlane[1],
        orbiter.clickPosPlane
      )
      Ray.hitTestPlane(
        getViewRay(orbiter.camera, orbiter.dragPosWindow[0], orbiter.dragPosWindow[1], orbiter.width, orbiter.height),
        orbiter.panPlane[0],
        orbiter.panPlane[1],
        orbiter.dragPosPlane
      )
      Mat4.set(orbiter.invViewMatrix, orbiter.camera.viewMatrix)
      Mat4.invert(orbiter.invViewMatrix)
      Vec3.multMat4(Vec3.set(orbiter.clickPosWorld, orbiter.clickPosPlane), orbiter.invViewMatrix)
      Vec3.multMat4(Vec3.set(orbiter.dragPosWorld, orbiter.dragPosPlane), orbiter.invViewMatrix)
      const diffWorld = Vec3.sub(Vec3.copy(orbiter.dragPosWorld), orbiter.clickPosWorld)
      const target = Vec3.sub(Vec3.copy(orbiter.clickTarget), diffWorld)
      orbiter.camera({ target: target })
      updateCamera()
    } else {
      const dx = x - orbiter.dragPos[0]
      const dy = y - orbiter.dragPos[1]
      orbiter.dragPos[0] = x
      orbiter.dragPos[1] = y

      // TODO: how to have resolution independed scaling? will this code behave differently with retina/pixelRatio=2?
      orbiter.lat = clamp(orbiter.lat + dy / 200, -Math.PI / 2, Math.PI / 2)

      orbiter.lon += dx / 200
      orbiter.lon = orbiter.lon % (2 * Math.PI)

      updateCamera()
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
    orbiter.distance = orbiter.distance + dy / 50
    orbiter.distance = clamp(orbiter.distance, orbiter.minDistance, orbiter.maxDistance)
    updateCamera()
  }

  function onMouseDown (e) {
    updateWindowSize()
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

  Object.assign(orbiter, initialState)
  var o = orbiter(opts)

  orbiter.element.addEventListener('mousedown', onMouseDown)
  orbiter.element.addEventListener('touchstart', (e) => {
    e.preventDefault()
    onMouseDown(e)
  })
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('touchmove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('touchend', onMouseUp)
  orbiter.element.addEventListener('wheel', onWheel)

  updateCamera()

  return o
}

module.exports = createOrbiter
module.exports.latLonToXyz = latLonToXyz
module.exports.xyzToLatLon = xyzToLatLon
