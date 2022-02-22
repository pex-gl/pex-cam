import { vec3, mat4 } from "pex-math";

function setFrustumOffset(
  camera,
  x,
  y,
  width,
  height,
  widthTotal = width,
  heightTotal = height
) {
  const near = camera.near;
  const far = camera.far;
  const fov = camera.fov;

  const aspectRatio = widthTotal / heightTotal;

  const top = Math.tan(fov * 0.5) * near;
  const bottom = -top;
  const left = aspectRatio * bottom;
  const right = aspectRatio * top;
  const width_ = Math.abs(right - left);
  const height_ = Math.abs(top - bottom);
  const widthNormalized = width_ / widthTotal;
  const heightNormalized = height_ / heightTotal;

  const l = left + x * widthNormalized;
  const r = left + (x + width) * widthNormalized;
  const b = top - (y + height) * heightNormalized;
  const t = top - y * heightNormalized;

  camera.aspect = aspectRatio;
  mat4.frustum(camera.projectionMatrix, l, r, b, t, near, far);
}

class PerspectiveCamera {
  constructor(opts) {
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
      far: 100,
    });

    this.set(opts);
  }

  set(opts) {
    Object.assign(this, opts);

    if (opts.position || opts.target || opts.up) {
      mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
      mat4.set(this.invViewMatrix, this.viewMatrix);
      mat4.invert(this.invViewMatrix);
    }

    if (opts.fov || opts.aspect || opts.near || opts.far) {
      mat4.perspective(
        this.projectionMatrix,
        this.fov,
        this.aspect,
        this.near,
        this.far
      );
    }

    if (this.frustum) {
      setFrustumOffset(
        this,
        this.frustum.offset[0],
        this.frustum.offset[1],
        this.frustum.size[0],
        this.frustum.size[1],
        this.frustum.totalSize[0],
        this.frustum.totalSize[1]
      );
    }
  }

  getViewRay(x, y, windowWidth, windowHeight) {
    if (this.frustum) {
      x += this.frustum.offset[0];
      y += this.frustum.offset[1];
      windowWidth = this.frustum.totalSize[0];
      windowHeight = this.frustum.totalSize[1];
    }
    let nx = (2 * x) / windowWidth - 1;
    let ny = 1 - (2 * y) / windowHeight;

    let hNear = 2 * Math.tan(this.fov / 2) * this.near;
    let wNear = hNear * this.aspect;

    nx *= wNear * 0.5;
    ny *= hNear * 0.5;

    let origin = [0, 0, 0];
    let direction = vec3.normalize([nx, ny, -this.near]);
    let ray = [origin, direction];

    return ray;
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
