# nsyslog-parser
[![](https://data.jsdelivr.com/v1/package/npm/nsyslog-parser/badge?style=rounded)](https://www.jsdelivr.com/package/npm/nsyslog-parser)

Syslog Parser. Accepts [RFC 3164 (BSD)](https://tools.ietf.org/search/rfc3164), [RFC 5424](https://tools.ietf.org/html/rfc5424) and [CEF Common Event Format](https://community.saas.hpe.com/t5/ArcSight-Connectors/ArcSight-Common-Event-Format-CEF-Guide/ta-p/1589306) formats.
Although thought as a parser for stantard syslog messages, there are too many systems/devices out there that sends erroneous, propietary or simply malformed messages. **nsyslog-parser** is flexible enough to try and parse every single message to extract as many information as possible, without throwing any errors.

## Features

* [RFC 3164 (BSD)](https://tools.ietf.org/search/rfc3164) and [RFC 5424](https://tools.ietf.org/html/rfc5424) formats
* Extracts information of non standard, erroneus or malformed messages
* Parses [IETF Structured data](https://tools.ietf.org/html/rfc5424#section-6.3)
* Parses [CEF Common Event Format](https://community.saas.hpe.com/t5/ArcSight-Connectors/ArcSight-Common-Event-Format-CEF-Guide/ta-p/1589306)
* Recognizes non-standard host-chain header

## Installation

    npm install nsyslog-parser

## Usage

```
parser(line,options)
```

```javascript
const parser = require("nsyslog-parser");

// Standard BSD message
var bsdLine = "<34>Oct 11 22:14:15 mymachine su: 'su root' failed for lonvick on /dev/pts/8";

// IETF (RFC 5424) message, with structured data and chained hostnames
var ietfLine = "<110>1 2009-05-03T14:00:39.529966+02:00 host.example.org/relay.example.org syslogd 2138 - [exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"][exampleSDID@32474 iut="4" eventSource="Application" eventID="1012"][ssign VER="0111" RSID="1" SG="0" SPRI="0" GBC="2" FMN="1" CNT="7" HB="K6wzcombEvKJ+UTMcn9bPryAeaU= zrkDcIeaDluypaPCY8WWzwHpPok= zgrWOdpx16ADc7UmckyIFY53icE= XfopJ+S8/hODapiBBCgVQaLqBKg= J67gKMFl/OauTC20ibbydwIlJC8= M5GziVgB6KPY3ERU1HXdSi2vtdw= Wxd/lU7uG/ipEYT9xeqnsfohyH0=" SIGN="AKBbX4J7QkrwuwdbV7Taujk2lvOf8gCgC62We1QYfnrNHz7FzAvdySuMyfM="] BOMAn application event log entry";

// Syslog CEF (Common Event Format)
var cefLine = "Jan 18 11:07:53 dsmhost CEF:0|Trend Micro|Deep Security Manager|<DSM version>|600|User Signed In|3|src=10.52.116.160 suser=admin target=admin msg=User signed in from 2001:db8::5";
console.log(parser(bsdLine);
console.log(parser(ietfLine);
console.log(parser(cefLine);
```

## Results

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
	chain: [],
	fields: [],
	header: '<34>Oct 11 22:14:15 mymachine su: '
}
{
	originalMessage: '<110>1 2009-05-03T14:00:39.529966+02:00 host.example.org/relay.example.org syslogd 2138 - [exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"][exampleSDID@32474 iut="4" eventSource="Application" eventID="1012"][ssign VER="0111" RSID="1" SG="0" SPRI="0" GBC="2" FMN="1" CNT="7" HB="K6wzcombEvKJ+UTMcn9bPryAeaU= zrkDcIeaDluypaPCY8WWzwHpPok= zgrWOdpx16ADc7UmckyIFY53icE= XfopJ+S8/hODapiBBCgVQaLqBKg= J67gKMFl/OauTC20ibbydwIlJC8= M5GziVgB6KPY3ERU1HXdSi2vtdw= Wxd/lU7uG/ipEYT9xeqnsfohyH0=" SIGN="AKBbX4J7Qkrwu wdbV7Taujk2lvOf8gCgC62We1QYfnrNHz7FzAvdySuMyfM="] BOMAn application event log entry',
	pri: '<110>',
	prival: 110,
	facilityval: 13,
	levelval: 6,
	facility: 'security',
	level: 'info',
	version: 1,
	type: 'RFC5424',
	ts: '2009-05-03T12:00:39.529Z',
	host: 'relay.example.org',
	appName: 'syslogd',
	pid: '2138',
	messageid: '-',
	message: 'BOMAn application event log entry',
	chain: [ 'host.example.org' ],
	structuredData:
	[
		{
			'$id': 'exampleSDID@32473',
			iut: '3',
			eventSource: 'Application',
			eventID: '1011'
		},
		{
			'$id': 'exampleSDID@32474',
			iut: '4',
			eventSource: 'Application',
			eventID: '1012'
		},
		{
			'$id': 'ssign',
			VER: '0111',
			RSID: '1',
			SG: '0',
			SPRI: '0',
			GBC: '2',
			FMN: '1',
			CNT: '7',
			HB: 'K6wzcombEvKJ+UTMcn9bPryAeaU= zrkDcIeaDluypaPCY8WWzwHpPok= zgrWOdpx16ADc7UmckyIFY53icE= XfopJ+S8/hODapiBBCgVQaLqBKg= J67gKMFl/OauTC20ibbydwIlJC8= M5GziVgB6KPY3ERU1HXdSi2 vtdw= Wxd/lU7uG/ipEYT9xeqnsfohyH0=',
			SIGN: 'AKBbX4J7QkrwuwdbV7Taujk2lvOf8gCgC62We1QYfnrNHz7FzAvdySuMyfM='
		}
	],
  fields: [],
  header: '<110>1 2009-05-03T14:00:39.529966+02:00 host.example.org/relay.example.org syslogd 2138 - [exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"][exampleSDID@32474 iut="4" eventSource="Application" eventID="1012"][ssign VER="0111" RSID="1" SG="0" SPRI="0" GBC="2" FMN="1" CNT="7" HB="K6wzcombEvKJ+UTMcn9bPryAeaU= zrkDcIeaDluypaPCY8WWzwHpPok= zgrWOdpx16ADc7UmckyIFY53icE= XfopJ+S8/hODapiBBCgVQaLqBKg= J67gKMFl/OauTC20ibbydwIlJC8= M5GziVgB6KPY3ERU1HXdSi2vtdw= Wxd/lU7uG/ipEYT9xeqnsfohyH0=" SIGN="AKBbX4J7QkrwuwdbV7Tauj k2lvOf8gCgC62We1QYfnrNHz7FzAvdySuMyfM="]'
}

{
	originalMessage: 'Jan 18 11:07:53 dsmhost CEF:0|Trend Micro|Deep Security Manager|<DSM version>|600|User Signed In|3|src=10.52.116.160 suser=admin target=admin msg=User signed in from 2001:db8::5',
	pri: '',
	prival: NaN,
	type: 'CEF',
	ts: '2017-01-18T10:07:53.000Z',
	host: 'dsmhost',
	message: 'CEF:0|Trend Micro|Deep Security Manager|<DSM version>|600|User Signed In|3|src=10.52.116.160 suser=admin target=admin msg=User signed in from 2001:db8::5',
	chain: [],
	cef: {
		version: 'CEF:0',
		deviceVendor: 'Trend Micro',
		deviceProduct: 'Deep Security Manager',
		deviceVersion: '<DSM version>',
		deviceEventClassID: '600',
		name: 'User Signed In',
		severity: '3',
		extension: 'src=10.52.116.160 suser=admin target=admin msg=User signed in from 2001:db8::5'
	},
  fields: {
		src: '10.52.116.160',
		suser: 'admin',
		target: 'admin',
		msg: 'User signed in from 2001:db8::5'
	},
	header: 'Jan 18 11:07:53 dsmhost '
}
```

## Options

Options is a javascript object with the following parameters:
* cef : Parse CEF strcuture (*true* by default)
* fields : Parse Syslog structured data (*true* by default)
* pid : Separate the PID field in case the **app** header field has the **app[pid]** format (true by default)
