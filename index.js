'use strict';

module.exports = tree;

var jf = require('jsonfile');
var shrinked = require('shrinked');
var shrinkwrap = require('cortex-shrinkwrap');
var async = require('async');
var node_path = require('path');
var fs = require('fs');

// @param {Object} options
// - dependencyKeys {(Array.<string>)}
// - built_root {path}
// - shrinkwrap {Object=}
function tree (cwd, pkg, options, callback) {
  options || (options = {});
  (options.dependencyKeys) || (options.dependencyKeys = ['dependencies', 'asyncDependencies']);

  async.parallel([
    function (done) {
      if (options.shrinkwrap) {
        return done(null);
      }

      tree.read_shrinkwrap(cwd, pkg, options, function (err, tree) {
        if (err) {
          return done(err);
        }
        options.shrinkwrap = tree;
        
        done(null);
      });
    }
  ], function (err) {
    if (err) {
      return callback(err);
    }

    options.shrinkwrap.version = pkg.version;
    var keys = options.dependencyKeys;

    var shrinked_tree = shrinked.parse(options.shrinkwrap, {
      dependencyKeys: keys
    });

    var result = tree.parse_shrinked(shrinked_tree, keys);
    callback(null, result);
  });
};


tree.read_shrinkwrap = function (cwd, pkg, options, callback) {
  var shrinkwrap_json = node_path.join(cwd, 'cortex-shrinkwrap.json');

  fs.exists(shrinkwrap_json, function(exists) {
    if (exists) {
      return jf.readFile(shrinkwrap_json, callback);
    }

    var keys = options.dependencyKeys;

    shrinkwrap(pkg, options.built_root, {
      stableOnly: true,
      async: ~keys.indexOf('asyncDependencies'),
      dev: ~keys.indexOf('devDependencies')

    }, callback);
  });
};


// @param {Object} shrinked
// ```
// <name>: {
//   <version>: {
//     dependencies: {
//       <dep-name>: {
//         <dep-range>: <dep-version>
//       }
//     },

//     asyncDependencies: ...,
//     devDependencies: ...
//   }
// }
// ```
// @param 
tree.parse_shrinked = function (shrinked, types) {
  var parsed = {};
  types || (types = DEFAULT_TYPES);
  tree._each(shrinked, function (name, version, deps) {
    var merged_sync_deps = {};
    var merged_async_deps = {};

    // Maintains order, and the latter one has higher priority.
    TYPES.forEach(function (type) {
      if (~types.indexOf(type) && (type in deps)) {
        var dest = IS_ASYNC[type]
          ? merged_async_deps
          : merged_sync_deps;
        tree._merge(dest, deps[type]);
      }
    });

    if (
      tree._is_empty(merged_sync_deps)
      && tree._is_empty(merged_async_deps)
    ) {
      return;
    }

    var versions = parsed[name] || (parsed[name] = {});
    versions[version] = [merged_sync_deps, merged_async_deps];
  });

  return parsed;
};


var TYPES = [
  "devDependencies",
  "asyncDependencies",
  "dependencies",
  "engines"
];

var IS_ASYNC = {
  "devDependencies": false,
  "asyncDependencies": true,
  "dependencies": false,
  "engines": false
};

var DEFAULT_TYPES = [
  "asyncDependencies",
  "dependencies"
];


// double each
tree._each = function (object, iterator) {
  var a;
  var value;
  var b;
  var c;
  for (a in object) {
    value = object[a];
    for (b in value) {
      c = value[b];
      iterator(a, b, c);
    }
  }
};


tree._is_empty = function (object) {
  var key;
  for (key in object) {
    return false;
  }
  return true;
};


// Deep merge
tree._merge = function (receiver, supplier){
  if (Object(supplier) !== supplier) {
    return;
  }

  tree._each(supplier, function (name, range, version) {
    var ranges = receiver[name] || (receiver[name] = {});
    ranges[range] = version;
  });
};
