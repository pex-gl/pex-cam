var Vec2  = require('pex-math/Vec2');
var Vec3  = require('pex-math/Vec3');
var Mat4  = require('pex-math/Mat4');
var Quat  = require('pex-math/Quat');
var Plane = require('pex-geom/Plane');

//https://www.talisman.org/~erlkonig/misc/shoemake92-arcball.pdf

var DEFAULT_RADIUS_SCALE = 1.0;
var DEFAULT_SPEED = 0.35;
var DEFAULT_DISTANCE_STEP = 0.05;

var TEMP_VEC2_0 = Vec2.create();
var TEMP_VEC2_1 = Vec2.create();
var TEMP_VEC3_0 = Vec3.create();
var TEMP_VEC3_1 = Vec3.create();
var TEMP_VEC3_2 = Vec3.create();
var TEMP_QUAT_0 = Quat.create();
var TEMP_QUAT_1 = Quat.create();

var X_AXIS = [1,0,0];
var Y_AXIS = [0,1,0];
var Z_AXIS = [0,0,1];

var ConstrainAxisMode = {
    NONE   : -1,
    CAMERA : 0,
    WORLD  : 1
};

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

function Arcball(camera, windowWidth, windowHeight){
    this._camera = null;;

    this._boundsSize = [windowWidth,windowHeight];
    this._center     = [windowWidth * 0.5, windowHeight * 0.5];

    this._radius      = null;
    this._radiusScale = null;
    this.setRadiusScale(DEFAULT_RADIUS_SCALE);

    this._speed = null;
    this.setSpeed(DEFAULT_SPEED);

    this._zoom = false;

    this._distanceStep   = DEFAULT_DISTANCE_STEP;
    this._distance       = 0;
    this._distancePrev   = 0;
    this._distanceTarget = 0;
    this._distanceMax    = Number.MAX_VALUE;
    this._distanceMin    = Number.MIN_VALUE;

    this._drag = false;

    this._posDown    = Vec2.create();
    this._posDrag    = Vec2.create();
    this._posDownPtr = Vec3.create();
    this._posDragPtr = Vec3.create();
    this._posMovePtr = Vec3.create();

    this._orientCurr   = Quat.create();
    this._orientDown   = Quat.create();
    this._orientDrag   = Quat.create();
    this._orientTarget = Quat.create();

    this._pan = false;

    this._targetCameraView          = Vec3.create();
    this._targetCameraWorld         = Vec3.create();
    this._targetCameraWorldOriginal = Vec3.create();

    this._planeTargetView   = Plane.create();
    this._planeTargetWorld  = Plane.create();

    this._planePosDownView = Vec3.create();
    this._planePosDragView = Vec3.create();

    this._planePosDownWorld = Vec3.create();
    this._planePosDragWorld = Vec3.create();

    this._constrain           = false;
    this._constrainAxes       = [Vec3.copy(X_AXIS), Vec3.copy(Y_AXIS), Vec3.copy(Z_AXIS)];
    this._constrainAxisIndex  = 1;
    this._constrainMode       = ConstrainAxisMode.WORLD;
    this._constrainModePrev   = -1;

    this._interactive = true;

    this._updateRadius();
    this.setCamera(camera);
}

Arcball.prototype.setCamera = function(camera){
    this._camera         = camera;
    this._distance       = camera.getDistance();
    this._distancePrev   = this._distance;
    this._distanceTarget = this._distance;

    Vec2.toZero(this._posDown);
    Vec2.toZero(this._posDrag);
    Vec3.toZero(this._posDownPtr);
    Vec3.toZero(this._posDragPtr);
    Vec3.toZero(this._posMovePtr);

    Quat.fromMat4(this._orientCurr,camera.getViewMatrix());
    Quat.identity(this._orientDown);
    Quat.identity(this._orientDrag);
    Quat.set(this._orientTarget,this._orientCurr);

    Vec3.toZero(this._targetCameraView);
    Vec3.toZero(this._targetCameraWorld);
    Vec3.set(this._targetCameraWorldOriginal,camera.getTarget());

    Vec3.set3(this._planeTargetView[0],0,0,0);
    Vec3.set3(this._planeTargetView[1],0,1,0);

    Vec3.set3(this._planeTargetWorld[0],0,0,0);
    Vec3.set3(this._planeTargetWorld[1],0,1,0);

    Vec3.toZero(this._planePosDownView);
    Vec3.toZero(this._planePosDragView);

    Vec3.toZero(this._planePosDownWorld);
    Vec3.toZero(this._planePosDragWorld);
};

