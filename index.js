/**
 * Re-export classes and factory functions
 * @module index
 */

import Camera from "./camera.js";
import PerspectiveCamera from "./perspective.js";
import OrthographicCamera from "./orthographic.js";
import OrbiterControls from "./orbiter.js";

/**
 * Re-export camera and controls
 * @returns {Object}
 */
export { Camera, PerspectiveCamera, OrthographicCamera, OrbiterControls };

/**
 * Factory function for perspective camera
 * @param {import("./types.js").CameraOptions & import("./types.js").PerspectiveCameraOptions} opts
 * @returns {PerspectiveCamera}
 */
export const perspective = (opts) => new PerspectiveCamera(opts);

/**
 * Factory function for orthographic camera
 * @param {import("./types.js").CameraOptions & import("./types.js").OrthographicCameraOptions} opts
 * @returns {OrthographicCamera}
 */
export const orthographic = (opts) => new OrthographicCamera(opts);

/**
 * Factory function for orbiter controls
 * @param {import("./types.js").OrbiterControlsOptions} opts
 * @returns {OrbiterControls}
 */
export const orbiter = (opts) => new OrbiterControls(opts);
