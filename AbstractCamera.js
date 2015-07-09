var Mat4 = require('pex-math/Mat4');
var Vec2 = require('pex-math/Vec2');
var Vec3 = require('pex-math/Vec3');
var Vec4 = require('pex-math/Vec4');

var STR_ERROR_NOT_IMPLEMENTED = '%s not implemented.';

var Y_AXIS    = Vec3.yAxis();
var TEMP_VEC4 = Vec4.create();

function CameraAbstract(){
    this._position = [0,0,5];
    this._target   = Vec3.create();
    this._up       = Vec3.yAxis();

    this._aspectRatio = -1;

    this._fov  = 0;
    this._near = 0;
    this._far  = 0;

    this._frustumLeft   = -1;
    this._frustumRight  = -1;
    this._frustumBottom = -1;
    this._frustumTop    = -1;

    this._matrixProjection = Mat4.create();
    this._matrixView       = Mat4.create();

    this._matrixProjectionDirty = true;
    this._matrixViewDirty       = true;
}

CameraAbstract.prototype.setTarget = function(target){
    Vec3.set(this._target,target);
    this._matrixViewDirty = true;
};

CameraAbstract.prototype.getTarget = function(out){
    out = out === undefined ? Vec3.create() : out;
    Vec3.set(out,this._target);
};

CameraAbstract.prototype.setPosition = function(position){
    Vec3.set(this._position,position);
    this._matrixViewDirty = true;
};

CameraAbstract.prototype.getPosition = function(out){
    out = out === undefined ? Vec3.create() : out;
    Vec3.set(out, this._position);
};

CameraAbstract.prototype.setUp = function(up){
    Vec3.set(this._up, up);
    this._matrixViewDirty = true;
};

CameraAbstract.prototype.getUp = function(out){
    out = out === undefined ? Vec3.create() : out;
    Vec3.set(out, this._up);
};

CameraAbstract.prototype.lookAt = function(from, to, up){
    up = up === undefined ? Y_AXIS : up;

    Vec3.set(this._position,from);
    Vec3.set(this._target,to);
    Vec3.set(this._up,up);
    this._matrixViewDirty = true;
};

CameraAbstract.prototype.getDistance = function(){
    return Vec3.distance(this._target, this._position);
};

CameraAbstract.prototype.setNear = function(near){
    this._near = near;
    this._matrixProjectionDirty = true;
};

CameraAbstract.prototype.getNear = function(){
    return this._near;
};

CameraAbstract.prototype.setFar = function(far){
    this._far = far;
    this._matrixProjectionDirty = true;
};

CameraAbstract.prototype.getFar = function(){
    return this._far;
};

CameraAbstract.prototype.getAspectRatio = function(){
    return this._aspectRatio;
};

CameraAbstract.prototype.updateProjectionMatrix = function(){
    throw new Error(STR_ERROR_NOT_IMPLEMENTED.replace('%s','updateProjectionMatrix'));
};

CameraAbstract.prototype.updateViewMatrix = function(){
    if(!this._matrixViewDirty){
        return;
    }
    Mat4.lookAt(this._matrixView, this._position,this._target,this._up);
    this._matrixViewDirty = false;
};

CameraAbstract.prototype.updateMatrices = function(){
    this.updateProjectionMatrix();
    this.updateViewMatrix();
};

CameraAbstract.prototype.getProjectionMatrix = function(){
    return this._matrixProjection;
};

CameraAbstract.prototype.getViewMatrix = function(){
    return this._matrixView;
};

CameraAbstract.prototype.getScreenPos = function(point, width, height, out){
    out = out === undefined ? Vec2.create() : out;

    Vec4.fromVec3(TEMP_VEC4, point);
    Vec4.multMat4(TEMP_VEC4, this._matrixView);
    Vec4.multMat4(TEMP_VEC4 ,this._matrixProjection);

    Vec2.set2(out, TEMP_VEC4[0], TEMP_VEC4[1]);
    Vec2.scale(out, 1 / TEMP_VEC4[3]);
    out[0] = (out[0] * 0.5 + 0.5) * width;
    out[1] = (out[1] * 0.5 + 0.5) * height;

    return out;
};

CameraAbstract.prototype.getViewRay = function(point, width, height){
    throw new Error(STR_ERROR_NOT_IMPLEMENTED.replace('%s','getViewRay'));
};

CameraAbstract.prototype.getWorldRay = function(point, width, height){
    throw new Error(STR_ERROR_NOT_IMPLEMENTED.replace('%s','getWorldMatrix'));
};

CameraAbstract.prototype.getFrustumClippingPlanes = function(){
    throw new Error(STR_ERROR_NOT_IMPLEMENTED.replace('%s','getFrustumClippingPlanes'));
};

CameraAbstract.prototype.setFrustumOffset = function(x, y, width, height, widthTotal, heightTotal){
    throw new Error(STR_ERROR_NOT_IMPLEMENTED.replace('%s','setFrusumOffset'));
};

module.exports = CameraAbstract;