Arcball.prototype.setLookDirection = function(direction){
    direction = Vec3.normalize(Vec3.copy(direction));
    var orientation = Quat.fromDirection(Quat.create(),direction);
    Quat.set(this._orientTarget,Quat.normalize(Quat.invert(orientation)));
};

Arcball.prototype.getBoundsSize = function(out){
    out = out === undefined ? Vec2.create() : out;
    return Vec2.set(out,this._boundsSize);
};

Arcball.prototype.setDistanceMin = function(min){
    this._distanceMin = min;
};

Arcball.prototype.setDistanceMax = function(max){
    this._distanceMax = max;
};

Arcball.prototype.setDistance = function(distance){
    this._distanceTarget = distance;
};

Arcball.prototype.getDistance = function(){
    return this._distance;
};

Arcball.prototype.setRadiusScale = function(scale){
    this._radiusScale = 1.0 / (1.0 / (scale === undefined ? DEFAULT_RADIUS_SCALE : scale) * 2);
    this._updateRadius();
};

Arcball.prototype.getRadiusScale = function(){
    return this._radiusScale;
};

Arcball.prototype.setSpeed = function(speed){
    this._speed = speed;
};

Arcball.prototype.getSpeed = function(){
    return this._speed;
};

Arcball.prototype.enable = function(){
    this._interactive = true;
};

Arcball.prototype.disable = function(){
    this._interactive = false;
};

Arcball.prototype.isEnabled = function(){
    return this._interactive;
};

Arcball.prototype._updateModifierInput = function(e){
    this._constrainModePrev = this._constrainMode;
    this._constrainMode     = e.shiftKey && e.ctrlKey ? ConstrainAxisMode.CAMERA : e.shiftKey && e.altKey ? ConstrainAxisMode.WORLD : ConstrainAxisMode.NONE;
    this._constrain         = this._constrainMode != ConstrainAxisMode.NONE;
    this._pan               = e.shiftKey && !this._constrain
};

Arcball.prototype._updateRadius = function(){
    var boundsSize = this._boundsSize;
    this._radius = Math.min(boundsSize[0],boundsSize[1]) * this._radiusScale;
};

Arcball.prototype._mapSphere = function(pos,constrain){
    pos       = Vec2.set(TEMP_VEC2_0,pos);
    constrain = this._constrain && (constrain || constrain === undefined);

    var dir = this._distance < 0 ? -1 : 1;

    pos = Vec2.sub(pos,this._center);
    pos = Vec2.scale(pos, 1.0 / this._radius);
    pos = Vec3.set3(TEMP_VEC2_1,pos[0],pos[1] * dir, 0);

    var r = Vec3.lengthSq(pos);
    if(r > 1.0){
        Vec3.normalize(pos);
    }
    else{
        pos[2] = Math.sqrt(1 - r);
    }

    if(constrain){
        this._constrainToAxis(pos,this._constrainAxes[this._constrainAxisIndex]);
    }

    return pos;
};

Arcball.prototype._constrainToAxis = function(pos, axis){
    var dot  = Vec3.dot(pos,axis);
    var proj = Vec3.sub(pos,Vec3.scale(Vec3.set(TEMP_VEC3_2,axis),dot));
    var norm = Vec3.length(proj);

    if(norm > 0){
        if(proj[2] < 0.0){
            Vec3.invert(proj);
        }
        Vec3.normalize(pos);
    } else if(axis[2] == 1.0){
        Vec3.set3(pos,1,0,0);
    } else {
        Vec3.set3(pos,-axis[1],axis[0],0);
    }
    return pos;
};

