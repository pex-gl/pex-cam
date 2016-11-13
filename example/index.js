'use strict'
const gl = require('pex-gl')(window.innerWidth, window.innerHeight)
const regl = require('regl')(gl)
const Mat4 = require('pex-math/Mat4')
const createCube = require('primitive-cube')
const glsl = require('glslify')

const cube = createCube()

const projectionMatrix = Mat4.perspective([], 60, window.innerWidth / window.innerHeight, 0.1, 100)
const viewMatrix = Mat4.lookAt([], [2, 2, 2], [0, 0, 0], [0, 1, 0])
const modelMatrix = Mat4.create()

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
    uModelMatrix: modelMatrix
  }
})

document.body.style.margin = 0
window.addEventListener('resize', (e) => {
  gl.canvas.width = window.innerWidth
  gl.canvas.height = window.innerHeight
  Mat4.perspective(projectionMatrix, 60, gl.canvas.width / gl.canvas.height, 0.1, 100)
})
// i can pass matrices by reference here but i can in drawing command
// in drawing command the matrix uniforms have to made dynamic to update every frame
const setupCamera = regl({
	context: {
		projectionMatrix: projectionMatrix,
		viewMatrix: viewMatrix
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
