# neuron-tree [![NPM version](https://badge.fury.io/js/neuron-tree.svg)](http://badge.fury.io/js/neuron-tree) [![Build Status](https://travis-ci.org/cortexjs/neuron-tree.svg?branch=master)](https://travis-ci.org/cortexjs/neuron-tree) [![Dependency Status](https://gemnasium.com/cortexjs/neuron-tree.svg)](https://gemnasium.com/cortexjs/neuron-tree)

Utilities to generate the `config.tree` for [neuron](https://github.com/kaelzhang/neuron).

```
<name>: {
  <version>: {
    // dependencies and async dependencies
    <dep-name>: [
      // synchronous dependencies
      {
        <sync-dep-range>: <sync-dep-version>, ...
      },
      // asynchronous dependencies
      {
        <async-dep-range>: <async-dep-version>, ...
      }
    ]
  }
}
```

## Install

```bash
$ npm install neuron-tree --save
```

## Usage

```js
var tree = require('neuron-tree');
tree(pkg, {
  cwd: cwd,
  built_root: built_root,
  dependencyKeys: ['dependencies', 'asyncDependencies']
}, function(err, tree, shrinkwrap){
  // ...
});
```

### tree(pkg, options, callback)

Generates the object tree which neuron uses as the `config.tree`.

- pkg `Object` cortex json
- options `Object`
  - cwd `path`
  - built_root `path=` the path from where we can find all installed and built packages
  - shrinkwrap `Object=` the object of cortex-shrinkwrap.json
  - dependencyKeys `Array=['dependencies', 'asyncDependencies']`
  - ignore_shrink_file `Boolean=false` if true, `neuron-tree` will always generate new shrinkwrap tree.

##### dependencyKeys

The array of types of dependencies, default to 

```
[
  "dependencies",
  "asyncDependencies"
]
```

You could include other keys of dependencies in the array, available keys: 

`'dependencies'`, `'asyncDependencies'`, `'engines'`, `devDependencies`

##### Arguments Overloading

- if `options.shrinkwrap` not defined, then:
- if `options.ignore_shrink_file` not defined, `neuron-tree` will try to generate shrinkwrap itself, else:
- `neuron-tree` will try to read the cortex-shrinkwrap.json, else:
- if cortex-shrinkwrap.json not found, `neuron-tree` will try to generate shrinkwrap itself.

### tree.parse(shrinked, dependencyKeys)

- shrinked `Object` the shrinked object of [shrinked](https://www.npmjs.org/package/shrinked)
- dependencyKeys `Array.<String>`

Parses the shrinked B+ tree, and generates a simpler tree for `config.tree` of neuron.

## License

MIT
<!-- do not want to make nodeinit to complicated, you can edit this whenever you want. -->
