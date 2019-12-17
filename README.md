# Shell script Plugin

A webpack plugin to run shell script by trgger webpack compiler hooks

## How to use 🤪？

### install

```
npm i --save-dev shell-script-webpack-plugin
```

### webpack config


```
const ShellScript = require('shell-script-webpack-plugin');

module.exports = {
    plugins: [new ShellScript({
        watchRun: 'your script'
    })]
}
```


## link
[webpack hooks](https://webpack.docschina.org/api/compiler-hooks/)
