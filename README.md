# Views (viewsdx.com) language morpher's webpack loader

Add a rule to your `webpack.config.js`'s `module/rules` list like:

```
module.exports = {
  module: {
    rules: [
      {
        test: /\.view$/,
        exclude: /(node_modules)/,
        loader: 'views-loader',
        options: {
          map: {
            Time: 'react-time',
          },
          // src: `${__dirname}/src`,
        },
      }
    ],
    // ...
  }
  // ...
}
```

See https://github.com/viewsdx/test-webpack for a sample app using this loader.

## Known limitations
If you add a new file, you'll have to modify an existing one for webpack to recognise it.

License BSD-Clause-3

by UXtemple
