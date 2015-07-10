var AbstractCamera = require('./AbstractCamera');
var Vec2 = require('pex-math/Vec2');
var Vec3 = require('pex-math/Vec3');
var Vec4 = require('pex-math/Vec4');
var Mat4 = require('pex-math/Mat4');

var DEFAULT_FOV          = 60.0;
var DEFAULT_NEAR         = 0.01;
var DEFAULT_FAR          = 10.0;
var DEFAULT_ASPECT_RATIO = 4 / 3;

var TEMP_VEC2   = Vec2.create();
var TEMP_VEC3_0 = Vec3.create();
var TEMO_VEC3_1 = Vec3.create();
var TEMP_VEC3_2 = Vec3.create();
var TEMP_VEC4   = Vec4.create();
var TEMP_MAT4   = Mat4.create();

function PerspCamera(fov, aspectRatio, near, far){
    AbstractCamera.call(this);

    this._aspectRatio = aspectRatio;

    this.setPerspective(
        fov         === undefined ? DEFAULT_FOV : fov,
        aspectRatio === undefined ? DEFAULT_ASPECT_RATIO : aspectRatio,
        near        === undefined ? DEFAULT_NEAR : near,
        far         === undefined ? DEFAULT_FAR : far
    );

    this.updateViewMatrix();
}

PerspCamera.prototype = Object.create(AbstractCamera.prototype);
PerspCamera.prototype.constructor = PerspCamera;

PerspCamera.prototype.setFov = function(fov){
    this._fov = fov;
    this._matrixProjectionDirty = true;
};

PerspCamera.prototype.getFov = function(){
    return this._fov;
};

PerspCamera.prototype.setAspectRatio = function(aspectRatio){
    this._aspectRatio = aspectRatio;
    this._matrixProjectionDirty = true;
};

PerspCamera.prototype.setDistance = function(distance){
    Vec3.sub(this._position, this._target);
    Vec3.normalize(this._position);
    Vec3.scale(this._position, distance);
    this._matrixViewDirty = true;
};

PerspCamera.prototype.setPerspective = function(fov, aspectRatio, near, far){
    this._fov         = fov;
    this._aspectRatio = aspectRatio;
    this._near        = near;
    this._far         = far;
    this._matrixProjectionDirty = true;
    this.updateProjectionMatrix();
};

PerspCamera.prototype.updateProjectionMatrix = function(){
    if(!this._matrixProjectionDirty){
        return;
    }
    Mat4.perspective(this._matrixProjection, this._fov, this._aspectRatio, this._near, this._far);
    this._matrixProjectionDirty = false;
};

PerspCamera.prototype.getViewRay = function(point, width, height, out){
    out = out === undefined ? Vec2.create() : out;

    var width_2  = width * 0.5;
    var height_2 = height * 0.5;

    point = Vec2.set2(TEMP_VEC2, (point[0] - width_2) / width_2, -(point[1] - height_2) / height_2);

    var hnear = 2 * Math.tan(this._fov / 180 * Math.PI * 0.5) * this._near;
    var wnear = hnear * this._aspectRatio;

    point[0] *= hnear * 0.5;
    point[1] *= wnear * 0.5;

    var origin    = Vec3.toZero(TEMP_VEC3_0);
    var target    = Vec3.set3(TEMO_VEC3_1, point[0], point[1], -this._near);
    var direction = Vec3.normalize(Vec3.sub(Vec3.set(TEMP_VEC3_2, target), origin));

    out[0] = origin;
    out[1] = direction;

    return out;
};

PerspCamera.prototype.setFrustumOffset = function(x, y, width, height, widthTotal, heightTotal){
    widthTotal  = widthTotal === undefined ? width : widthTotal;
    heightTotal = heightTotal === undefined ? height : heightTotal;

    var near = this._near;
    var far  = this._far;

    var aspectRatio = widthTotal / heightTotal;

    var top     = Math.tan(this._fov * Math.PI / 180 * 0.5) * near;
    var bottom  = -top;
    var left    = aspectRatio * bottom;
    var right   = aspectRatio * top;
    var width_  = Math.abs(right - left);
    var height_ = Math.abs(top - bottom);
    var widthNormalized  = width_ / widthTotal;
    var heightNormalized = height_ / heightTotal;

    var l = left + x * widthNormalized;
    var r = left + (x + width) * widthNormalized;
    var b = top - (y + height) * heightNormalized;
    var t = top - y * heightNormalized;

    Mat4.frustum(this._matrixProjection, l, r, b, t, near, far);
};

module.exports = PerspCamera;