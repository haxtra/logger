const inspect = require('util').inspect

const globalConfig = {

	enabled: true,
	level: 'trace',
	group: true,
	timestamp: true,
	milli: true,
	color: true,
	icons: false,

	levels: {
		all:       {severity:0,  icon:'~', color: msg => `\x1b[1;38;5;242m${msg}\x1b[0m`},
		trace:     {severity:10, icon:'T', color: msg => `\x1b[1;38;5;242m${msg}\x1b[0m`},
		debug:     {severity:15, icon:'D', color: msg => `\x1b[1;38;5;246m${msg}\x1b[0m`},
		dev:       {severity:20, icon:'V', color: msg => `\x1b[1;38;5;250m${msg}\x1b[0m`},
		success:   {severity:25, icon:'S', color: msg => `\x1b[1;38;5;46m${msg}\x1b[0m`},
		ok:        {severity:25, icon:'✔', color: msg => `\x1b[1;38;5;46m${msg}\x1b[0m`},
		info:      {severity:30, icon:'I', color: msg => `\x1b[1;38;5;33m${msg}\x1b[0m`},
		notice:    {severity:35, icon:'N', color: msg => `\x1b[1;38;5;87m${msg}\x1b[0m`},
		warning:   {severity:40, icon:'W', color: msg => `\x1b[1;38;5;208m${msg}\x1b[0m`},
		alert:     {severity:45, icon:'A', color: msg => `\x1b[1;38;5;199m${msg}\x1b[0m`},
		error:     {severity:50, icon:'E', color: msg => `\x1b[1;38;5;196m${msg}\x1b[0m`},
		exception: {severity:55, icon:'X', color: msg => `\x1b[1;38;5;201m${msg}\x1b[0m`},
		critical:  {severity:60, icon:'C', color: msg => `\x1b[1;38;5;196;48;5;52m${msg}\x1b[0m`},
		fatal:     {severity:65, icon:'F', color: msg => `\x1b[1;38;5;15;48;5;52m${msg}\x1b[0m`},
		off:       {severity:99, icon:'-', color: false},
	},

	errorThreshold: 40, // warning and beyond
}

// active logger instances
const loggerPool = {}

// default export, get or create instance of a group logger
function spawnLogger(optsOrGroup, level){

	let opts;

	if(optsOrGroup === undefined){
		opts = {group:'app', level:null}
	} else if (typeof optsOrGroup == 'string') {
		opts = {group:optsOrGroup, level:level || null}
	} else if (typeof optsOrGroup == 'object') {
		opts = {group:optsOrGroup.group || 'app', level:optsOrGroup.level || null}
	} else {
		throw new Error('[console-logger]: invalid parameters')
	}

	if(!loggerPool[opts.group])
		loggerPool[opts.group] = new Logger(opts)

	return loggerPool[opts.group]
}

function setGlobalConfig(opts={}) {
	for(const optName in opts)
		globalConfig[optName] = opts[optName]
}


class Logger {

	constructor(opts={}){

		this.$ = loggerPool

		this.globalConfig = globalConfig

		this.localConfig = {
			enabled: opts.enabled === undefined ? true : !!opts.enabled,
			level: opts.level || null, // null follows global
			group: opts.group || 'app',
		}

		// add level handlers
		for(const level in globalConfig.levels)
			this[level] = (message, data) => this.log(level, message, data)
	}

	setGlobalConfig = setGlobalConfig

	spawn = spawnLogger

	setLevel(level) {
		/** Set local logging level **/

		// level can be null, or a string
		if(level === null || globalConfig.levels[level])
			this.localConfig.level = level
		else
			throw new Error('[console-logger]: invalid level')
	}

	setGlobalLevel(level){
		/** Set global logging level **/

		if(globalConfig.levels[level])
			this.globalConfig.level = level
		else
			throw new Error('[console-logger]: invalid level')
	}

	setGroup(groupName) {
		/** Change logger group name **/

		// check if group name is available
		if(this.$[groupName])
			throw new Error('[console-logger]: group already exists')

		// update name in the pool
		this.$[groupName] = this.$[this.localConfig.group]

		// update local name
		this.localConfig.group = groupName
	}

	log(level, message, data) {
		/**	Print log to stdout or stderr depending on level
				:level 			(str) log level
				:message		(str) message to log
				:data			(any) data to dump
				@return 		(bool) success, if level was sufficient to log
		**/

		// check if level meets active threshold
		if(!this.isLoggable(level))
			return false

		// string concat is ~x250 faster than array join
		let line = ''

		const timestamp = this.globalConfig.timestamp ? this.getTimestamp() + ' ' : ''

		// add group and level
		const levelSymbol = this.globalConfig.icons ? this.globalConfig.levels[level].icon : level
		if(this.globalConfig.group)
			line += '[' + this.localConfig.group + '|' + levelSymbol + '] '
		else
			line += '[' + levelSymbol + '] '

		// construct line, with optional color
		line = timestamp + (this.globalConfig.color
								? this.globalConfig.levels[level].color(line + message)
								: line + message)

		// get relevant writer
		const writer = this.globalConfig.levels[level].severity < this.globalConfig.errorThreshold
						? process.stdout
						: process.stderr

		// print log
		writer.write(line + '\n')

		// print associated data
		if(data)
			writer.write(inspect(data, false, null, this.globalConfig.color) + '\n')

		return true
	}

	isLoggable(level) {
		/** Answer if asked level is loggable **/

		// deny if local or global log is disabled
		if(!this.localConfig.enabled || !this.globalConfig.enabled)
			return false

		// get current logging level, from local or global setting
		const loggableLevel = this.localConfig.level === null
								? this.globalConfig.level
								: this.localConfig.level

		// only allow if severity is above the threshold
		if(this.globalConfig.levels[level].severity >= this.globalConfig.levels[loggableLevel].severity)
			return true
		else
			return false
	}

	getTimestamp() {
		/** Return formatted timestamp **/

		const t = new Date()
		const d = new Date(t - (t.getTimezoneOffset() * 60 * 1000)).toISOString()
		return this.globalConfig.milli
			? d.replace('T',' ').replace('Z','')
			: d.replace('T',' ').split('.')[0]
	}

	// Controls ///////////////////////////////////////////

	pause() {
		this.localConfig.enabled = false
	}

	resume() {
		this.localConfig.enabled = true
	}

	pauseGlobal() {
		this.globalConfig.enabled = false
	}

	resumeGlobal() {
		this.globalConfig.enabled = true
	}

	dispose(){
		/** Destroy logger instance **/
		delete this.$[this.localConfig.group]
	}
}

spawnLogger.config = setGlobalConfig

module.exports = spawnLogger