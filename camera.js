import { mat4 } from "pex-math";

/**
 * An interface for cameras to extend
 */
class Camera {
  // Static getter to get different mat for each instances
  static get DEFAULT_OPTIONS() {
    return {
      projectionMatrix: mat4.create(),
      invViewMatrix: mat4.create(),
      viewMatrix: mat4.create(),
      position: [0, 0, 3],
      target: [0, 0, 0],
      up: [0, 1, 0],
      aspect: 1,
      near: 0.1,
      far: 100,
      view: null,
    };
  }

  /**
   * Update the camera
   * @param {import("./types.js").CameraOptions} opts
   */
  set(opts) {
    Object.assign(this, opts);

    if (opts.position || opts.target || opts.up) {
      mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
      mat4.set(this.invViewMatrix, this.viewMatrix);
      mat4.invert(this.invViewMatrix);
    }
  }
}

export default Camera;
