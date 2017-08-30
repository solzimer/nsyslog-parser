const parser = require("./parser.js");

const COUNT = 50000;
const MSGS = require("./test/examples.js");

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
