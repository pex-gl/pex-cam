import { a as getDefaultExportFromCjs } from './_chunks/polyfills-BLj28hzb.js';

function xyzToLatLon(normalizedPosition, out) {
    out = out || [
        0,
        0
    ];
    out[0] = 90 - Math.acos(normalizedPosition[1]) / Math.PI * 180;
    out[1] = -Math.atan2(normalizedPosition[2], normalizedPosition[0]) / Math.PI * 180;
    return out;
}
var xyzToLatlon = xyzToLatLon;
var index = /*@__PURE__*/ getDefaultExportFromCjs(xyzToLatlon);

export { index as default };
