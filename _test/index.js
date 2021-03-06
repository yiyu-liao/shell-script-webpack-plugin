const webpack = require('webpack');
const test = require('ava');
const { resolve, join } = require('path');
const ShellPlugin = require('../index.js')

const outputPath = resolve(__dirname, '../.tmp')

const { remove } = require('fs-extra')


function build(config) {
    return new Promise((resolve, rejects) => {
        webpack(config, (error, stats) => {
            if (error || stats.hasErrors()) {
                rejects(error ||stats.toJson('errors-only').errors);
                return;
            }
            resolve(`${config.output.path}/${config.output.filename}`);
        })

    })
}

function createConfig(pluginScript) {
    return {
        entry: resolve(__dirname, './entry.js'),
        output: {
            path: outputPath,
            filename: 'tmp.js'
        },
        plugins: [new ShellPlugin(pluginScript)]
    }
}

test('it should new a json file', async ({ truthy }) => {
    let config = createConfig({ beforeRun: ['sh ./_test/test.sh'] });
    return build(config).then(() => {
        const testJson = require('../.tmp/test.json');
        const testModule = require(join(outputPath, 'tmp.js'));
        truthy(testJson.test)
        truthy(testModule)
    }).catch(e => {
        console.log('build error', e)
    })
})

test.after.always('cleanup dist file', () => remove(outputPath))