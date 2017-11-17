const mat4 = require('pex-math/mat4')

function setFrustumOffset (camera, x, y, width, height, widthTotal, heightTotal) {
  // console.log('frustum', x, y, width, height, widthTotal, heightTotal)
  widthTotal = widthTotal === undefined ? width : widthTotal
  heightTotal = heightTotal === undefined ? height : heightTotal

  var near = camera.near
  var far = camera.far
  var fov = camera.fov

  var aspectRatio = widthTotal / heightTotal

  var top = Math.tan(fov * 0.5) * near
  var bottom = -top
  var left = aspectRatio * bottom
  var right = aspectRatio * top
  var width_ = Math.abs(right - left)
  var height_ = Math.abs(top - bottom)
  var widthNormalized = width_ / widthTotal
  var heightNormalized = height_ / heightTotal

  var l = left + x * widthNormalized
  var r = left + (x + width) * widthNormalized
  var b = top - (y + height) * heightNormalized
  var t = top - y * heightNormalized

  camera.aspect = aspectRatio
  mat4.frustum(camera.projectionMatrix, l, r, b, t, near, far)
}

function createPerspectiveCamera (opts) {
  // const projectionMatrix = mat4.perspective([], 60, gl.canvas.width / gl.canvas.height, 0.1, 100)
  // const viewMatrix = mat4.lookAt([], [2, 2, 2], [0, 0, 0], [0, 1, 0])
  // const modelMatrix = mat4.create()

  const initialState = {
    projectionMatrix: mat4.create(),
    viewMatrix: mat4.create(),
    position: [0, 0, 3],
    target: [0, 0, 0],
    up: [0, 1, 0],
    fov: Math.PI / 3,
    aspect: 1,
    near: 0.1,
    far: 100
  }

  function camera (opts) {
    Object.assign(camera, opts)

    if (opts.position || opts.target || opts.up) {
      mat4.lookAt(
        camera.viewMatrix,
        camera.position,
        camera.target,
        camera.up
      )
    }

    if (opts.fov || opts.aspect || opts.near || opts.far) {
      console.log('camera.fov', camera.fov)
      mat4.perspective(
        camera.projectionMatrix,
        camera.fov,
        camera.aspect,
        camera.near,
        camera.far
      )
    }

    if (camera.frustum) {
      // console.log('pex-cam:perspective', 'setting frustum', camera.frustum)
      // console.log('pex-cam:perspective', 'setting frustum before', camera.projectionMatrix)
      setFrustumOffset(
        camera,
        camera.frustum.offset[0], camera.frustum.offset[1],
        camera.frustum.size[0], camera.frustum.size[1],
        camera.frustum.totalSize[0], camera.frustum.totalSize[1]
      )
      // console.log('pex-cam:perspective', 'setting frustum after', camera.projectionMatrix)
    }

    return camera
  }

  Object.assign(camera, initialState)

  return camera(opts)
}

module.exports = createPerspectiveCamera

