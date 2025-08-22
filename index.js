/**
 * Re-export classes and factory functions
 * @module pex-cam
 */

import PerspectiveCamera from "./perspective.js";
import OrthographicCamera from "./orthographic.js";
import OrbiterControls from "./orbiter.js";

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

export { PerspectiveCamera, OrthographicCamera, OrbiterControls };
