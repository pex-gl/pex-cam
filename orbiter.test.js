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
console.log('45, 90', latLonToXyz(45 / 180 * Math.PI, 90 / 180 * Math.PI).map(toFixed2), 'expecting', Vec3.normalize([1, 1, 0]))

const pos = Vec3.normalize([5, 5, 0])
const latLon = xyzToLatLon(pos)
const pos2 = latLonToXyz(latLon[0], latLon[1])
const latLon2 = xyzToLatLon(pos2)
console.log(' ')
console.log('pos', pos.map(toFixed2), '->', pos2.map(toFixed2))
console.log('latLon', latLon.map(toFixed2), '->', latLon2.map(toFixed2))
