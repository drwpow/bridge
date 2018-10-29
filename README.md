# 🌉 Bridge (Discontinued)

A bundler that bridges the gap to browser-optimized JavaScript bundling.

**⚰️ Development has been discontinued until further notice.**

### 💡 The idea

Ths project started as an experiment, after trying to spin up a simple React
application and being burdened with having to throw webpack, or Create React
App, or Parcel, or some hard-to-configure setup just to be able to use
JavaScript which has been supported by browsers for over 20 years. _Why all
this rigamarole just to start up a React project? Isn’t this the future? The
future sucks!_

I’ve heard complaints with bundlers, but the truth is: I love bundlers! I
understand webpack. I understand Babel setup. I enjoy that configuration.

I wasn’t frustrated for myself; I was frustrated that the future of web dev
felt locked up by bundlers in the midst of this Renaissance of browser
support. I wanted to write code that just _worked_ in browsers. I wanted to
write ES Modules (ESM).

With an ESM build you’d get all of the following:

##### No compile times

Only your changed JS would need to be transformed. `node_modules` would be
cached pretty well.

##### Perfect tree shaking

Whereas webpack, et al simulate the dependency tree, it’s flawed. This truly
lets the browser build the dependency tree and tree shake perfectly (albeit
with many network requests, but still).

##### Better code splitting

Because `import()` is supported, you can still lazy-load modules, and because
they’re actual URLs, the browser can cache modules already retreived. This
would be so much more efficient than requesting “empty“ bundles like webpack
can often produce (if you’re deduping, you could have _references_ to NPM
libraries in one chunk that really exist within another, so it’s possible to
request a chunk that’s nothing more than a reference to a chunk you already
have, therefore being a waste of a ~1KB network request)!

Our current tooling (and much of NPM) is stuck in the old CJS `require` and
`module.exports` world as opposed to the new, fancy `import` and `export`
standard. What we need is a _bridge_ into the new, better world of ES Modules!

I looked, and could find no Babel plugins that would transform CJS to ESM. So
I thought _why not build one?_

### ⚠️ The reason it didn’t work (for now)

The timing of this project—right when ESM has recently gotten browser adoption,
while much of NPM is stuck in CJS, seemed like the perfect opportunity: build a
_bridge_ from old modules to new modules.

The problem was that such a transformation is reversing the work done at the
build process. Take, for example, React’s entry file:

```js
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/react.production.min.js');
} else {
  module.exports = require('./cjs/react.development.js');
}
```

Transforming just those 5 lines of code into ESM is no simple task. That
involves:

1. Looking for `require()`, and turning that into `import`.
2. Realizing you can’t `export` an `import`, this has to be inserted before `export`.
3. Transforming `module.exports` into `export`, keeping the reference from Step 1.
4. Now realizing we can’t have `import` and `export` in a block statement, we have to hoist it
5. First, we evaluate the `if` statement if that’s true…
6. Then, we evaluate the opposite…
7. And determine which statement was true. Now, hoist that, and ignore the rest.
8. Rinse, and repeat, in case this wasn’t the only block statement.

Congratulations! You’ve just transformed one file. Now do every file in
`node_modules` and be warned they’re not structured the same.

#### Overcomplicating a simple problem

All of this seems like a noble pursuit—again, it hasn’t been done before—except
it starts to seem pointless when you think of how React was built: with
[Rollup](https://rollupjs.org/), which supports—you guessed it—**ESM
output.**

The entire labor of love would be unraveling code just to fix the problem of a
popular NPM package having omitted one simple line of config in their bundler.

And after doing all this work, I realized [someone had already
asked](https://github.com/facebook/react/issues/10021).

The reality is that these days **almost all JavaScript libraries are written
in ES Modules.** They simply transform them on publish. Where this differs
from so many prolific Babel plugins is that Babel can convert old libraries
and systems to modern standards rather than having to refactor an entire
gigantic codebase. At its best, Babel can give new life to old projects.

Conversely, this project was trying to unravel the build decisions of current
libraries and revert them back to their sourcecode. You know a better way for
that to happen? Just ask those libraries to ship ESM with one line of build
config. Or just ship their sourcecode. Done!

@@@ Lessons Learned

Overall this was a great excuse for me to learn Babel, and even though this
project is half-finished, it accomplished the following:

- Tree-shakes `node_modules` by only grabbing what was required
- Copied `node_modules` for the front-end
- Placed them into version-named folders (`react@16.6.0`) to prevent conflicts / bad caching
- Transformed absolute paths (`react`) into relative ones (`../node_modules/react@16.6.0`)

So for now, I’m setting this project down until more NPM packages ship ESM.
Then once more do (and I’ll be opening up tickets myself, and doing the same
like I did with
[react-scroll-agent](https://github.com/manifoldco/react-scroll-agent)), I’ll
probably revisit this again.

The future is both far off, and very near.
