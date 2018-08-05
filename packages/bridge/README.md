# 🌉 Bridge

Uses Babel 7 to parse ASTs, traverse imports, and recursively build
dependency trees for any files.

## Usage

```
bridge src/app.js
bridge src/**/*.js
bridge src/entry-1.js src/entry-2.js src/vendor/**/*.js
```

### Arguments

| Name                   | Type                | Description                                                                                      | Example                                            |
| :--------------------- | :------------------ | :----------------------------------------------------------------------------------------------- | :------------------------------------------------- |
| `src` (no flag needed) | `String | [String]` | Path to single file, path to multiple files, or glob (`**/*.js`) specifying which files to read. | `bridge src/app.js` `bridge --src src/app.js`      |
| `ignore`               | `String | [String]` | Path to ignore. Works the same as `src`, but will override `src`.                                | `bridge src/**/*.js --ignore node_modules/**/*.js` |
