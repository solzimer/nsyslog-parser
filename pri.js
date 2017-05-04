const FACILITY = [
	{id:"kern", label:"kernel messages"},
	{id:"user", label:"user-level messages"},
	{id:"mail", label:"mail system"},
	{id:"daemon", label:"system daemons"},
	{id:"auth", label:"security/authorization messages"},
	{id:"syslog", label:"messages generated internally by syslogd"},
	{id:"lpr", label:"line printer subsystem"},
	{id:"news", label:"network news subsystem"},
	{id:"uucp", label:"UUCP subsystem"},
	{id:"cron", label:"clock daemon"},
	{id:"authpriv", label:"security/authorization messages"},
	{id:"ftp", label:"FTP daemon"},
	{id:"ntp", label:"NTP subsystem"},
	{id:"security", label:"log audit"},
	{id:"console", label:"log alert"},
	{id:"solaris-cron", label:"clock daemon"},
	{id:"local0", label:"locally used facility 0"},
	{id:"local1", label:"locally used facility 0"},
	{id:"local2", label:"locally used facility 0"},
	{id:"local3", label:"locally used facility 0"},
	{id:"local4", label:"locally used facility 0"},
	{id:"local5", label:"locally used facility 0"},
	{id:"local6", label:"locally used facility 0"},
	{id:"local7", label:"locally used facility 0"}
];

const LEVEL = [
	{id:"emerg", label:"system is unusable"},
	{id:"alert", label:"action must be taken immediately"},
	{id:"crit", label:"critical conditions"},
	{id:"error", label:"error conditions"},
	{id:"warn", label:"warning conditions"},
	{id:"notice", label:"normal but significant condition"},
	{id:"info", label:"informational messages"},
	{id:"debug", label:"debug-level messages"}
]

var FACILITY_MAP = [];
var LEVEL_MAP = [];

FACILITY.forEach((f,i)=>FACILITY_MAP[f.id]=i);
LEVEL.forEach((l,i)=>LEVEL_MAP[l.id]=i);

module.exports.LEVEL = LEVEL;
module.exports.FACILITY = FACILITY;
module.exports.LEVELS = LEVEL_MAP;
module.exports.FACILITIES = FACILITY_MAP;
module.exports.get = function(val1,val2) {
	if(typeof(val1)=="number" && typeof(val2)=="undefined") {
		return {
			level : val1 & 0x7,
			facility : val1 >> 3
		}
	}
	else if(typeof(val1)=="number" && typeof(val2)=="number") {
		return val1*8 + val2;
	}
	else if(typeof(val1)=="string" && typeof(val2)=="number") {
		return (FACILITY_MAP[val1]||0)*8 + val2;
	}
	else if(typeof(val1)=="number" && typeof(val2)=="string") {
		return val1*8 + (LEVEL_MAP[val2]||0);
	}
	else if(typeof(val1)=="string" && typeof(val2)=="string") {
		return (FACILITY_MAP[val1]||0)*8 + (LEVEL_MAP[val2]||0);
	}
	else {
		return {level:0, facility:0}
	}
}