//Graphics Gems IV, Page 177, Ken Shoemake
Arcball.prototype._updateNearestAxis = function(pos){
    if(!this._constrain){
        return;
    }

    var constrainAxes = this._constrainAxes;

    var max = -1;
    var index  = 0;

    for(var i = 0, l = constrainAxes.length, point, dot; i < l; ++i){
        point = this._constrainToAxis(Vec3.set(TEMP_VEC3_0,pos), constrainAxes[i]);
        dot   = Vec3.dot(point, pos);
        if(dot > max){
            index = i;
            max = dot;
        }
    }
    this._constrainAxisIndex = index;
};

Arcball.prototype.onMouseDown = function(e){
    if(!this._interactive){
        return;
    }

    this._updateModifierInput(e);
    this._drag = false;

    var boundsHeight = this._boundsSize[1];
    var mousePos     = Vec2.set2(TEMP_VEC2_0, e.x, e.y);
    this._posDown    = Vec2.set(this._posDown, mousePos);

    var pos = Vec2.set2(TEMP_VEC2_0, mousePos[0],boundsHeight - mousePos[1]);

    Vec3.set(this._posDownPtr, this._mapSphere(pos));
    Quat.set(this._orientDown, this._orientCurr);
    Quat.identity(this._orientDrag);

    if(this._pan){

        Vec3.set(this._targetCameraWorld,this._camera.getTarget());
        Vec3.multMat4(Vec3.set(this._targetCameraView,this._targetCameraWorld),this._camera.getViewMatrix());

        Vec3.set(this._planeTargetView[0],this._targetCameraView);
        Vec3.set(this._planeTargetView[1],Z_AXIS);

        Vec3.multMat4(Vec3.set(this._planeTargetWorld[1],this._planeTargetView[1]),this._camera.getInverseViewMatrix());
    }
};

Arcball.prototype.onMouseDrag = function(e){
    if(!this._interactive){
        return;
    }

    this._updateModifierInput(e);
    this._drag = true;

    var boundsWidth  = this._boundsSize[0];
    var boundsHeight = this._boundsSize[1];
    var mousePos     = Vec2.set2(TEMP_VEC2_0, e.x, e.y);

    this._posDrag = Vec2.set(this._posDrag,mousePos);

    if(this._pan){
        Plane.getRayIntersection(this._planeTargetView,this._camera.getViewRay(this._posDown,boundsWidth,boundsHeight),this._planePosDownView);
        Plane.getRayIntersection(this._planeTargetView,this._camera.getViewRay(this._posDrag,boundsWidth,boundsHeight),this._planePosDragView);

        var invViewMatrix = this._camera.getInverseViewMatrix();

        Vec3.multMat4(Vec3.set(this._planePosDownWorld,this._planePosDownView),invViewMatrix);
        Vec3.multMat4(Vec3.set(this._planePosDragWorld,this._planePosDragView),invViewMatrix);

        var targetCameraWorld = Vec3.set(TEMP_VEC3_0,this._targetCameraWorld);
        var planePosDragWorld = Vec3.set(TEMP_VEC3_1,this._planePosDragWorld);
        var planePosDelta     = Vec3.sub(planePosDragWorld,this._planePosDownWorld);

        this._camera.setTarget(Vec3.sub(targetCameraWorld,planePosDelta));
    }
    else {
        var pos = Vec2.set2(TEMP_VEC2_0, mousePos[0], boundsHeight - mousePos[1]);

        var posDownPtr = this._posDownPtr;
        var posDragPtr = Vec3.set(this._posDragPtr,this._mapSphere(pos));
        var temp       = Vec3.cross(Vec3.set(Vec3.create(),posDownPtr), posDragPtr);

        Quat.set4(this._orientDrag,temp[0],temp[1],temp[2],Vec3.dot(posDownPtr,posDragPtr));
        Quat.normalize(this._orientDrag);
        Quat.set(this._orientTarget, this._orientDrag);
        Quat.mult(this._orientTarget, this._orientDown);
    }
};

Arcball.prototype.onMouseMove = function(e){
    this._updateModifierInput(e);
    var pos = Vec2.set2(TEMP_VEC2_0, e.x, this._boundsSize[1] - e.y);
    Vec3.set(this._posMovePtr,this._mapSphere(pos,false));
};

