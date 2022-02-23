import { vec3, mat4 } from "pex-math";

import Camera from "./camera.js";

export class PerspectiveCamera extends Camera {
  static get DEFAULT_OPTIONS() {
    return {
      fov: Math.PI / 3,
    };
  }

  constructor(opts = {}) {
    super();

    this.set({
      ...Camera.DEFAULT_OPTIONS,
      ...PerspectiveCamera.DEFAULT_OPTIONS,
      ...opts,
    });
  }

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

  getWorldRay(x, y, windowWidth, windowHeight) {
    let ray = this.getViewRay(x, y, windowWidth, windowHeight);
    let origin = ray[0];
    let direction = ray[1];

    vec3.multMat4(origin, this.invViewMatrix);
    // this is correct as origin is [0, 0, 0] so direction is also a point
    vec3.multMat4(direction, this.invViewMatrix);

    // is this necessary?
    vec3.normalize(vec3.sub(direction, origin));

    return ray;
  }
}

export default function createPerspectiveCamera(opts) {
  return new PerspectiveCamera(opts);
}
