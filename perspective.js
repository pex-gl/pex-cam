const Mat4 = require('pex-math/Mat4')

function createPerspectiveCamera (opts) {
  // const projectionMatrix = Mat4.perspective([], 60, gl.canvas.width / gl.canvas.height, 0.1, 100)
  // const viewMatrix = Mat4.lookAt([], [2, 2, 2], [0, 0, 0], [0, 1, 0])
  // const modelMatrix = Mat4.create()

  const initialState = {
    projectionMatrix: Mat4.create(),
    viewMatrix: Mat4.create(),
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
      Mat4.lookAt(
        camera.viewMatrix,
        camera.position,
        camera.target,
        camera.up
      )
    }

    if (opts.fov || opts.aspect || opts.near || opts.far) {
      Mat4.perspective(
        camera.projectionMatrix,
        camera.fov / Math.PI * 180,
        camera.aspect,
        camera.near,
        camera.far
      )
    }

    return camera
  }

  Object.assign(arcball, initialState)

  return camera(opts)
}

module.exports = createPerspectiveCamera
