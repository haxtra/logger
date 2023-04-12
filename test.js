const Logger = require('./')

function printHeader(header) {
	console.log(`\n\x1b[1;92m --- ${header.toUpperCase()} ---\x1b[0m\n`)
}

function printLog(logger) {
	for(const logLevel in logger.globalConfig.levels)
		logLevel != 'all' && logLevel != 'off' && logger[logLevel]('Lorem ipsum dolor sit amet')
}

// configure global setting
Logger.config({level:'trace'})

// create loggers
const applog = Logger('app')
const apilog = applog.spawn('api')

// go
printHeader('full (labels)')
printLog(applog)

printHeader('full (icons)')
Logger.config({icons:true})
printLog(applog)

printHeader('no milliseconds')
Logger.config({milli:false, icons:false})
printLog(applog)

printHeader('no timestamp')
Logger.config({timestamp:false})
printLog(applog)

printHeader('no group')
Logger.config({group:false})
printLog(applog)

printHeader('warns & errors only')
applog.setLevel('warning')
printLog(applog)

printHeader('no color')
Logger.config({color:false})
printLog(applog)

// config reset
Logger.config({
	group: true,
	timestamp: true,
	milli: true,
	color: true,
	icons: false,
})

printHeader('local level: global')
applog.setLevel(null)
applog.setGlobalLevel('error')
printLog(applog)

printHeader('local level: independent')
apilog.setLevel('success')
printLog(apilog)

printHeader('paused')
applog.pause()
printLog(applog)
// reset
applog.setGlobalLevel('trace')
apilog.setLevel(null)

printHeader('peer logger')
printLog(apilog)

printHeader('global pause')
applog.pauseGlobal()
printLog(applog)
printLog(apilog)

printHeader('full with data')
applog.resumeGlobal()
applog.resume()
applog.setLevel(null)

applog.info('Lorem ipsum dolor sit amet', {foo:'bar', baz:123})

// end with blank line
console.log('')
