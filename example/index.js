'use strict'
const ctx = require('pex-context')()
const createCube = require('primitive-cube')
const glsl = require('glslify')
const createCamera = require('../perspective')
const createOrbiter = require('../orbiter')
const mat4 = require('pex-math/mat4')
const random = require('pex-random')

const cube = createCube(0.2)

const camera = createCamera({
  fov: Math.PI / 3,
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 100,
  position: [3, 3, 3],
  target: [0, 0, 0],
  up: [0, 1, 0]
})

// const arcball = createArcball({
  // camera: camera,
  // element: gl.canvas
// })

const orbiter = createOrbiter({
  camera: camera,
  element: ctx.gl.canvas,
  easing: 0.1
})

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0, 0, 0, 1],
    clearDepth: 1
  })
}

const drawCubeCmd = {
  pipeline: ctx.pipeline({
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
      uniform vec3 uPosition;

      varying vec3 vNormal;

      void main () {
        mat4 modelViewMatrix = uViewMatrix * uModelMatrix;
        mat3 normalMatrix = mat3(transpose(inverse(modelViewMatrix))); vNormal = normalMatrix * aNormal;
        gl_Position = uProjectionMatrix * modelViewMatrix * vec4(aPosition + uPosition, 1.0);
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
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
    uPosition: [0, 0, 0]
  },
  attributes: {
    aPosition: ctx.vertexBuffer(cube.positions),
    aNormal: ctx.vertexBuffer(cube.normals)
  },
  indices: ctx.indexBuffer(cube.cells)
}

var instances = []
for (var i = 0; i < 200; i++) {
  instances.push({
    uniforms: {
      uPosition: random.vec3()
    }
  })
}

window.addEventListener('resize', (e) => {
  ctx.gl.canvas.width = window.innerWidth
  ctx.gl.canvas.height = window.innerHeight
  camera.set({
    aspect: ctx.gl.canvas.width / ctx.gl.canvas.height
  })
})

var zoom2 = document.createElement('a')
zoom2.innerText = 'Zoom to 2'
zoom2.style.position = 'absolute'
zoom2.style.top = '10px'
zoom2.style.left = '20px'
zoom2.style.color = 'white'
zoom2.setAttribute('href', '#')
zoom2.addEventListener('click', () => {
  orbiter.set({ distance: 2 })
})
document.body.appendChild(zoom2)

var zoom5 = document.createElement('a')
zoom5.innerText = 'Zoom to 5'
zoom5.style.position = 'absolute'
zoom5.style.top = '30px'
zoom5.style.left = '20px'
zoom5.style.color = 'white'
zoom5.setAttribute('href', '#')
zoom5.addEventListener('click', () => {
  orbiter.set({ distance: 5 })
})
document.body.appendChild(zoom5)

ctx.frame(() => {
  ctx.submit(clearCmd)
  ctx.submit(drawCubeCmd, instances)
})
