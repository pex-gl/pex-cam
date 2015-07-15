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
};

PerspCamera.prototype._updateProjectionMatrix = function(){
    if(!this._matrixProjectionDirty){
        return;
    }
    Mat4.perspective(this._matrixProjection, this._fov, this._aspectRatio, this._near, this._far);
    this._matrixProjectionDirty = false;
};

PerspCamera.prototype.getViewRay = function(point, width, height, out){
    if(out === undefined){
        out = [[0,0],[0,0]];
    }
    else {
        out[0] = out[0] === undefined ? [0,0] : out[0];
        out[1] = out[1] === undefined ? [0,0] : out[1];
    }

    var x =  point[0] / width * 2 - 1;
    var y = -point[1] / height * 2 + 1;

    var hNear = 2 * Math.tan(this._fov / 180 * Math.PI / 2) * this._near;
    var wNear = hNear * this._aspectRatio;

    x *= (wNear * 0.5);
    y *= (hNear * 0.5);

    Vec3.set3(out[0],0,0,0);
    Vec3.normalize(Vec3.set3(out[1], x, y, -this._near));

    return out;
};

PerspCamera.prototype.getWorldRay = function(point, width, height, out){
    if(out === undefined){
        out = [[0,0],[0,0]];
    }
    else {
        out[0] = out[0] === undefined ? [0,0] : out[0];
        out[1] = out[1] === undefined ? [0,0] : out[1];
    }
    var viewRay       = this.getViewRay(point,width,height,out);
    var invViewMatrix = Mat4.invert(Mat4.set(TEMP_MAT4,this._matrixView));

    Vec3.multMat4(viewRay[0],invViewMatrix);
    Vec3.multMat4(viewRay[1],invViewMatrix);
    Vec3.normalize(Vec3.sub(viewRay[1],viewRay[0]));

    return viewRay;
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