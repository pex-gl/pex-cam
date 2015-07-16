var AbstractCamera = require('./AbstractCamera');
var Mat4 = require('pex-math/Mat4');

var DEFAULT_NEAR = -10;
var DEFAULT_FAR  =  10;

function OrthoCamera(aspectRatio, near, far){
    AbstractCamera.call(this);

    near = near === undefined ? DEFAULT_NEAR : near;
    far  = far  === undefined ? DEFAULT_FAR  : far;

    this._frustumLeftInitial   = -1;
    this._frustumRightInitial  = -1;
    this._frustumBottomInitial = -1;
    this._frustumTopInitial    = -1;

    this._aspectRatio = aspectRatio;
    this.setOrtho(-aspectRatio, aspectRatio, -1, 1, near, far);
}

OrthoCamera.prototype = Object.create(AbstractCamera.prototype);
OrthoCamera.prototype.constructor = OrthoCamera;

OrthoCamera.prototype.setAspectRatio = function(aspectRatio){
    this._aspectRatio  = aspectRatio;
    this._frustumLeft  = this._frustumLeftInitial  = -aspectRatio;
    this._frustumRight = this._frustumRightInitial =  aspectRatio;
    this._matrixProjectionDirty = true;
};

OrthoCamera.prototype.setOrtho = function(left, right, bottom, top, near, far){
    this._frustumLeft   = this._frustumLeftInitial   = left;
    this._frustumRight  = this._frustumRightInitial  = right;
    this._frustumBottom = this._frustumBottomInitial = bottom;
    this._frustumTop    = this._frustumTopInitial    = top;
    this._near          = near;
    this._far           = far;
    this._matrixProjectionDirty = true;
};

OrthoCamera.prototype._updateProjectionMatrix = function(){
    if(!this._matrixProjectionDirty){
        return;
    }
    Mat4.ortho(this._matrixProjection, this._frustumLeft, this._frustumRight, this._frustumBottom, this._frustumTop, this._near, this._far);
    this._matrixProjectionDirty = false;
};

OrthoCamera.prototype.scaleFrustum = function(n){
    this._frustumLeft   = this._frustumLeftInitial * n;
    this._frustumRight  = this._frustumRightInitial * n;
    this._frustumBottom = this._frustumBottomInitial * n;
    this._frustumTop    = this._frustumTopInitial * n;
    this._matrixProjectionDirty = true;
};

module.exports = OrthoCamera;