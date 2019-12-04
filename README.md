_⚠️ Good news! This project has been abandoned in favor of [pikapkg/web](https://github.com/pikapkg/web). Though I didn’t start pikapkg/web, I helped contribute all my ideas for Bridge there. So Bridge lives on, in a sense (only better, and working)_

# 🌉 Bridge

A bundler that bridges the gap to browser-optimized JavaScript bundling with
native browser ES Modules (ESM).

## Installation

```
npm install --save babel-preset-bridge
```

In any Babel-powered JavaScript project, add `bridge` to your `.babelrc`:

```json
{
  "presets": ["bridge"]
}
```

When you transform your files normally, via webpack or the Babel CLI, this will
transform all your absolute NPM imports from absolute…

```js
import React from 'react';
```

…to relative imports, depending on the file that imported it.

```js
import React from '../../node_modules/react@16.6.0/index.js';
```

This will also tree-shake your Node Modules, and copy them to a
`node_modules` folder in your Babel’s [compile
directory](https://babeljs.io/docs/en/babel-cli#compile-directories) folder
(⚠️ _Important: this will need to be set in order for this plugin to work_).

## Options

```json
{
  "alias": {
    "react": "react/cjs/react.development.js"
  },
  "sourceMaps": false
}
```

| Name         | Default | Description                                                                                                                                                                                                                                                       |
| :----------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `alias`      | `{}`    | If this module value is encountered, replace with the following (e.g.: the above example will replace every instance of `'react'` with `'react/cjs/react.development.js'` before continuing). The module name must match **exactly.** Similar to webpack’s alias. |
| `sourceMaps` | `false` | Should source maps be generated in the final output?                                                                                                                                                                                                              |

## CommonJS Support

**This doesn’t support CommonJS (CJS).**

You’ll know you’re trying to load a CJS module if it’s using `require()`. You’ll
probably get an error that looks like this:

```
Uncaught ReferenceError: require is not defined
```

Instead, you’ll either have to load the ESM version that the library ships,
assuming it does, or switch to use another package that supports ESM.

Say by default you’re used to declaring:

```js
import myModule from 'my-module';
```

Also say that `my-module` loaded the CJS by default, but shipped an ESM
version under `my-module/esm`. Without touching your project, configure
Bridge to handle that for you:

```json
{
  "presets": [
    [
      "bridge",
      {
        "alias": {
          "my-module": "my-module/ejs"
        }
      }
    ]
  ]
}
```

In your project, you can still keep writing `import … from 'my-module'` but
at compile time it will load the version from `alias`.

### ES Module Support

| Name            | Supports ESM | Planned ESM Support |
| :-------------- | :----------: | :-----------------: |
| `@angular`      |              |                     |
| `apollo-client` |      ✅      |                     |
| `d3` / `d3-*`   |              |                     |
| `react`         |              |         ✅          |
| `react-apollo`  |      ✅      |                     |
| `react-router`  |      ✅      |                     |
| `vue`           |      ✅      |                     |

If your preferred NPM package doesn’t export ESM, ask its maintainer(s)! Many
packages such as React are [already working on
this](https://github.com/facebook/react/issues/13272), and if the project
uses [Rollup](https://rollupjs.org) as its bundler, exporting ESM is [as
simple as adding one line to the
config](https://rollupjs.org/guide/en#output-format-f-format).

Because shipping ESM should be a decision of each NPM module (not to mention
converting CJS → ESM is _muuuuch_ more difficult than ESM → CJS), this
project can’t support automatic conversion at this time.
