import { vec2, vec3, utils } from "pex-math";
import { ray } from "pex-geom";

import interpolateAngle from "interpolate-angle";
import latLonToXyz from "latlon-to-xyz";
import xyzToLatLon from "xyz-to-latlon";
import eventOffset from "mouse-event-offset";

const { clamp, lerp, toRadians, toDegrees } = utils;

/**
 * Camera controls to orbit around a target
 */
class OrbiterControls {
  static get DEFAULT_OPTIONS() {
    return {
      element: document,
      easing: 0.1,

      zoom: true,
      pan: true,
      drag: true,

      minDistance: 0.1,
      maxDistance: 10,
      minLat: -89.5,
      maxLat: 89.5,
      minLon: -Infinity,
      maxLon: Infinity,
      panSlowdown: 4,
      zoomSlowdown: 400,
      dragSlowdown: 4,

      autoUpdate: true,
    };
  }

  get domElement() {
    return this.element === document ? this.element.body : this.element;
  }

  /**
   * Create an instance of OrbiterControls
   * @param {import("./types.js").OrbiterControlsOptions} opts
   */
  constructor(opts) {
    // Internals
    // Set initially by .set
    this.lat = null; // Y
    this.lon = null; // XZ
    this.currentLat = null;
    this.currentLon = null;
    this.distance = null;
    this.currentDistance = null;

    // Updated by user interaction
    this.panning = false;
    this.dragging = false;
    this.zooming = false;
    this.width = 0;
    this.height = 0;

    this.zoomTouchDistance = null;

    this.panPlane = null;
    this.clickTarget = [0, 0, 0];
    this.clickPosWorld = [0, 0, 0];
    this.clickPosPlane = [0, 0, 0];
    this.dragPos = [0, 0, 0];
    this.dragPosWorld = [0, 0, 0];
    this.dragPosPlane = [0, 0, 0];

    // TODO: add ability to set lat/lng instead of position/target
    this.set({
      ...OrbiterControls.DEFAULT_OPTIONS,
      ...opts,
    });
    this.setup();
  }

  /**
   * Update the control
   * @param {import("./types.js").OrbiterOptions} opts
   */
  set(opts) {
    Object.assign(this, opts);

    if (opts.camera) {
      const latLon = xyzToLatLon(
        vec3.normalize(
          vec3.sub(vec3.copy(opts.camera.position), opts.camera.target)
        )
      );
      const distance =
        opts.distance ||
        vec3.distance(opts.camera.position, opts.camera.target);

      this.lat = latLon[0];
      this.lon = latLon[1];
      this.currentLat = this.lat;
      this.currentLon = this.lon;
      this.distance = distance;
      this.currentDistance = this.distance;
    }

    if (Object.getOwnPropertyDescriptor(opts, "autoUpdate")) {
      if (this.autoUpdate) {
        const self = this;
        this.rafHandle = requestAnimationFrame(function tick() {
          self.updateCamera();
          if (self.autoUpdate) self.rafHandle = requestAnimationFrame(tick);
        });
      } else if (this.rafHandle) {
        cancelAnimationFrame(this.rafHandle);
      }
    }
  }

  updateCamera() {
    // instad of rotating the object we want to move camera around it
    if (!this.camera) return;

    const position = this.camera.position;
    const target = this.camera.target;

    this.lat = clamp(this.lat, this.minLat, this.maxLat);

    if (this.minLon !== -Infinity && this.maxLon !== Infinity) {
      this.lon = clamp(this.lon, this.minLon, this.maxLon) % 360;
    }

    this.currentLat = toDegrees(
      interpolateAngle(
        (toRadians(this.currentLat) + 2 * Math.PI) % (2 * Math.PI),
        (toRadians(this.lat) + 2 * Math.PI) % (2 * Math.PI),
        this.easing
      )
    );

    this.currentLon += (this.lon - this.currentLon) * this.easing;

    this.currentDistance = lerp(
      this.currentDistance,
      this.distance,
      this.easing
    );

    // Set position from lat/lon
    latLonToXyz(this.currentLat, this.currentLon, position);

    // Move position according to distance and target
    vec3.scale(position, this.currentDistance);
    vec3.add(position, target);

    if (this.camera.zoom) this.camera.set({ zoom: vec3.length(position) });
    this.camera.set({ position });
  }

  updateWindowSize() {
    const width = this.domElement.clientWidth || this.domElement.innerWidth;
    const height = this.domElement.clientHeight || this.domElement.innerHeight;

    if (width !== this.width) this.width = width;
    if (height !== this.height) this.height = height;
  }

  handleDragStart(position) {
    this.dragging = true;
    this.dragPos = position;
  }

