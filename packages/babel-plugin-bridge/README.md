# 🌉 babel-plugin-bridge

## Transformation

By default, this plugin **won’t** transform any files (e.g., from
TypeScript). You’ll have to transform your JS in a way the browser can
understand.

From there, this plugin can transform plain JavaScript into a
browser-loadable format.

If you need transformation, try [babel-preset-bridge](#) instead.

## Options

Configure options in your `.babelrc` or `babel.config.js` using a “tuple”
array of `[plugin-name, options]`.

```json
{
  "plugins": [["bridge", { "sourceMaps": false }]]
}
```

| Name         | Type      | Default | Description                                      |
| :----------- | :-------- | :------ | :----------------------------------------------- |
| `sourceMaps` | `boolean` | `false` | Generate sourcemaps for `node_modules` in output |
