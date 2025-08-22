import { a as getDefaultExportFromCjs } from './_chunks/polyfills-BLj28hzb.js';

function latLonToXyz(lat, lon, out) {
    out = out || [
        0,
        0,
        0
    ];
    const phi = (lon + 90) / 180 * Math.PI;
    const theta = (90 - lat) / 180 * Math.PI;
    out[0] = Math.sin(theta) * Math.sin(phi);
    out[1] = Math.cos(theta);
    out[2] = Math.sin(theta) * Math.cos(phi);
    return out;
}
var latlonToXyz = latLonToXyz;
var index = /*@__PURE__*/ getDefaultExportFromCjs(latlonToXyz);

export { index as default };
