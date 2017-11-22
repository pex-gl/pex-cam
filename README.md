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
  - `position`: vec3 - camera position, default [0, 0, 3]
  - `target`: vec3 - camera target, default [0, 0, 0]
  - `up`: vec3 - camera up direction, default [0, 1, 0]
  - `fov`: Number - vertical field of view, default PI/3 (60 deg)
  - `aspect`: Number - aspect ratio, default 1
  - `near`: Number - near clipping plane, default 0.1
  - `far`: Number - far clipping plane, default 100

### `cam.set(opts)`

- `opts`: options like above

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
  - `camera`: PerspectiveCamera
  - `element`: DOM Node
  - `easing`: Number
  - `zoom`: Boolean
  - `pan`: Boolean

### `orbiter.set(opts)`

- `opts`: options like above

## License

MIT, see [LICENSE.md](http://github.com/vorg/geom-merge/blob/master/LICENSE.md) for details.
