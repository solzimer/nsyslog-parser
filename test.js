const parser = require("./parser.js");

const COUNT = 50000;
const MSGS = [
	"<34>Oct 11 22:14:15 mymachine su: 'su root' failed for lonvick on /dev/pts/8",
	"<34>1 2003-10-11T22:14:15.003Z mymachine.example.com su - ID47 - BOM'su root' failed for lonvick on /dev/pts/8",
	'<189>May 3 16:02:05 192.168.26.254 date=2017-05-03 time=16:02:05 devname=FG600B3909601440 devid=FG600B3909601440 logid=0000000013 type=traffic subtype=forward level=notice vd=VDOM-SNOC srcip=192.168.110.60 srcport=57668 srcintf="port7" dstip=192.168.15.100 dstport=443 dstintf="Gestion" sessionid=128467614 proto=6 action=close policyid=33 dstcountry="Reserved" srccountry="Reserved" trandisp=snat transip=192.168.15.254 transport=57668 service="HTTPS" duration=35 sentbyte=132 rcvdbyte=172 sentpkt=3 rcvdpkt=4 appcat="unscanned"',
	'192.168.26.254 time=16:31:28 devname=FG600B3909601440 devid=FG600B3909601440 logid=0000000013 type=traffic subtype=forward level=notice vd=VDOM-SNOC srcip=192.168.22.68 srcport=51448 srcintf="port3" dstip=216.58.210.174 dstport=443 dstintf="port7" sessionid=128625552 proto=6 action=close policyid=39 dstcountry="United States" srccountry="Reserved" trandisp=noop service="HTTPS" duration=241 sentbyte=132 rcvdbyte=92 sentpkt=3 rcvdpkt=2 appcat="unscanned"',
	'<189>time=16:31:28 devname=FG600B3909601440 devid=FG600B3909601440 logid=0000000013 type=traffic subtype=forward level=notice vd=VDOM-SNOC srcip=192.168.22.68 srcport=51448 srcintf="port3" dstip=216.58.210.174 dstport=443 dstintf="port7" sessionid=128625552 proto=6 action=close policyid=39 dstcountry="United States" srccountry="Reserved" trandisp=noop service="HTTPS" duration=241 sentbyte=132 rcvdbyte=92 sentpkt=3 rcvdpkt=2 appcat="unscanned"',
	'<189>192.168.26.254 time=16:31:28 devname=FG600B3909601440 devid=FG600B3909601440 logid=0000000013 type=traffic subtype=forward level=notice vd=VDOM-SNOC srcip=192.168.22.68 srcport=51448 srcintf="port3" dstip=216.58.210.174 dstport=443 dstintf="port7" sessionid=128625552 proto=6 action=close policyid=39 dstcountry="United States" srccountry="Reserved" trandisp=noop service="HTTPS" duration=241 sentbyte=132 rcvdbyte=92 sentpkt=3 rcvdpkt=2 appcat="unscanned"',
	'<189>192.168.26.254 myApp time=16:31:28 devname=FG600B3909601440 devid=FG600B3909601440 logid=0000000013 type=traffic subtype=forward level=notice vd=VDOM-SNOC srcip=192.168.22.68 srcport=51448 srcintf="port3" dstip=216.58.210.174 dstport=443 dstintf="port7" sessionid=128625552 proto=6 action=close policyid=39 dstcountry="United States" srccountry="Reserved" trandisp=noop service="HTTPS" duration=241 sentbyte=132 rcvdbyte=92 sentpkt=3 rcvdpkt=2 appcat="unscanned"',
	'<165>1 2003-10-11T22:14:15.003Z mymachine.example.com evntslog - ID47 [exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"][exampleSDID@32474 iut="4" eventSource="Application" eventID="1012"] BOMAn application event log entry',
	'<30>May  8 00:01:01 logica5_engine6 systemd: Starting Session 63 of user root.',
	'<13>May 9 11:41:08 192.168.110.11 MSWinEventLog 1 ||{54849625-5478-4994-A5BA-3E3B0328C30D}||Microsoft-Windows',
	'Jun 15 17:13:50 192.168.17.72 MSWinEventLog 1 ||||MsiInstaller||11707||0||Información||Ninguna||||Clásico||2010/06/15 17:13:50||381||||||0||0||0||0|| ||Application||WIN-ZARKLN8SUVH||Administrador||Producto: Microsoft .NET Framework 3.5 -- La instalación se completó correctamente.;(NULL);(NULL);;||Producto: Microsoft .NET Framework 3.5 -- La instalación se completó correctamente.',
	'<13>May  9 16:56:32 192.168.110.12 MSWinEventLog 1 ||{54849625-5478-4994-A5BA-3E3B0328C30D}||Microsoft-Windows-Security-Auditing||4634||0||Informaciï¿½n||||Informaciï¿½n||Auditorï¿½a correcta||2017-05-09 16:56:32||267119563||||||492||384||0||0|| ||Security||GICA-DC-02.grupoica.local||||S-1-5-21-1549636476-3519663633-904275800-7216;GVDI-SEV-010$;GRUPOICA;1C5B0D9Fh;3||Se cerrï¿½ sesiï¿½n en una cuenta.    Sujeto:  \tId. de seguridad:\t\tS-1-5-21-1549636476-3519663633-904275800-7216  \tNombre de cuenta:\t\tGVDI-SEV-010$  \tDominio de cuenta:\t\tGRUPOICA  \tId. de inicio de sesiï¿½n:\t\t0x1c5b0d9f    Tipo de inicio de sesiï¿½n:\t\t\t3    Este evento se genera cuando se destruye una sesiï¿½n de inicio. Puede estar correlacionado de manera positiva con un evento de inicio de sesiï¿½n mediante el valor Id. de inicio de sesiï¿½n. Los id. de inicio de sesiï¿½n sï¿½lo son ï¿½nicos entre reinicios en el mismo equipo.\n',
	'<7>1 2017-05-11T14:45:31.995+02:00 logica5p storm1 - - - 192.168.120.172 - - [04/Nov/2015:15:11:33 +0100] "GET /localclassifieds//classifieds/Site_Admin/admin.php  HTTP/1.1" 404 1137 "-" "Mozilla/5.0 [en] (X11, U; OpenVAS 7.0.2)"',
	'May 06 10:05:03 CCLogTap::profileRemoved, Owner: com.apple.iokit.IO80211Family, Name: IO80211AWDLPeerManager',
	'<110>1 2009-05-03T14:00:39.529966+02:00 host.example.org/relay.example.org syslogd 2138 - [exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"][exampleSDID@32474 iut="4" eventSource="Application" eventID="1012"][ssign VER="0111" RSID="1" SG="0" SPRI="0" GBC="2" FMN="1" CNT="7" HB="K6wzcombEvKJ+UTMcn9bPryAeaU= zrkDcIeaDluypaPCY8WWzwHpPok= zgrWOdpx16ADc7UmckyIFY53icE= XfopJ+S8/hODapiBBCgVQaLqBKg= J67gKMFl/OauTC20ibbydwIlJC8= M5GziVgB6KPY3ERU1HXdSi2vtdw= Wxd/lU7uG/ipEYT9xeqnsfohyH0=" SIGN="AKBbX4J7QkrwuwdbV7Taujk2lvOf8gCgC62We1QYfnrNHz7FzAvdySuMyfM="] BOMAn application event log entry'
]

MSGS.map(parser).forEach(e=>console.log(e));

var s = Date.now();
var i=0,j=0;

function next() {
	parser(MSGS[(i++)%MSGS.length]);
	j++;
	setImmediate(next);
}

setTimeout(()=>{
	var e = Date.now();
	var t =((e-s)/1000);
	var r = Math.floor(j/t);
	console.log(r+" messages per second");
	process.exit();
},10000);

next();
