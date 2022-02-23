/**
 * @typedef {number} Radians
 */
/**
 * @typedef {number} Degrees
 */

/**
 * @typedef {Object} CameraView
 * @property {vec2} offset
 * @property {vec2} size
 * @property {vec2} totalSize
 */

/**
 * @typedef {Object} CameraOptions
 * @property {mat4} [projectionMatrix=mat4.create()]
 * @property {mat4} [invViewMatrix=mat4.create()]
 * @property {mat4} [viewMatrix=mat4.create()]
 * @property {vec3} [position=[0, 0, 3]]
 * @property {vec3} [target=[0, 0, 0]]
 * @property {vec3} [up=[0, 1, 0]]
 * @property {number} [aspect=1]
 * @property {number} [near=0.1]
 * @property {number} [far=100]
 * @property {CameraView} [view=null]
 */

/**
 * @typedef {Object} PerspectiveCameraOptions
 * @property {Radians} [fov=Math.PI / 3]
 */

/**
 * @typedef {Object} OrthographicCameraOptions
 * @property {number} [left=-1]
 * @property {number} [right=1]
 * @property {number} [bottom=-1]
 * @property {number} [top=1]
 * @property {number} [zoom=1]
 */

/**
 * @typedef {Object} OrbiterControlsOptions
 * @property {import("./camera.js").Camera} camera
 * @property {HTMLElement} [element=document]
 * @property {number} [easing=0.1]
 * @property {boolean} [zoom=true]
 * @property {boolean} [pan=true]
 * @property {boolean} [drag=true]
 * @property {number} [minDistance=0.1]
 * @property {number} [maxDistance=10]
 * @property {import("./types.js").Degrees} [minLat=-89.5]
 * @property {import("./types.js").Degrees} [maxLat=89.5]
 * @property {number} [minLon=-Infinity]
 * @property {number} [maxLon=Infinity]
 * @property {number} [panSlowdown=4]
 * @property {number} [zoomSlowdown=400]
 * @property {number} [dragSlowdown=4]
 * @property {boolean} [autoUpdate=true]
 */
