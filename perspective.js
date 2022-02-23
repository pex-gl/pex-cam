import { vec3, mat4 } from "pex-math";

import Camera from "./camera.js";

/**
 * A class to create a perspective camera
 * @extends Camera
 * @property {import("./types.js").Radians} [fov=Math.PI / 3]
 */
class PerspectiveCamera extends Camera {
  static get DEFAULT_OPTIONS() {
    return {
      fov: Math.PI / 3,
    };
  }

  /**
   * Create an instance of PerspectiveCamera
   * @param {import("./types.js").CameraOptions & import("./types.js").PerspectiveCameraOptions} opts
   */
  constructor(opts = {}) {
    super();

    this.set({
      ...Camera.DEFAULT_OPTIONS,
      ...PerspectiveCamera.DEFAULT_OPTIONS,
      ...opts,
    });
  }

  /**
   * Update the camera
   * @param {import("./types.js").CameraOptions & import("./types.js").PerspectiveCameraOptions} opts
   */
  set(opts) {
    super.set(opts);

    if (opts.fov || opts.aspect || opts.near || opts.far || opts.view) {
      if (this.view) {
        const aspectRatio = this.view.totalSize[0] / this.view.totalSize[1];

        const top = Math.tan(this.fov * 0.5) * this.near;
        const bottom = -top;
        const left = aspectRatio * bottom;
        const right = aspectRatio * top;
        const width = Math.abs(right - left);
        const height = Math.abs(top - bottom);
        const widthNormalized = width / this.view.totalSize[0];
        const heightNormalized = height / this.view.totalSize[1];

        const l = left + this.view.offset[0] * widthNormalized;
        const r =
          left + (this.view.offset[0] + this.view.size[0]) * widthNormalized;
        const b =
          top - (this.view.offset[1] + this.view.size[1]) * heightNormalized;
        const t = top - this.view.offset[1] * heightNormalized;

        mat4.frustum(this.projectionMatrix, l, r, b, t, this.near, this.far);
      } else {
        mat4.perspective(
          this.projectionMatrix,
          this.fov,
          this.aspect,
          this.near,
          this.far
        );
      }
    }
  }

  /**
   * Create a picking ray in view (camera) coordinates
   * @param {number} x mouse x
   * @param {number} y mouse y
   * @param {number} windowWidth
   * @param {number} windowHeight
   * @returns {ray}
   */
  getViewRay(x, y, windowWidth, windowHeight) {
    if (this.view) {
      x += this.view.offset[0];
      y += this.view.offset[1];
      windowWidth = this.view.totalSize[0];
      windowHeight = this.view.totalSize[1];
    }
    let nx = (2 * x) / windowWidth - 1;
    let ny = 1 - (2 * y) / windowHeight;

    const hNear = 2 * Math.tan(this.fov / 2) * this.near;
    const wNear = hNear * this.aspect;

    nx *= wNear * 0.5;
    ny *= hNear * 0.5;

    // [origin, direction]
    return [[0, 0, 0], vec3.normalize([nx, ny, -this.near])];
  }

  /**
   * Create a picking ray in world coordinates
   * @param {number} x
   * @param {number} y
   * @param {number} windowWidth
   * @param {number} windowHeight
   * @returns {ray}
   */
  getWorldRay(x, y, windowWidth, windowHeight) {
    let ray = this.getViewRay(x, y, windowWidth, windowHeight);
    const origin = ray[0];
    const direction = ray[1];

    vec3.multMat4(origin, this.invViewMatrix);
    // this is correct as origin is [0, 0, 0] so direction is also a point
    vec3.multMat4(direction, this.invViewMatrix);

    // TODO: is this necessary?
    vec3.normalize(vec3.sub(direction, origin));

    return ray;
  }
}

export default PerspectiveCamera;
