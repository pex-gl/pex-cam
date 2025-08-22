import { mat4, vec3 } from "pex-math";

import Camera from "./camera.js";

/**
 * A class to create an orthographic camera
 * @augments Camera
 */
class OrthographicCamera extends Camera {
  static get DEFAULT_OPTIONS() {
    return {
      left: -1,
      right: 1,
      bottom: -1,
      top: 1,
      zoom: 1,
    };
  }

  /**
   * Create an instance of PerspectiveCamera
   * @param {import("./types.js").CameraOptions & import("./types.js").OrthographicCameraOptions} opts
   */
  constructor(opts = {}) {
    super();

    this.set({
      ...Camera.DEFAULT_OPTIONS,
      ...OrthographicCamera.DEFAULT_OPTIONS,
      ...opts,
    });
  }

  /**
   * Update the camera
   * @param {import("./types.js").CameraOptions & import("./types.js").OrthographicCameraOptions} opts
   */
  set(opts) {
    super.set(opts);

    if (
      opts.left ||
      opts.right ||
      opts.bottom ||
      opts.top ||
      opts.zoom ||
      opts.near ||
      opts.far ||
      opts.view
    ) {
      const dx = (this.right - this.left) / (2 / this.zoom);
      const dy = (this.top - this.bottom) / (2 / this.zoom);
      const cx = (this.right + this.left) / 2;
      const cy = (this.top + this.bottom) / 2;

      let left = cx - dx;
      let right = cx + dx;
      let top = cy + dy;
      let bottom = cy - dy;

      if (this.view) {
        const zoomW =
          1 / this.zoom / (this.view.size[0] / this.view.totalSize[0]);
        const zoomH =
          1 / this.zoom / (this.view.size[1] / this.view.totalSize[1]);
        const scaleW = (this.right - this.left) / this.view.size[0];
        const scaleH = (this.top - this.bottom) / this.view.size[1];

        left += scaleW * (this.view.offset[0] / zoomW);
        right = left + scaleW * (this.view.size[0] / zoomW);
        top -= scaleH * (this.view.offset[1] / zoomH);
        bottom = top - scaleH * (this.view.size[1] / zoomH);
      }

      mat4.ortho(
        this.projectionMatrix,
        left,
        right,
        bottom,
        top,
        this.near,
        this.far
      );
    }
  }

  getViewRay(x, y, windowWidth, windowHeight) {
    if (this.view) {
      x += this.view.offset[0];
      y += this.view.offset[1];
      windowWidth = this.view.totalSize[0];
      windowHeight = this.view.totalSize[1];
    }

    // [origin, direction]
    return [
      [0, 0, 0],
      vec3.normalize([
        (x * (this.right - this.left)) / this.zoom / windowWidth,
        ((1 - y) * (this.top - this.bottom)) / this.zoom / windowHeight,
        -this.near,
      ]),
    ];
  }
}

export default OrthographicCamera;
