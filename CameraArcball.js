var Vec2      = require('pex-math/Vec2');
var Vec3      = require('pex-math/Vec3');
var Vec4      = require('pex-math/Vec4');
var Mat4      = require('pex-math/Mat4');
var Quat      = require('pex-math/Quat');
var MathUtils = require('pex-math/Utils');

var DEFAULT_RADIUS_SCALE = 1;
var DEFAULT_SPEED = 0.095;
var DEFAULT_DISTANCE_STEP = 0.25;

var TEMP_VEC2_0 = Vec2.create();
var TEMP_VEC2_1 = Vec2.create();
var TEMP_VEC2_2 = Vec2.create();
var TEMP_VEC3_0 = Vec3.create();

//http://jsperf.com/quaternion-slerp-implementations
//modified to prevent taking shortest path
function slerpLongest(a,b,t){
    var ax = a[0];
    var ay = a[1];
    var az = a[2];
    var aw = a[3];
    var bx = b[0];
    var by = b[1];
    var bz = b[2];
    var bw = b[3];

    var omega, cosom, sinom, scale0, scale1;

    cosom = ax * bx + ay * by + az * bz + aw * bw;

    if ( (1.0 - cosom) > 0.000001 ) {
        omega  = Math.acos(cosom);
        sinom  = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {
        scale0 = 1.0 - t;
        scale1 = t;
    }

    a[0] = scale0 * ax + scale1 * bx;
    a[1] = scale0 * ay + scale1 * by;
    a[2] = scale0 * az + scale1 * bz;
    a[3] = scale0 * aw + scale1 * bw;

    return a;
}

function CameraArcball(camera, windowWidth, windowHeight){
    this._camera = camera;
    this._center = null;
    this._radius = null;
    this._radiusScale = null;
    this._speed = null;

    this._boundsSize = [windowWidth,windowHeight];
    this._center     = [windowWidth * 0.5, windowHeight * 0.5];

    this.setRadiusScale(DEFAULT_RADIUS_SCALE);
    this.setSpeed(DEFAULT_SPEED);

    this._distanceStep   = DEFAULT_DISTANCE_STEP;
    this._distance       = camera.getDistance();
    this._distanceTarget = this._distance;
    this._distanceMax    = Number.MAX_VALUE;
    this._distanceMin    = Number.MIN_VALUE;

    this._posDown    = Vec2.create();
    this._posDownPtr = Vec3.create();
    this._posDragPtr = Vec3.create();

    this._orientCurr   = Quat.fromMat4(Quat.create(),Mat4.copy(camera.getViewMatrix()));
    this._orientDown   = Quat.create();
    this._orientDrag   = Quat.create();
    this._orientTarget = Quat.copy(this._orientCurr);

    this._matrix = Mat4.create();

    this._interactive = true;

    this._updateRadius();
}

CameraArcball.prototype.setLookDirection = function(direction){
    direction = Vec3.normalize(Vec3.copy(direction));
    var orientation = Quat.fromDirection(Quat.create(),direction);
    Quat.set(this._orientTarget,Quat.normalize(Quat.invert(orientation)));
};

CameraArcball.prototype.getBoundsSize = function(out){
    out = out === undefined ? Vec2.create() : out;
    return Vec2.set(out,this._boundsSize);
};

CameraArcball.prototype.setDistanceMin = function(min){
    this._distanceMin = min;
};

CameraArcball.prototype.setDistanceMax = function(max){
    this._distanceMax = max;
};

CameraArcball.prototype.setDistance = function(distance){
    this._distanceTarget = distance;
};

CameraArcball.prototype.getDistance = function(){
    return this._distance;
};

CameraArcball.prototype.setRadiusScale = function(scale){
    this._radiusScale = 1.0 / (1.0 / (scale === undefined ? DEFAULT_RADIUS_SCALE : scale) * 2);
    this._updateRadius();
};

CameraArcball.prototype.getRadiusScale = function(){
    return this._radiusScale;
};

CameraArcball.prototype.setSpeed = function(speed){
    this._speed = speed;
};

CameraArcball.prototype.getSpeed = function(){
    return this._speed;
};

CameraArcball.prototype.enable = function(){
    this._interactive = true;
};

CameraArcball.prototype.disable = function(){
    this._interactive = false;
};

CameraArcball.prototype.isEnabled = function(){
    return this._interactive;
};

CameraArcball.prototype._updateRadius = function(){
    var boundsSize = this._boundsSize;
    this._radius = Math.min(boundsSize[0],boundsSize[1]) * this._radiusScale;
};

CameraArcball.prototype._mapSphere = function(pos){
    pos = Vec2.set(TEMP_VEC2_0,pos);

    var dir = this._distance < 0 ? -1 : 1;
    pos = Vec2.sub(pos,this._center);
    pos = Vec2.scale(pos, 1.0 / this._radius);
    pos = Vec3.set3(TEMP_VEC2_1,pos[0],pos[1] * dir, 0);

    var len = Vec3.lengthSq(pos);
    if(len > 1.0){
        Vec3.normalize(pos);
    }
    else{
        pos[2] = Math.sqrt(1 - len);
    }

    return pos;
};

CameraArcball.prototype.onMouseDown = function(e){
    if(!this._interactive){
        return;
    }
    var boundsHeight = this._boundsSize[1];
    var mousePos     = Vec2.set2(TEMP_VEC2_0, e.x, e.y);
    this._posDown    = Vec2.set(this._posDown, mousePos);

    var pos = Vec2.set2(TEMP_VEC2_0, mousePos[0],boundsHeight - mousePos[1]);

    Vec3.set(this._posDownPtr, this._mapSphere(pos));
    Quat.set(this._orientDown, this._orientCurr);
    Quat.identity(this._orientDrag);
};

CameraArcball.prototype.onMouseDrag = function(e){
    if(!this._interactive){
        return;
    }

    var boundsHeight = this._boundsSize[1];
    var mousePos     = Vec2.set2(TEMP_VEC2_0, e.x, e.y);
    var pos          = Vec2.set2(TEMP_VEC2_0, mousePos[0], boundsHeight - mousePos[1]);

    var posDownPtr = this._posDownPtr;
    var posDragPtr = Vec3.set(this._posDragPtr,this._mapSphere(pos));
    var temp       = Vec3.cross(Vec3.set(Vec3.create(),posDownPtr), posDragPtr);

    Quat.set4(this._orientDrag,temp[0],temp[1],temp[2],Vec3.dot(posDownPtr,posDragPtr));
    Quat.set(this._orientTarget, this._orientDrag);
    Quat.mult(this._orientTarget, this._orientDown);
};

CameraArcball.prototype.onMouseScroll = function(e){
    if(!this._interactive){
        return;
    }
    var direction = e.dy < 0 ? -1 : e.dy > 0 ? 1 : 0;
    if(direction == 0){
        return;
    }
    this._distanceTarget += direction * -1 * this._distanceStep;
    this._distanceTarget  = Math.max(this._distanceMin, Math.min(this._distanceTarget,this._distanceMax));
};

CameraArcball.prototype.onWindowResize = function(e){
    var width  = e.width;
    var height = e.height;
    Vec2.set2(this._boundsSize,width,height);
    Vec2.set2(this._center, width * 0.5, height * 0.5);
    this._updateRadius();
};

CameraArcball.prototype.apply = function(){
    this._distance += (this._distanceTarget - this._distance) * this._speed;

    slerpLongest(this._orientCurr,this._orientTarget,this._speed);
    Mat4.fromQuat(this._matrix,this._orientCurr);

    var viewMatrix = this._camera.getViewMatrix();
    Mat4.identity(viewMatrix);
    Mat4.setTranslation3(viewMatrix,0,0,-this._distance);
    Mat4.mult(viewMatrix,this._matrix);
};

module.exports = CameraArcball;