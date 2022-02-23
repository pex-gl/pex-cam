/**
 * @typedef {number} Radians
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
 */
