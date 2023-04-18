# logger

Configurable console logger with support for multiple independent groups.

[![Screenshot](https://media.haxtra.com/logger.png)](https://media.haxtra.com/logger.png)


## Install

	npm i @haxtra/logger


## Usage

Basic

```js
const Logger = require('@haxtra/logger')

const log = Logger()
log.info('Hello world!')
// > 2027-09-20 19:50:57.810 [app|info] Hello world!
```

Multiple loggers

```js
// equivalent
const apilog = Logger('api')
const apilog = log.spawn('api')
```

Set name and level at creation time

```js
// equivalent
Logger('api', 'warning')
Logger({group:'api', level:'warning'})

log.spawn('api', 'warning')
log.spawn({group:'api', level:'warning'})
```

Log arbitrary objects

```js
log.info('Mysterious object', {foo:'bar'})
// > 2027-09-20 19:50:57.810 [app|info] Mysterious object
// > { foo: 'bar' }
```


## Config

### Global

Configure global settings

```js
// showing defaults
Logger.config({
	level: 'trace',   // global log level, for instances that follow global setting (see Levels below)
	group: true,      // display group name, ie [app|info] vs [info]
	timestamp: true,  // display timestamps
	milli: true,      // display timestamps with millisecond resolution
	color: true,      // use colors in logging
	icons: false,     // use icons instead of level names, ie [I] vs [info]
})
```

Global settings can also be changed via logger instance

```js
log.setGlobalConfig(object)
```

### Instance

Set level

```js
log.setLevel(level)
```

Set global level

```js
log.setGlobalLevel(level)
```

Change group name

```js
log.setGroup(groupName)
```


## Log Levels

By default, instances have a level of `null`, and they follow the global setting. But you can, for example, set `error` as the global level and then `trace` for a particular instance to get a detailed log from just that one particular module.

```js
// info, logs to stdout
log.trace
log.debug
log.dev
log.success
log.ok
log.info
log.notice

// errors, logs to stderr
log.warning
log.alert
log.error
log.exception
log.critical
log.fatal
```
Set levels by:

```js
log.setLevel(level)       // instance level
log.setGlobalLevel(level) // global level
```


## Pausing output

Logging can be paused anytime by:

```js
// cycle instance logging
log.pause()
log.resume()

// cycle global logging
log.pauseGlobal()
log.resumeGlobal()
```


## Remove logger

Delete logger instance by:

```js
log.dispose()
```


## Haxxor Tricks

Access underlying state via these objects:

```js
log.$ // active instances
log.localConfig
log.globalConfig
```


## File logging

Currently `logger` does not support file logging, but you can redirect `stdout` and `stderr` to a file, by using the commands below. Note: you might want to disable color output, or strip ansi control codes on the fly with tools like `ansi2txt` or `sed`.

```console
# log stdout and stderr to one file
node app.js >> app.log 2>&1

# log stdout and stderr to separate files
node app.js >> stdout.log 2>> stderr.log
```


## License

MIT

![](https://hello.haxtra.com/gh-logger)