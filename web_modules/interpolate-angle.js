import { a as getDefaultExportFromCjs } from './_chunks/polyfills-BLj28hzb.js';

function lerp$1(v0, v1, t) {
    return v0 * (1 - t) + v1 * t;
}
var lerp_1 = lerp$1;

var lerp = lerp_1;
var PI = Math.PI;
var TWO_PI = Math.PI * 2;
function interpolateAngle(fromAngle, toAngle, t) {
    fromAngle = (fromAngle + TWO_PI) % TWO_PI;
    toAngle = (toAngle + TWO_PI) % TWO_PI;
    var diff = Math.abs(fromAngle - toAngle);
    if (diff < PI) {
        return lerp(fromAngle, toAngle, t);
    } else {
        if (fromAngle > toAngle) {
            fromAngle = fromAngle - TWO_PI;
            return lerp(fromAngle, toAngle, t);
        } else if (toAngle > fromAngle) {
            toAngle = toAngle - TWO_PI;
            return lerp(fromAngle, toAngle, t);
        }
    }
}
var interpolateAngle_1 = interpolateAngle;
var index = /*@__PURE__*/ getDefaultExportFromCjs(interpolateAngle_1);

export { index as default };
