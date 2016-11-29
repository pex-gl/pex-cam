const latLonToXyz = require('./orbiter').latLonToXyz
const xyzToLatLon = require('./orbiter').xyzToLatLon
const Vec3 = require('pex-math/Vec3')

function toFixed2 (v) {
  return +v.toFixed(2)
}

console.log('0, 0', latLonToXyz(0, 0).map(toFixed2), 'expecting', [0, 0, 1])
console.log('0, 90', latLonToXyz(0, 90 / 180 * Math.PI).map(toFixed2), 'expecting', [1, 0, 0])
console.log('0, -90', latLonToXyz(0, -90 / 180 * Math.PI).map(toFixed2), 'expecting', [-1, 0, 0])
console.log('90, 0', latLonToXyz(90 / 180 * Math.PI, 0).map(toFixed2), 'expecting', [0, 1, 0])
console.log('-90, 0', latLonToXyz(-90 / 180 * Math.PI, 0).map(toFixed2), 'expecting', [0, -1, 0])

var pos = Vec3.normalize([5, 5, 5])
var latLon = xyzToLatLon(pos)
var pos2 = latLonToXyz(latLon[0], latLon[1])
console.log('pos', pos)
console.log('latLon', latLon)
console.log('pos2', pos2)
console.log('latLon2', xyzToLatLon(pos2))

