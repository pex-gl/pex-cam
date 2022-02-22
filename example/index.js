import {
  perspective as createCamera,
  orbiter as createOrbiter,
} from "../index.js";

import createContext from "pex-context";
import createCube from "primitive-cube";
import { mat4 } from "pex-math";
import random from "pex-random";
import createGUI from "pex-gui";

const canvas = document.createElement("canvas");
document.querySelector("main").appendChild(canvas);
const ctx = createContext({ canvas: canvas });
const gui = createGUI(ctx);
const cube = createCube(0.2);

const State = { distance: 5 };

const camera = createCamera({
  fov: Math.PI / 3,
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 100,
  position: [3, 3, 3],
  target: [0, 0, 0],
  up: [0, 1, 0],
});

// const arcball = createArcball({
// camera: camera,
// element: gl.canvas
// })

const orbiter = createOrbiter({
  camera,
  element: ctx.gl.canvas,
  easing: 0.1,
});

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0, 0, 0, 1],
    clearDepth: 1,
  }),
};

const drawCubeCmd = {
  pipeline: ctx.pipeline({
    vert: /* glsl */ `
    attribute vec3 aPosition;
    attribute vec3 aNormal;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uModelMatrix;
    uniform vec3 uPosition;

    varying vec3 vNormal;

    mat4 transpose(mat4 m) {
      return mat4(m[0][0], m[1][0], m[2][0], m[3][0],
                  m[0][1], m[1][1], m[2][1], m[3][1],
                  m[0][2], m[1][2], m[2][2], m[3][2],
                  m[0][3], m[1][3], m[2][3], m[3][3]);
    }

    mat4 inverse(mat4 m) {
      float
          a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
          a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
          a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
          a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],

          b00 = a00 * a11 - a01 * a10,
          b01 = a00 * a12 - a02 * a10,
          b02 = a00 * a13 - a03 * a10,
          b03 = a01 * a12 - a02 * a11,
          b04 = a01 * a13 - a03 * a11,
          b05 = a02 * a13 - a03 * a12,
          b06 = a20 * a31 - a21 * a30,
          b07 = a20 * a32 - a22 * a30,
          b08 = a20 * a33 - a23 * a30,
          b09 = a21 * a32 - a22 * a31,
          b10 = a21 * a33 - a23 * a31,
          b11 = a22 * a33 - a23 * a32,

          det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

      return mat4(
          a11 * b11 - a12 * b10 + a13 * b09,
          a02 * b10 - a01 * b11 - a03 * b09,
          a31 * b05 - a32 * b04 + a33 * b03,
          a22 * b04 - a21 * b05 - a23 * b03,
          a12 * b08 - a10 * b11 - a13 * b07,
          a00 * b11 - a02 * b08 + a03 * b07,
          a32 * b02 - a30 * b05 - a33 * b01,
          a20 * b05 - a22 * b02 + a23 * b01,
          a10 * b10 - a11 * b08 + a13 * b06,
          a01 * b08 - a00 * b10 - a03 * b06,
          a30 * b04 - a31 * b02 + a33 * b00,
          a21 * b02 - a20 * b04 - a23 * b00,
          a11 * b07 - a10 * b09 - a12 * b06,
          a00 * b09 - a01 * b07 + a02 * b06,
          a31 * b01 - a30 * b03 - a32 * b00,
          a20 * b03 - a21 * b01 + a22 * b00) / det;
    }

    void main () {
      mat4 modelViewMatrix = uViewMatrix * uModelMatrix;
      mat3 normalMatrix = mat3(transpose(inverse(modelViewMatrix)));
      vNormal = normalMatrix * aNormal;
      gl_Position = uProjectionMatrix * modelViewMatrix * vec4(aPosition + uPosition, 1.0);
    }
  `,
    frag: /* glsl */ `
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec3 vNormal;

    void main () {
      gl_FragColor.rgb = vNormal * 0.5 + 0.5;
      gl_FragColor.a = 1.0;
    }
  `,
    depthTest: true,
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
    uPosition: [0, 0, 0],
  },
  attributes: {
    aPosition: ctx.vertexBuffer(cube.positions),
    aNormal: ctx.vertexBuffer(cube.normals),
  },
  indices: ctx.indexBuffer(cube.cells),
};

const instances = [];
for (let i = 0; i < 200; i++) {
  instances.push({
    uniforms: {
      uPosition: random.vec3(),
    },
  });
}

const onResize = () => {
  ctx.gl.canvas.width = window.innerWidth;
  ctx.gl.canvas.height = window.innerHeight;
  camera.set({
    aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  });
};
window.addEventListener("resize", onResize);
onResize();

gui.addTab("Controls");
gui.addParam("Distance", State, "distance", { min: 2, max: 20 }, () => {
  orbiter.set({ distance: State.distance });
});

ctx.frame(() => {
  ctx.submit(clearCmd);
  ctx.submit(drawCubeCmd, instances);
  gui.draw();
});
