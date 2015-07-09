var Vec2      = require('pex-math/Vec2');
var Vec3      = require('pex-math/Vec3');
var Vec4      = require('pex-math/Vec4');
var Mat4      = require('pex-math/Mat4');
var Quat      = require('pex-math/Quat');
var MathUtils = require('pex-math/Utils');


var DEFAULT_RADIUS_SCALE = 2.25;
var DEFAULT_SPEED = 0.095;
var DEFAULT_DISTANCE_STEP = 0.25;

var TEMP_VEC2_0 = Vec2.create();
var TEMP_VEC2_1 = Vec2.create();
var TEMP_VEC2_2 = Vec2.create();
var TEMP_VEC3_0 = Vec3.create();

function CameraArcball(camera, windowSize){
    this._center = null;
    this._radius = null;
    this._radiusScale = null;
    this._speed = null;

    this._bounds = Vec4.copy(bounds);

    this._distanceStep = DEFAULT_DISTANCE_STEP;
    this._distance     = camera.getDistance();
    this._distanceMax  = Number.MAX_VALUE;
    this._distanceMin  = Number.MIN_VALUE;

    this._posDown    = Vec2.create();
    this._posDownPtr = Vec3.create();
    this._posDragPtr = Vec3.create();

    this._orientCurr   = Quat.fromMat4(Quat.create(),Mat4.invert(Mat4.copy(camera.getViewMatrix())));
    this._orientDown   = Quat.create();
    this._orientDrag   = Quat.create();
    this._orientTarget = Quat.copy(this._orientCurr);

    this._matrix = Mat4.create();

    this._interactive = true;

    this._center = [windowSize[0] * 0.5,windowSize[1] * 0.5];

}

CameraArcball.prototype.setCamera = function(){

};

CameraArcball.prototype.setDistanceMin = function(){

};

CameraArcball.prototype.setDistanceMax = function(){

};

CameraArcball.prototype.setDistance = function(){

};

CameraArcball.prototype.getDistance = function(){

};

CameraArcball.prototype.enable = function(){
    this._enable = true;
};

CameraArcball.prototype.disable = function(){
    this._enable = false;
};

CameraArcball.prototype._updateRadius = function(){

};

CameraArcball.prototype._mapSphere = function(pos){
    pos = Vec2.set(TEMP_VEC2_2,pos);

    var dir = this._distance < 0 ? -1 : 1;
    Vec2.sub(pos,this._center);
    Vec2.scale(pos, 1.0 / this._radius);

    pos = Vec3.set3(TEMP_VEC3_0,pos[0],pos[1] * dir, 0);
    var len = Vec3.lengthSq(pos);
    if(len > 1.0){
        Vec3.normalize(pos);
    }
    else{
        pos[2] = Math.sqrt(1 - len);
    }
    return pos;
};

CameraArcball.prototype.apply = function(){

};

CameraArcball.prototype.setRadiusScale = function(){

};

CameraArcball.prototype.onMouseDown = function(e){
    if(!this._interactive){
        return;
    }
    var pos = Vec2.set2(TEMP_VEC2_0, e.x,1.0 - e.y);

    Vec2.set2(this._posDown, e.x, 1.0 - e.y);
    Vec3.set(this._posDownPtr, this._mapSphere(pos));
    Quat.set(this._orientDown, this._orientCurr);
    Quat.identity(this._orientDrag);
};

CameraArcball.prototype.onMouseDrag = function(e){
    if(!this._interactive){
        return;
    }
    var pos = Vec2.set(TEMP_VEC2_0, e.x, 1.0 - e.y);

    Vec2.set(this._posDragPtr, this._mapSphere(Vec2.set(TEMP_VEC2_1,pos)));


};

CameraArcball.prototype.onMouseUp = function(e){
    if(!this._interactive){
        return;
    }
};

CameraArcball.prototype.onMouseWheel = function(e){
    if(!this._interactive){
        return;
    }
};

CameraArcball.prototype.onWindowResize = function(e){
    var width  = e.width;
    var height = e.height;

};

module.exports = CameraArcball;