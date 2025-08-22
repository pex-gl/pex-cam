# pex-cam

[![npm version](https://img.shields.io/npm/v/pex-cam)](https://www.npmjs.com/package/pex-cam)
[![stability-stable](https://img.shields.io/badge/stability-stable-green.svg)](https://www.npmjs.com/package/pex-cam)
[![npm minzipped size](https://img.shields.io/bundlephobia/minzip/pex-cam)](https://bundlephobia.com/package/pex-cam)
[![dependencies](https://img.shields.io/librariesio/release/npm/pex-cam)](https://github.com/pex-gl/pex-cam/blob/main/package.json)
[![types](https://img.shields.io/npm/types/pex-cam)](https://github.com/microsoft/TypeScript)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-fa6673.svg)](https://conventionalcommits.org)
[![styled with prettier](https://img.shields.io/badge/styled_with-Prettier-f8bc45.svg?logo=prettier)](https://github.com/prettier/prettier)
[![linted with eslint](https://img.shields.io/badge/linted_with-ES_Lint-4B32C3.svg?logo=eslint)](https://github.com/eslint/eslint)
[![license](https://img.shields.io/github/license/pex-gl/pex-cam)](https://github.com/pex-gl/pex-cam/blob/main/LICENSE.md)

Cameras models and controllers for 3D rendering in [PEX](https://pex.gl).

![](https://raw.githubusercontent.com/pex-gl/pex-cam/main/screenshot.png)

## Installation

```bash
npm install pex-cam
```

## Usage

```js
import {
  perspective as createPerspectiveCamera,
  orbiter as createOrbiter,
} from "pex-cam";

const perspectiveCamera = createPerspectiveCamera({
  position: [2, 2, 2],
  target: [0, -0.5, 0],
  aspect: window.innerWidth / window.innerHeight,
});

const perspectiveOrbiter = createOrbiter({
  camera: perspectiveCamera,
});

console.log(perspectiveCamera.projectionMatrix);
```

## API

<!-- api-start -->

## Modules

<dl>
<dt><a href="#module_index">index</a></dt>
<dd><p>Re-export classes and factory functions</p>
</dd>
</dl>

## Classes

<dl>
<dt><a href="#Camera">Camera</a></dt>
<dd><p>An interface for cameras to extend</p>
</dd>
<dt><a href="#OrbiterControls">OrbiterControls</a></dt>
<dd><p>Camera controls to orbit around a target</p>
</dd>
<dt><a href="#OrthographicCamera">OrthographicCamera</a> ⇐ <code><a href="#Camera">Camera</a></code></dt>
<dd><p>A class to create an orthographic camera</p>
</dd>
<dt><a href="#PerspectiveCamera">PerspectiveCamera</a> ⇐ <code><a href="#Camera">Camera</a></code></dt>
<dd><p>A class to create a perspective camera</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Radians">Radians</a> : <code>number</code></dt>
<dd></dd>
<dt><a href="#Degrees">Degrees</a> : <code>number</code></dt>
<dd></dd>
<dt><a href="#CameraView">CameraView</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#CameraOptions">CameraOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#PerspectiveCameraOptions">PerspectiveCameraOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#OrthographicCameraOptions">OrthographicCameraOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#OrbiterControlsOptions">OrbiterControlsOptions</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="module_index"></a>

## index

Re-export classes and factory functions

- [index](#module_index)
  - [.perspective](#module_index.perspective) ⇒ [<code>PerspectiveCamera</code>](#PerspectiveCamera)
  - [.orthographic](#module_index.orthographic) ⇒ [<code>OrthographicCamera</code>](#OrthographicCamera)
  - [.orbiter](#module_index.orbiter) ⇒ [<code>OrbiterControls</code>](#OrbiterControls)

<a name="module_index.perspective"></a>

### index.perspective ⇒ [<code>PerspectiveCamera</code>](#PerspectiveCamera)

Factory function for perspective camera

**Kind**: static constant of [<code>index</code>](#module_index)

| Param | Type                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| opts  | [<code>CameraOptions</code>](#CameraOptions) \| [<code>PerspectiveCameraOptions</code>](#PerspectiveCameraOptions) |

<a name="module_index.orthographic"></a>

### index.orthographic ⇒ [<code>OrthographicCamera</code>](#OrthographicCamera)

Factory function for orthographic camera

**Kind**: static constant of [<code>index</code>](#module_index)

| Param | Type                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------- |
| opts  | [<code>CameraOptions</code>](#CameraOptions) \| [<code>OrthographicCameraOptions</code>](#OrthographicCameraOptions) |

<a name="module_index.orbiter"></a>

### index.orbiter ⇒ [<code>OrbiterControls</code>](#OrbiterControls)

Factory function for orbiter controls

**Kind**: static constant of [<code>index</code>](#module_index)

| Param | Type                                                           |
| ----- | -------------------------------------------------------------- |
| opts  | [<code>OrbiterControlsOptions</code>](#OrbiterControlsOptions) |

<a name="Camera"></a>

## Camera

An interface for cameras to extend

**Kind**: global class
<a name="Camera+set"></a>

### camera.set(opts)

Update the camera

**Kind**: instance method of [<code>Camera</code>](#Camera)

| Param | Type                                         |
| ----- | -------------------------------------------- |
| opts  | [<code>CameraOptions</code>](#CameraOptions) |

<a name="OrbiterControls"></a>

## OrbiterControls

Camera controls to orbit around a target

**Kind**: global class

- [OrbiterControls](#OrbiterControls)
  - [new OrbiterControls(opts)](#new_OrbiterControls_new)
  - [.set(opts)](#OrbiterControls+set)
  - [.dispose()](#OrbiterControls+dispose)

<a name="new_OrbiterControls_new"></a>

### new OrbiterControls(opts)

Create an instance of OrbiterControls

| Param | Type                                                           |
| ----- | -------------------------------------------------------------- |
| opts  | [<code>OrbiterControlsOptions</code>](#OrbiterControlsOptions) |

<a name="OrbiterControls+set"></a>

### orbiterControls.set(opts)

Update the control

**Kind**: instance method of [<code>OrbiterControls</code>](#OrbiterControls)

| Param | Type                        |
| ----- | --------------------------- |
| opts  | <code>OrbiterOptions</code> |

<a name="OrbiterControls+dispose"></a>

### orbiterControls.dispose()

Remove all event listeners

**Kind**: instance method of [<code>OrbiterControls</code>](#OrbiterControls)
<a name="OrthographicCamera"></a>

## OrthographicCamera ⇐ [<code>Camera</code>](#Camera)

A class to create an orthographic camera

**Kind**: global class
**Extends**: [<code>Camera</code>](#Camera)

- [OrthographicCamera](#OrthographicCamera) ⇐ [<code>Camera</code>](#Camera)
  - [new OrthographicCamera(opts)](#new_OrthographicCamera_new)
  - [.set(opts)](#OrthographicCamera+set)

<a name="new_OrthographicCamera_new"></a>

### new OrthographicCamera(opts)

Create an instance of PerspectiveCamera

| Param | Type                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------- |
| opts  | [<code>CameraOptions</code>](#CameraOptions) \| [<code>OrthographicCameraOptions</code>](#OrthographicCameraOptions) |

<a name="OrthographicCamera+set"></a>

### orthographicCamera.set(opts)

Update the camera

**Kind**: instance method of [<code>OrthographicCamera</code>](#OrthographicCamera)
**Overrides**: [<code>set</code>](#Camera+set)

| Param | Type                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------- |
| opts  | [<code>CameraOptions</code>](#CameraOptions) \| [<code>OrthographicCameraOptions</code>](#OrthographicCameraOptions) |

<a name="PerspectiveCamera"></a>

## PerspectiveCamera ⇐ [<code>Camera</code>](#Camera)

A class to create a perspective camera

**Kind**: global class
**Extends**: [<code>Camera</code>](#Camera)

- [PerspectiveCamera](#PerspectiveCamera) ⇐ [<code>Camera</code>](#Camera)
  - [new PerspectiveCamera(opts)](#new_PerspectiveCamera_new)
  - [.set(opts)](#PerspectiveCamera+set)
  - [.getViewRay(x, y, windowWidth, windowHeight)](#PerspectiveCamera+getViewRay) ⇒ <code>module:pex-geom~ray</code>
  - [.getWorldRay(x, y, windowWidth, windowHeight)](#PerspectiveCamera+getWorldRay) ⇒ <code>module:pex-geom~ray</code>

<a name="new_PerspectiveCamera_new"></a>

### new PerspectiveCamera(opts)

Create an instance of PerspectiveCamera

| Param | Type                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| opts  | [<code>CameraOptions</code>](#CameraOptions) \| [<code>PerspectiveCameraOptions</code>](#PerspectiveCameraOptions) |

<a name="PerspectiveCamera+set"></a>

### perspectiveCamera.set(opts)

Update the camera

**Kind**: instance method of [<code>PerspectiveCamera</code>](#PerspectiveCamera)
**Overrides**: [<code>set</code>](#Camera+set)

| Param | Type                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| opts  | [<code>CameraOptions</code>](#CameraOptions) \| [<code>PerspectiveCameraOptions</code>](#PerspectiveCameraOptions) |

<a name="PerspectiveCamera+getViewRay"></a>

### perspectiveCamera.getViewRay(x, y, windowWidth, windowHeight) ⇒ <code>module:pex-geom~ray</code>

Create a picking ray in view (camera) coordinates

**Kind**: instance method of [<code>PerspectiveCamera</code>](#PerspectiveCamera)

| Param        | Type                | Description |
| ------------ | ------------------- | ----------- |
| x            | <code>number</code> | mouse x     |
| y            | <code>number</code> | mouse y     |
| windowWidth  | <code>number</code> |             |
| windowHeight | <code>number</code> |             |

<a name="PerspectiveCamera+getWorldRay"></a>

### perspectiveCamera.getWorldRay(x, y, windowWidth, windowHeight) ⇒ <code>module:pex-geom~ray</code>

Create a picking ray in world coordinates

**Kind**: instance method of [<code>PerspectiveCamera</code>](#PerspectiveCamera)

| Param        | Type                |
| ------------ | ------------------- |
| x            | <code>number</code> |
| y            | <code>number</code> |
| windowWidth  | <code>number</code> |
| windowHeight | <code>number</code> |

<a name="Radians"></a>

## Radians : <code>number</code>

**Kind**: global typedef
<a name="Degrees"></a>

## Degrees : <code>number</code>

**Kind**: global typedef
<a name="CameraView"></a>

## CameraView : <code>Object</code>

**Kind**: global typedef
**Properties**

| Name      | Type                              |
| --------- | --------------------------------- |
| offset    | <code>module:pex-math~vec2</code> |
| size      | <code>module:pex-math~vec2</code> |
| totalSize | <code>module:pex-math~vec2</code> |

<a name="CameraOptions"></a>

## CameraOptions : <code>Object</code>

**Kind**: global typedef
**Properties**

| Name               | Type                                   | Default                    |
| ------------------ | -------------------------------------- | -------------------------- |
| [projectionMatrix] | <code>module:pex-math~mat4</code>      | <code>mat4.create()</code> |
| [invViewMatrix]    | <code>module:pex-math~mat4</code>      | <code>mat4.create()</code> |
| [viewMatrix]       | <code>module:pex-math~mat4</code>      | <code>mat4.create()</code> |
| [position]         | <code>module:pex-math~vec3</code>      | <code>[0, 0, 3]</code>     |
| [target]           | <code>module:pex-math~vec3</code>      | <code>[0, 0, 0]</code>     |
| [up]               | <code>module:pex-math~vec3</code>      | <code>[0, 1, 0]</code>     |
| [aspect]           | <code>number</code>                    | <code>1</code>             |
| [near]             | <code>number</code>                    | <code>0.1</code>           |
| [far]              | <code>number</code>                    | <code>100</code>           |
| [view]             | [<code>CameraView</code>](#CameraView) | <code></code>              |

<a name="PerspectiveCameraOptions"></a>

## PerspectiveCameraOptions : <code>Object</code>

**Kind**: global typedef
**Properties**

| Name  | Type                             | Default                  |
| ----- | -------------------------------- | ------------------------ |
| [fov] | [<code>Radians</code>](#Radians) | <code>Math.PI / 3</code> |

<a name="OrthographicCameraOptions"></a>

## OrthographicCameraOptions : <code>Object</code>

**Kind**: global typedef
**Properties**

| Name     | Type                | Default         |
| -------- | ------------------- | --------------- |
| [left]   | <code>number</code> | <code>-1</code> |
| [right]  | <code>number</code> | <code>1</code>  |
| [bottom] | <code>number</code> | <code>-1</code> |
| [top]    | <code>number</code> | <code>1</code>  |
| [zoom]   | <code>number</code> | <code>1</code>  |

<a name="OrbiterControlsOptions"></a>

## OrbiterControlsOptions : <code>Object</code>

**Kind**: global typedef
**Properties**

| Name           | Type                             | Default                |
| -------------- | -------------------------------- | ---------------------- |
| camera         | [<code>Camera</code>](#Camera)   |                        |
| [element]      | <code>HTMLElement</code>         | <code>document</code>  |
| [easing]       | <code>number</code>              | <code>0.1</code>       |
| [zoom]         | <code>boolean</code>             | <code>true</code>      |
| [pan]          | <code>boolean</code>             | <code>true</code>      |
| [drag]         | <code>boolean</code>             | <code>true</code>      |
| [minDistance]  | <code>number</code>              | <code>0.01</code>      |
| [maxDistance]  | <code>number</code>              | <code>Infinity</code>  |
| [minLat]       | [<code>Degrees</code>](#Degrees) | <code>-89.5</code>     |
| [maxLat]       | [<code>Degrees</code>](#Degrees) | <code>89.5</code>      |
| [minLon]       | <code>number</code>              | <code>-Infinity</code> |
| [maxLon]       | <code>number</code>              | <code>Infinity</code>  |
| [panSlowdown]  | <code>number</code>              | <code>4</code>         |
| [zoomSlowdown] | <code>number</code>              | <code>400</code>       |
| [dragSlowdown] | <code>number</code>              | <code>4</code>         |
| [autoUpdate]   | <code>boolean</code>             | <code>true</code>      |

<!-- api-end -->

## License

MIT. See [license file](https://github.com/pex-gl/pex-cam/blob/main/LICENSE.md).
