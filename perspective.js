const vec3 = require('pex-math/vec3')
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

function PerspectiveCamera (opts) {
  this.set({
    projectionMatrix: mat4.create(),
    invViewMatrix: mat4.create(),
    viewMatrix: mat4.create(),
    position: [0, 0, 3],
    target: [0, 0, 0],
    up: [0, 1, 0],
    fov: Math.PI / 3,
    aspect: 1,
    near: 0.1,
    far: 100
  })

  this.set(opts)
}

PerspectiveCamera.prototype.set = function (opts) {
  Object.assign(this, opts)

  if (opts.position || opts.target || opts.up) {
    mat4.lookAt(
      this.viewMatrix,
      this.position,
      this.target,
      this.up
    )
    mat4.set(this.invViewMatrix, this.viewMatrix)
    mat4.invert(this.invViewMatrix)
  }

  if (opts.fov || opts.aspect || opts.near || opts.far) {
    mat4.perspective(
      this.projectionMatrix,
      this.fov,
      this.aspect,
      this.near,
      this.far
    )
  }

  if (this.frustum) {
    setFrustumOffset(
      this,
      this.frustum.offset[0], this.frustum.offset[1],
      this.frustum.size[0], this.frustum.size[1],
      this.frustum.totalSize[0], this.frustum.totalSize[1]
    )
  }
}

PerspectiveCamera.prototype.getViewRay = function (x, y, windowWidth, windowHeight) {
  if (this.frustum) {
    x += this.frustum.offset[0]
    y += this.frustum.offset[1]
    windowWidth = this.frustum.totalSize[0]
    windowHeight = this.frustum.totalSize[1]
  }
  let nx = 2 * x / windowWidth - 1
  let ny = 1 - 2 * y / windowHeight

  let hNear = 2 * Math.tan(this.fov / 2) * this.near
  let wNear = hNear * this.aspect

  nx *= (wNear * 0.5)
  ny *= (hNear * 0.5)

  let origin = [0, 0, 0]
  let direction = vec3.normalize([nx, ny, -this.near])
  let ray = [origin, direction]

  return ray
}

PerspectiveCamera.prototype.getWorldRay = function (x, y, windowWidth, windowHeight) {
  let ray = this.getViewRay(x, y, windowWidth, windowHeight)
  let origin = ray[0]
  let direction = ray[1]

  vec3.multMat4(origin, this.invViewMatrix)
  // this is correct as origin is [0, 0, 0] so direction is also a point
  vec3.multMat4(direction, this.invViewMatrix)

  // is this necessary?
  vec3.normalize(vec3.sub(direction, origin))

  return ray
}

module.exports = function createPerspectiveCamera (opts) {
  return new PerspectiveCamera(opts)
}
