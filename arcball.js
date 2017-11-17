'USE STRICT'
const vec2 = require('pex-math/vec2')
const vec3 = require('pex-math/vec3')
const mat4 = require('pex-math/mat4')
const quat = require('pex-math/quat')
const ray = require('pex-geom/ray')
const clamp = require('pex-math/Utils').clamp

function getViewray (camera, x, y, windowWidth, windowHeight) {
  const hNear = 2 * Math.tan(camera.fov / 2) * camera.near
  const wNear = hNear * camera.aspect
  let px = (x - windowWidth / 2) / (windowWidth / 2)
  let py = -(y - windowHeight / 2) / (windowHeight / 2)
  px *= wNear / 2
  py *= hNear / 2
  const origin = [0, 0, 0]
  const direction = vec3.normalize([px, py, -camera.near])
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
    invViewMatrix: mat4.create(),
    dragging: false,
    element: opts.element || window,
    width: window.innerWidth,
    height: window.innerHeight,
    radius: Math.min(window.innerWidth / 2, window.innerHeight / 2),
    center: [window.innerWidth / 2, window.innerHeight / 2],
    currRot: quat.create(),
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
      const distance = vec3.distance(opts.camera.position, opts.camera.target)
      arcball.distance = distance
      arcball.minDistance = distance / 10
      arcball.maxDistance = distance * 10
      arcball.currRot = quat.frommat4(arcball.currRot, opts.camera.viewMatrix)
    }

    return arcball
  }

  function updateWindowSize () {
    const width = arcball.element.clientWidth || arcball.element.innerWidth
    const height = arcball.element.clientHeight || arcball.element.innerHeight
    if (width !== arcball.width) {
      arcball.width = width
      arcball.height = height
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
    vec3.set3(position, 0, 0, distance)
    vec3.multquat(position, arcball.currRot)
    vec3.add(position, target)

    vec3.set3(up, 0, 1, 0)
    vec3.multquat(up, arcball.currRot)

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
      vec3.normalize(out)
    } else {
      out[2] = Math.sqrt(1 - dist)
    }
    return out
  }

  function down (x, y, shift) {
    arcball.dragging = true
    mouseToSphere(x, y, arcball.clickPos)
    quat.set(arcball.clickRot, arcball.currRot)
    updateCamera()
    if (shift) {
      vec2.set2(arcball.clickPosWindow, x, y)
      vec3.set(arcball.clickTarget, arcball.camera.target)
      const targetInViewSpace = vec3.multmat4(vec3.copy(arcball.clickTarget), arcball.camera.viewMatrix)
      arcball.panPlane = [targetInViewSpace, [0, 0, 1]]
      ray.hitTestPlane(
        getViewray(arcball.camera, arcball.clickPosWindow[0], arcball.clickPosWindow[1], arcball.width, arcball.height),
        arcball.panPlane[0],
        arcball.panPlane[1],
        arcball.clickPosPlane
      )
      ray.hitTestPlane(
        getViewray(arcball.camera, arcball.dragPosWindow[0], arcball.dragPosWindow[1], arcball.width, arcball.height),
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
      vec2.set2(arcball.dragPosWindow, x, y)
      ray.hitTestPlane(
        getViewray(arcball.camera, arcball.clickPosWindow[0], arcball.clickPosWindow[1], arcball.width, arcball.height),
        arcball.panPlane[0],
        arcball.panPlane[1],
        arcball.clickPosPlane
      )
      ray.hitTestPlane(
        getViewray(arcball.camera, arcball.dragPosWindow[0], arcball.dragPosWindow[1], arcball.width, arcball.height),
        arcball.panPlane[0],
        arcball.panPlane[1],
        arcball.dragPosPlane
      )
      mat4.set(arcball.invViewMatrix, arcball.camera.viewMatrix)
      mat4.invert(arcball.invViewMatrix)
      vec3.multmat4(vec3.set(arcball.clickPosWorld, arcball.clickPosPlane), arcball.invViewMatrix)
      vec3.multmat4(vec3.set(arcball.dragPosWorld, arcball.dragPosPlane), arcball.invViewMatrix)
      const diffWorld = vec3.sub(vec3.copy(arcball.dragPosWorld), arcball.clickPosWorld)
      const target = vec3.sub(vec3.copy(arcball.clickTarget), diffWorld)
      arcball.camera({ target: target })
      updateCamera()
    } else {
      mouseToSphere(x, y, arcball.dragPos)
      vec3.set(arcball.rotAxis, arcball.clickPos)
      vec3.cross(arcball.rotAxis, arcball.dragPos)
      const theta = vec3.dot(arcball.clickPos, arcball.dragPos)
      quat.set4(arcball.dragRot, arcball.rotAxis[0], arcball.rotAxis[1], arcball.rotAxis[2], theta)
      quat.set(arcball.currRot, arcball.dragRot)
      quat.mult(arcball.currRot, arcball.clickRot)
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

  Object.assign(arcball, initialState)
  const a = arcball(opts)

  arcball.element.addEventListener('mousedown', onMouseDown)
  arcball.element.addEventListener('touchstart', (e) => {
    e.preventDefault()
    onMouseDown(e)
  })
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('touchmove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('touchend', onMouseUp)
  arcball.element.addEventListener('wheel', onWheel)

  return a
}

module.exports = createArcball
