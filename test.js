const parser = require("./parser.js");

const COUNT = 50000;
const MSGS = require("./test/examples.js");

//MSGS.map(m=>parser(m.line,null)).forEach(e=>console.log(e));

function compare(o1,o2) {
	if(o1==null && o2==null) return true;

	let keys = Object.keys(o1);
	for(let i=0;i<keys.length;i++)  {
		let f1 = o1[keys[i]];
		let f2 = o2[keys[i]];
		if(typeof(f1)!=typeof(f2)) return false;
		else if(typeof(f1)!="object") {
			if(f1!=f2) return false;
		}
		else {
			if(!compare(f1,f2)) return false;
		}
	}
	return true;
}

let errs = [];
MSGS.forEach((m)=>{
	let res = parser(m.originalMessage);
	res.ts = m.ts = null;
	res = JSON.parse(JSON.stringify(res));

	if(!compare(m,res))
		errs.push({result:res,expected:m});
});

if(errs.length) {
	errs.forEach(err=>{
			console.log(err);
			console.log("------------------------------------------\n");
	});
}
else {
	console.log('All tests OK');
}

var s = Date.now();
var i=0,j=0;
var opts = {cef:false,fields:false};

function next() {
	parser(MSGS[(i++)%MSGS.length].line,opts);
	j++;
	setTimeout(next,1000);
}

/*
setTimeout(()=>{
	var e = Date.now();
	var t =((e-s)/1000);
	var r = Math.floor(j/t);
	console.log(r+" messages per second");
	process.exit();
},10000);
*/
//next();
