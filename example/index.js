'use strict'
const gl = require('pex-gl')(window.innerWidth, window.innerHeight)
const regl = require('regl')(gl)
const createCube = require('primitive-cube')
const glsl = require('glslify')
const createCamera = require('../perspective')
const createArcball = require('../arcball')
const createOrbiter = require('../orbiter')
const Mat4 = require('pex-math/Mat4')
const cube = createCube()

const camera = createCamera({
  fov: Math.PI / 3,
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 10,
  position: [3, 3, 3],
  target: [0, 0, 0],
  up: [0, 1, 0]
})

// const arcball = createArcball({
  // camera: camera
// })

const orbiter = createOrbiter({
  camera: camera
})

const drawCube = regl({
  attributes: {
    aPosition: cube.positions,
    aNormal: cube.normals
  },
  elements: cube.cells,
  vert: glsl`
    #ifdef GL_ES
    #pragma glslify: transpose = require(glsl-transpose)
    #endif
    #pragma glslify: inverse = require(glsl-inverse)

    attribute vec3 aPosition;
    attribute vec3 aNormal;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uModelMatrix;

    varying vec3 vNormal;

    void main () {
      mat4 modelViewMatrix = uViewMatrix * uModelMatrix;
      mat3 normalMatrix = mat3(transpose(inverse(modelViewMatrix)));
      vNormal = normalMatrix * aNormal;
      gl_Position = uProjectionMatrix * modelViewMatrix * vec4(aPosition, 1.0);
    }
  `,
  frag: `
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec3 vNormal;

    void main () {
      gl_FragColor.rgb = vNormal * 0.5 + 0.5;
      gl_FragColor.a = 1.0;
    }
  `,
  uniforms: {
		uProjectionMatrix: regl.context('projectionMatrix'),
		uViewMatrix: regl.context('viewMatrix'),
    uModelMatrix: Mat4.create()
  }
})

window.addEventListener('resize', (e) => {
  gl.canvas.width = window.innerWidth
  gl.canvas.height = window.innerHeight
  camera({
    aspect: gl.canvas.width / gl.canvas.height,
  })
})

// i can pass matrices by reference here but i can in drawing command
// in drawing command the matrix uniforms have to made dynamic to update every frame
const setupCamera = regl({
	context: {
		projectionMatrix: () => camera.projectionMatrix,
		viewMatrix: () => camera.viewMatrix
	}
})

regl.frame(() => {
  setupCamera(() => {
    regl.clear({
      color: [0.2, 0.2, 0.2, 1],
      depth: 1
    })
    drawCube()
  })
})