Arcball.prototype.onKeyPress = function(e){
    this._updateModifierInput(e);
};

Arcball.prototype.onKeyUp = function(){
    this._constrain = false;
};

Arcball.prototype.onMouseUp = function(e){
    this._constrain = !e.shiftKey ? false : this._constrain;
    this._drag = false;
};

Arcball.prototype.onMouseScroll = function(e){
    if(!this._interactive){
        return;
    }
    var direction = e.dy < 0 ? -1 : e.dy > 0 ? 1 : 0;
    if(direction == 0){
        return;
    }
    this._distanceTarget += direction * -1 * this._distanceStep * (e.altKey ? 2.0 : 1.0);
    this._distanceTarget  = Math.max(this._distanceMin, Math.min(this._distanceTarget,this._distanceMax));
};

Arcball.prototype.onWindowResize = function(e){
    var width  = e.width;
    var height = e.height;
    Vec2.set2(this._boundsSize,width,height);
    Vec2.set2(this._center, width * 0.5, height * 0.5);
    this._updateRadius();
};

Arcball.prototype.apply = function(){
    this._distance += (this._distanceTarget - this._distance) * this._speed;

    var orient = Quat.set(TEMP_QUAT_0,this._orientCurr);
    orient[3] *= -1;

    if(this._constrain){
        Quat.slerp(this._orientCurr,this._orientTarget,this._speed);

        if(!this._drag){
            switch (this._constrainMode){
                case ConstrainAxisMode.CAMERA :
                    if(this._constrainMode != this._constrainModePrev){
                        Vec3.set(this._constrainAxes[0],X_AXIS);
                        Vec3.set(this._constrainAxes[1],Y_AXIS);
                        Vec3.set(this._constrainAxes[2],Z_AXIS);
                    }
                    break;
                case ConstrainAxisMode.WORLD :
                    var orientWorld = Quat.invert(Quat.set(TEMP_QUAT_1,orient));

                    Vec3.set(this._constrainAxes[0],X_AXIS);
                    Vec3.set(this._constrainAxes[1],Y_AXIS);
                    Vec3.set(this._constrainAxes[2],Z_AXIS);
                    Vec3.multQuat(this._constrainAxes[0],orientWorld);
                    Vec3.multQuat(this._constrainAxes[1],orientWorld);
                    Vec3.multQuat(this._constrainAxes[2],orientWorld);
                    break;
            }
        }
    } else {
        slerpLongest(this._orientCurr,this._orientTarget,this._speed);
    }

    this._updateNearestAxis(this._posMovePtr);

    var target   = this._camera.getTarget();
    var offset   = Vec3.multQuat(Vec3.set3(TEMP_VEC3_0,0,0,this._distance),orient);
    var position = Vec3.add(Vec3.set(TEMP_VEC3_1,target),offset);
    var up       = Vec3.multQuat(Vec3.set(TEMP_VEC3_0,Y_AXIS),orient);

    this._camera.lookAt(position,target,up);

    this._zoom = this._distance != this._distancePrev;
    this._distancePrev = this._distance;
};

Arcball.prototype.resetPanning = function(){
    this._camera.setTarget(this._targetCameraWorldOriginal);
    this._pan = false;
};

Arcball.prototype.isPanning = function(){
    return this._pan;
};

Arcball.prototype.isZooming = function(){
    return this._zoom;
};

Arcball.prototype.isDragging = function(){
    return this._drag;
};

Arcball.prototype.isConstrained = function(){
    return this._constrain;
};

Arcball.prototype.isActive = function(){
    return this._pan || this._zoom || this._drag || this._constrain;
};

Arcball.prototype.getState = function(){
    return [this._camera.getPosition(),this._camera.getTarget(),this._camera.getUp(),this._interactive];
};

Arcball.prototype.setState = function(state){
    if(state.length !== 4){
        throw new Error('Invalid state.');
    }
    this._camera.lookAt(state[0],state[1],state[2]);
    this._interactive = state[3];
    this.setCamera(this._camera);
};

module.exports = Arcball;