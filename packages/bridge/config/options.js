module.exports = [
  // bridge src/app/index.js src/vendor/**/*.js */
  // bridge --src src/app/index.js
  {
    name: 'src',
    type: String,
    multiple: true,
    defaultOption: true,
  },
  {
    name: 'ignore',
    type: String,
    multiple: true,
  },
];
