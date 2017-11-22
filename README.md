# pex-cam

Camera models and controllers.

# API

## Perspective Camera

```javascript
var createPerspectiveCamera = require('pex-cam/perspective')
```

### `cam = createPerspectiveCamera(opts)`

Creates new perspective camera

- `opts:` object with one or more of the following options
  - `position`: vec3 - camera position, `[0, 0, 3]`
  - `target`: vec3 - camera target,  `[0, 0, 0]`
  - `up`: vec3 - camera up direction, `[0, 1, 0]`
  - `fov`: Number - vertical field of view, `PI/3 (60 deg)`
  - `aspect`: Number - aspect ratio , `1`
  - `near`: Number - near clipping plane, `0.1`
  - `far`: Number - far clipping plane, `100`

### `cam.set(opts)`

- `opts`: see `createPerspectiveCamera`

### `cam.getViewRay(x, y, windowWidth, windowHeight)`

Create picking ray in view (camera) cooridinates

- `x`: Number - mouse x
- `y`: Number - mouse y
- `windowWidth`: Number
- `windowHeight`: Number

### `cam.getWorldRay(x, y, windowWidth, windowHeight)`

Create picking ray in world coordinates

- `x`: Number - mouse x
- `y`: Number - mouse y
- `windowWidth`: Number
- `windowHeight`: Number

## Orbiter

Orbiter controller

```javascript
var createOrbiter = require('pex-cam/orbiter')
```

### `orbiter = createOrbiter(opts)`

Creates new orbiter controller

- `opts`: object with one or more of the following options
  - `camera`: PerspectiveCamera - camera to be controlled
  - `element`: DOM Element - mouse events target, `window`
  - `easing`: Number, amount of intertia, `0`
  - `drag`: Boolean - enable drag rotation, `true`
  - `zoom`: Boolean - enable mouse wheel zooming, `true`
  - `pan`: Boolean - enable shift + drag panning, `true`
  - `lat`: Number - latitude of the orbiter position, defaults to camera.position
  - `lon`: Number - longitude of the orbiter position, defaults to camera.position

### `orbiter.set(opts)`

- `opts`: see `createOrbiter`

## License

MIT, see [LICENSE.md](http://github.com/vorg/geom-merge/blob/master/LICENSE.md) for details.
