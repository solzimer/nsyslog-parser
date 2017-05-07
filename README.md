# nsyslog-parser
Syslog Parser. Accepts [RFC 3164 (BSD)](https://tools.ietf.org/search/rfc3164) and [RFC 5424](https://tools.ietf.org/html/rfc5424) formats

**Installation**

    npm install nsyslog-parser

**Usage**
```javascript
const parser = require("nsyslog-parser");

var bsdLine = "<34>Oct 11 22:14:15 mymachine su: 'su root' failed for lonvick on /dev/pts/8";
var ietfLine = "<165>1 2003-10-11T22:14:15.003Z mymachine.example.com evntslog - ID47 [exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"][exampleSDID@32474 iut="4" eventSource="Application" eventID="1012"] BOMAn application event log entry";

console.log(parser(bsdLine);
console.log(parser(ietfLine);
```

**Results**
```javascript
  {
  originalMessage: '<34>Oct 11 22:14:15 mymachine su: \'su root\' failed for lonvick on /dev/pts/8',
	pri: '<34>',
	prival: 34,
	facilityval: 4,
	levelval: 2,
	facility: 'auth',
	level: 'crit',
	type: 'BSD',
	ts: '2017-10-11T20:14:15.000Z',
	host: 'mymachine',
	appName: 'su',
	message: '\'su root\' failed for lonvick on /dev/pts/8',
	fields: [],
	header: '<34>Oct 11 22:14:15 mymachine su: '
}
{
	originalMessage: '<34>1 2003-10-11T22:14:15.003Z mymachine.example.com su - ID47 - BOM\'su root\' failed for lonvick on /dev/pts/8',
	pri: '<34>',
	prival: 34,
	facilityval: 4,
	levelval: 2,
	facility: 'auth',
	level: 'crit',
	version: 1,
	type: 'RFC5424',
	ts: '2003-10-11T22:14:15.003Z',
	host: 'mymachine.example.com',
	appName: 'su',
	pid: '-',
	messageid: 'ID47',
	structuredData: '-',
	message: 'BOM\'su root\' failed for lonvick on /dev/pts/8',
	structuredData:
	[
		{'$id': 'exampleSDID@32473',
		iut: '3',
		eventSource: 'Application',
		eventID: '1011' },
		{'$id': 'exampleSDID@32474',
		iut: '4',
		eventSource: 'Application',
		eventID: '1012' } ]
	fields: [],
	header: '<34>1 2003-10-11T22:14:15.003Z mymachine.example.com su - ID47 - '
}
```
