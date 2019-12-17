const { spawn } = require('child_process');
const NAME = 'ShellScriptPlugin';

class ShellScriptPlugin {
    constructor (hooks = {}) {
        this._hooks = hooks;
        this._process = {};
    }

    apply (compiler) {
        this.watch = compiler.watch;
        Object.keys(this._hooks).forEach(name => {
            if (!compiler.hooks[name]) {
                this._handlerError(`The hook [${name}] is not exist in webpack compiler`);
            } else {
                compiler.hooks[name].tap(NAME, () => {
                    this._hooks[name].forEach(script => this._runScript(script));
                });
            }
        });
    }

    _parseScrpit (script) {
        if (typeof script === 'string') {
            const [command, ...args] = script.split(' ');
            return { command, args };
        }
        const [command, ...args] = script;
        return { command, args };
    }

    _killProcess (key) {
        this._process[key].kill();
    }

    _runScript (script) {
        const key = typeof script === 'string' ? script : JSON.stringify(script);
        if (this._process[key]) this._killProcess(key);
        const { command, args } = this._parseScrpit(script);

        this._process[key] = spawn(command, args, { stdio: 'pipe' });

        this._process[key].on('error', this._onScriptError.bind(this, key));

        this._process[key].stderr.on('data', this._onScriptError.bind(this, key));

        this._process[key].on('exit', this._onScriptComplete.bind(this, key));
    }

    _log (msg) {
        msg = `\n[${NAME}] ${msg}\n`;
        console.log(msg);
    }

    _handlerError (msg) {
        msg = `\n[${NAME}] ${msg}\n`;

        if (!this.watch) {
            throw Error(msg);
        }
        console.error(msg);
    }

    _onScriptError (script, error) {
        this._handlerError(`Running Script ${script} Error: ${error}`);
    }

    _onScriptComplete (key, error, msg) {
        this._process[key] = null;

        if (msg === 'SIGTERM' || msg === 'SIGINT') {
            this._log(`Killing script: ${key}\n`);
        } else if (!error) {
            this._log(`Completed script: ${key}\n`);
        }
    }
}

module.exports = ShellScriptPlugin;
