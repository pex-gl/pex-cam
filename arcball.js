'use strict'
const Vec2 = require('pex-math/Vec2')
const Vec3 = require('pex-math/Vec3')
const Mat4 = require('pex-math/Mat4')
const Quat = require('pex-math/Quat')
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

// TOOD: issues to consider
// - using canvas element instead of window for events
// = should arcball update Camera aspect ratio?
// - window resizing
// - fullscreen vs local canvas
// - scroll prevention
// - retina display
// - touch events
// - event priority
// - setting current arcball orientation by setting camera position
// - camera position change detection
function createArcball (opts) {
  const initialState = {
    camera: opts.camera,
    invViewMatrix: Mat4.create(),
    dragging: false,
    elem: window,
    width: window.innerWidth,
    height: window.innerHeight,
    radius: Math.min(window.innerWidth / 2, window.innerHeight / 2),
    center: [window.innerWidth / 2, window.innerHeight / 2],
    currRot: Quat.create(),
    clickRot: [0, 0, 0, 1],
    dragRot: [0, 0, 0, 1],
    clickPos: [0, 0, 0],
    clickPosWindow: [0, 0],
    dragPos: [0, 0, 0],
    dragPosWindow: [0, 0],
    rotAxis: [0, 0, 0],
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

  function arcball (opts) {
    Object.assign(arcball, opts)

    if (opts.camera) {
      const distance = Vec3.distance(opts.camera.position, opts.camera.target)
      arcball.distance = distance
      arcball.minDistance = distance / 10
      arcball.maxDistance = distance * 10
      arcball.currRot = Quat.fromMat4(arcball.currRot, opts.camera.viewMatrix)
    }

    return arcball
  }

  function updateWindowSize () {
    if (window.innerWidth !== arcball.width) {
      arcball.width = window.innerWidth
      arcball.height = window.innerHeight
      arcball.radius = Math.min(arcball.width / 2, arcball.height / 2)
      arcball.center = [arcball.width / 2, arcball.height / 2]
    }
  }

  function updateCamera () {
    // instad of rotating the object we want to move camera around it
    arcball.currRot[3] *= -1

    const position = arcball.camera.position
    const target = arcball.camera.target
    const up = arcball.camera.up
    const distance = arcball.distance

    // set new camera position according to the current
    // rotation at distance relative to target
    Vec3.set3(position, 0, 0, distance)
    Vec3.multQuat(position, arcball.currRot)
    Vec3.add(position, target)

    Vec3.set3(up, 0, 1, 0)
    Vec3.multQuat(up, arcball.currRot)

    arcball.camera({
      position: position,
      target: target,
      up: up
    })

    // roll back rotation flip
    arcball.currRot[3] *= -1
  }

  function mouseToSphere (x, y, out) {
    y = arcball.height - y
    out[0] = (x - arcball.center[0]) / arcball.radius
    out[1] = (y - arcball.center[1]) / arcball.radius
    const dist = out[0] * out[0] + out[1] * out[1]
    if (dist > 1) {
      Vec3.normalize(out)
    } else {
      out[2] = Math.sqrt(1 - dist)
    }
    return out
  }

  function down (x, y, shift) {
    arcball.dragging = true
    mouseToSphere(x, y, arcball.clickPos)
    Quat.set(arcball.clickRot, arcball.currRot)
    updateCamera()
    if (shift) {
      Vec2.set2(arcball.clickPosWindow, x, y)
      Vec3.set(arcball.clickTarget, arcball.camera.target)
      const targetInViewSpace = Vec3.multMat4(Vec3.copy(arcball.clickTarget), arcball.camera.viewMatrix)
      arcball.panPlane = [targetInViewSpace, [0, 0, 1]]
      Ray.hitTestPlane(
        getViewRay(arcball.camera, arcball.clickPosWindow[0], arcball.clickPosWindow[1], arcball.width, arcball.height),
        arcball.panPlane[0],
        arcball.panPlane[1],
        arcball.clickPosPlane
      )
      Ray.hitTestPlane(
        getViewRay(arcball.camera, arcball.dragPosWindow[0], arcball.dragPosWindow[1], arcball.width, arcball.height),
        arcball.panPlane[0],
        arcball.panPlane[1],
        arcball.dragPosPlane
      )
    } else {
      arcball.panPlane = null
    }
  }

  function move (x, y, shift) {
    if (!arcball.dragging) {
      return
    }
    if (shift && arcball.panPlane) {
      Vec2.set2(arcball.dragPosWindow, x, y)
      Ray.hitTestPlane(
        getViewRay(arcball.camera, arcball.clickPosWindow[0], arcball.clickPosWindow[1], arcball.width, arcball.height),
        arcball.panPlane[0],
        arcball.panPlane[1],
        arcball.clickPosPlane
      )
      Ray.hitTestPlane(
        getViewRay(arcball.camera, arcball.dragPosWindow[0], arcball.dragPosWindow[1], arcball.width, arcball.height),
        arcball.panPlane[0],
        arcball.panPlane[1],
        arcball.dragPosPlane
      )
      Mat4.set(arcball.invViewMatrix, arcball.camera.viewMatrix)
      Mat4.invert(arcball.invViewMatrix)
      Vec3.multMat4(Vec3.set(arcball.clickPosWorld, arcball.clickPosPlane), arcball.invViewMatrix)
      Vec3.multMat4(Vec3.set(arcball.dragPosWorld, arcball.dragPosPlane), arcball.invViewMatrix)
      const diffWorld = Vec3.sub(Vec3.copy(arcball.dragPosWorld), arcball.clickPosWorld)
      const target = Vec3.sub(Vec3.copy(arcball.clickTarget), diffWorld)
      arcball.camera({ target: target })
      updateCamera()
    } else {
      mouseToSphere(x, y, arcball.dragPos)
      Vec3.set(arcball.rotAxis, arcball.clickPos)
      Vec3.cross(arcball.rotAxis, arcball.dragPos)
      const theta = Vec3.dot(arcball.clickPos, arcball.dragPos)
      Quat.set4(arcball.dragRot, arcball.rotAxis[0], arcball.rotAxis[1], arcball.rotAxis[2], theta)
      Quat.set(arcball.currRot, arcball.dragRot)
      Quat.mult(arcball.currRot, arcball.clickRot)
      updateCamera()
    }
  }

  function up () {
    arcball.dragging = false
    arcball.panPlane = null
  }

  function scroll (dy) {
    if (!arcball.zoom) {
      return
    }
    arcball.distance = arcball.distance + dy / 50
    arcball.distance = clamp(arcball.distance, arcball.minDistance, arcball.maxDistance)
    updateCamera()
  }

  function onMouseDown (e) {
    updateWindowSize()
    down(e.offsetX, e.offsetY, e.shiftKey)
  }

  function onMouseMove (e) {
    move(e.offsetX, e.offsetY, e.shiftKey)
  }

  function onMouseUp (e) {
    up()
  }

  function onWheel (e) {
    scroll(e.deltaY)
    e.preventDefault()
  }

  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('wheel', onWheel)

  Object.assign(arcball, initialState)
  return arcball(opts)
}

module.exports = createArcball
