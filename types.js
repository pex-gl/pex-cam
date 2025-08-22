/**
 * @typedef {number} Radians
 */
/**
 * @typedef {number} Degrees
 */

/**
 * @typedef {object} CameraView
 * @property {import("pex-math").vec2} offset
 * @property {import("pex-math").vec2} size
 * @property {import("pex-math").vec2} totalSize
 */

/**
 * @typedef {object} CameraOptions
 * @property {import("pex-math").mat4} [projectionMatrix=mat4.create()]
 * @property {import("pex-math").mat4} [invViewMatrix=mat4.create()]
 * @property {import("pex-math").mat4} [viewMatrix=mat4.create()]
 * @property {import("pex-math").vec3} [position=[0, 0, 3]]
 * @property {import("pex-math").vec3} [target=[0, 0, 0]]
 * @property {import("pex-math").vec3} [up=[0, 1, 0]]
 * @property {number} [aspect=1]
 * @property {number} [near=0.1]
 * @property {number} [far=100]
 * @property {CameraView} [view=null]
 */

/**
 * @typedef {object} PerspectiveCameraOptions
 * @property {Radians} [fov=Math.PI / 3]
 */

/**
 * @typedef {object} OrthographicCameraOptions
 * @property {number} [left=-1]
 * @property {number} [right=1]
 * @property {number} [bottom=-1]
 * @property {number} [top=1]
 * @property {number} [zoom=1]
 */

/**
 * @typedef {object} OrbiterControlsOptions
 * @property {import("./camera.js").Camera} camera
 * @property {HTMLElement} [element=document]
 * @property {number} [easing=0.1]
 * @property {boolean} [zoom=true]
 * @property {boolean} [pan=true]
 * @property {boolean} [drag=true]
 * @property {number} [minDistance=0.01]
 * @property {number} [maxDistance=Infinity]
 * @property {Degrees} [minLat=-89.5]
 * @property {Degrees} [maxLat=89.5]
 * @property {number} [minLon=-Infinity]
 * @property {number} [maxLon=Infinity]
 * @property {number} [panSlowdown=4]
 * @property {number} [zoomSlowdown=400]
 * @property {number} [dragSlowdown=4]
 * @property {boolean} [autoUpdate=true]
 */

export {};