  handlePanZoomStart(touch0, touch1) {
    this.dragging = false;

    if (this.zoom && touch1) {
      this.zooming = true;
      this.zoomTouchDistance = vec2.distance(touch1, touch0);
    }

    const camera = this.camera;

    if (this.pan && camera) {
      this.panning = true;
      this.updateWindowSize();

      // TODO: use dragPos?
      const clickPosWindow = touch1
        ? [(touch0[0] + touch1[0]) * 0.5, (touch0[1] + touch1[1]) * 0.5]
        : touch0;

      vec3.set(this.clickTarget, camera.target);
      const targetInViewSpace = vec3.multMat4(
        vec3.copy(this.clickTarget),
        camera.viewMatrix
      );
      this.panPlane = [targetInViewSpace, [0, 0, 1]];

      ray.hitTestPlane(
        camera.getViewRay(
          clickPosWindow[0],
          clickPosWindow[1],
          this.width,
          this.height
        ),
        this.panPlane[0],
        this.panPlane[1],
        this.clickPosPlane
      );
    }
  }

  handleDragMove(position) {
    const dx = position[0] - this.dragPos[0];
    const dy = position[1] - this.dragPos[1];

    this.lat += dy / this.dragSlowdown;
    this.lon -= dx / this.dragSlowdown;

    this.dragPos = position;
  }

  handlePanZoomMove(touch0, touch1) {
    if (this.zoom && touch1) {
      const distance = vec2.distance(touch1, touch0);
      this.handleZoom(this.zoomTouchDistance - distance);
      this.zoomTouchDistance = distance;
    }

    const camera = this.camera;

    if (this.pan && camera && this.panPlane) {
      const dragPosWindow = touch1
        ? [(touch0[0] + touch1[0]) * 0.5, (touch0[1] + touch1[1]) * 0.5]
        : touch0;

      ray.hitTestPlane(
        camera.getViewRay(
          dragPosWindow[0],
          dragPosWindow[1],
          this.width,
          this.height
        ),
        this.panPlane[0],
        this.panPlane[1],
        this.dragPosPlane
      );

      vec3.multMat4(
        vec3.set(this.clickPosWorld, this.clickPosPlane),
        camera.invViewMatrix
      );
      vec3.multMat4(
        vec3.set(this.dragPosWorld, this.dragPosPlane),
        camera.invViewMatrix
      );

      const diffWorld = vec3.sub(
        vec3.copy(this.dragPosWorld),
        this.clickPosWorld
      );
      camera.set({
        distance: this.distance,
        target: vec3.sub(vec3.copy(this.clickTarget), diffWorld),
      });
    }
  }

  handleZoom(dy) {
    this.distance *= 1 + dy / this.zoomSlowdown;
    this.distance = clamp(this.distance, this.minDistance, this.maxDistance);
  }

  handleEnd() {
    this.dragging = false;
    this.panning = false;
    this.zooming = false;
    this.panPlane = null;
  }

  setup() {
    this.onPointerDown = (event) => {
      const pan =
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        (event.touches && event.touches.length === 2);

      const touch0 = eventOffset(
        event.touches ? event.touches[0] : event,
        this.domElement
      );
      if (this.drag && !pan) {
        this.handleDragStart(touch0);
      } else if ((this.pan || this.zoom) && pan) {
        const touch1 =
          event.touches && eventOffset(event.touches[1], this.domElement);
        this.handlePanZoomStart(touch0, touch1);
      }
    };

    this.onPointerMove = (event) => {
      const touch0 = eventOffset(
        event.touches ? event.touches[0] : event,
        this.domElement
      );
      if (this.dragging) {
        this.handleDragMove(touch0);
      } else if (this.panning || this.zooming) {
        if (event.touches && !event.touches[1]) return;
        const touch1 =
          event.touches && eventOffset(event.touches[1], this.domElement);
        this.handlePanZoomMove(touch0, touch1);
      }
    };

    this.onPointerUp = () => {
      this.handleEnd();
    };

    this.onTouchStart = (event) => {
      event.preventDefault();

      if (event.touches.length <= 2) this.onPointerDown(event);
    };

    this.onTouchMove = (event) => {
      !!event.cancelable && event.preventDefault();

      if (event.touches.length <= 2) this.onPointerMove(event);
    };

    this.onWheel = (event) => {
      if (!this.zoom) return;

      event.preventDefault();
      this.handleZoom(event.deltaY);
    };

    this.element.addEventListener("mousedown", this.onPointerDown);
    this.element.addEventListener("wheel", this.onWheel, { passive: false });

    this.element.addEventListener("touchstart", this.onTouchStart);
    this.element.addEventListener("touchmove", this.onTouchMove, {
      passive: false,
    });
    this.element.addEventListener("touchend", this.onPointerUp);

    document.addEventListener("mousemove", this.onPointerMove);
    document.addEventListener("mouseup", this.onPointerUp);
  }

  /**
   * Remove all event listeners
   */
  dispose() {
    if (this.rafHandle) cancelAnimationFrame(this.rafHandle);

    this.element.removeEventListener("mousedown", this.onPointerDown);
    this.element.removeEventListener("wheel", this.onWheel);

    this.element.removeEventListener("touchstart", this.onTouchStart);
    this.element.removeEventListener("touchmove", this.onPointerMove);
    this.element.removeEventListener("touchend", this.onPointerUp);

    document.removeEventListener("mousemove", this.onPointerMove);
    document.removeEventListener("mouseup", this.onPointerUp);
  }
}

export default OrbiterControls;
