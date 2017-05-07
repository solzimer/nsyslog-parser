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
	'<165>1 2003-10-11T22:14:15.003Z mymachine.example.com evntslog - ID47 [exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"][exampleSDID@32474 iut="4" eventSource="Application" eventID="1012"] BOMAn application event log entry'
]

MSGS.map(parser).forEach(e=>console.log(e));
var s = Date.now();
for(var i=0;i<COUNT;i++)
	MSGS.forEach(parser);
var e = Date.now();
var t =((e-s)/1000)/MSGS.length;
var r = Math.floor(COUNT/t);
console.log(r+" messages per second");
