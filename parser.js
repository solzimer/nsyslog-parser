const
	moment = require("moment"),
	Pri = require("./pri.js");

const RXS = {
	"pri" : /^<\d+>/,
	"prinmr" : /^\d+ /,
	"prival" : /<(\d+)>/,
	"month" : /^[a-zA-Z]{3} /,
	"day" : /^\d{1,2} /,
	"time" : /^\d+:\d+:\d+ /,
	"ts" : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\S+ /,
	"invalid" : /[^a-zA-Z0-9\.\$\-_#%\/]/,
	"sdata" : /\[(\S+)( [^\=]+\=\"[^\"]+\")+\]/g,
}

Array.prototype.peek = function() {
	do {
		var item = this.shift();
		if(item===undefined) return item;
		else item = item.trim();
	}while(!item);

	return item;
}

function assign(entry,item) {
	if(!entry.host) entry.host = item.trim();
	else if(!entry.appName) entry.appName = item.trim();
	else if(!entry.pid) entry.pid = item.trim();
	else if(!entry.messageid) entry.messageid = item.trim();
	else if(!entry.structuredData) entry.structuredData = item.trim();
	else return true;
}

function parse(line) {
	var pri = line.match(RXS.pri);
	var entry = {
		originalMessage : line
	};

	// First priority
	if(pri) {
		entry.pri = pri[0];
		entry.prival = parseInt(entry.pri.match(RXS.prival)[1]);
		var prival = Pri.get(entry.prival);
		entry.facilityval = prival.facility;
		entry.levelval = prival.level;
		entry.facility = Pri.FACILITY[prival.facility].id;
		entry.level = Pri.LEVEL[prival.level].id;
	}
	else {
		entry.pri = "";
		entry.prival = NaN;
	}

	//Split message
	var items = line.substring(entry.pri.length).split(" ");

	// Date search
	var endparse = false;
	while(line.length && !endparse) {
		var item = items.peek()+" ";

		// RFC RFC5424
		if(item.match(RXS.prinmr)) {
			entry.version = parseInt(item);
			entry.type = "RFC5424";
			item = items.peek()+" ";
			if(item.match(RXS.ts)) {
				entry.ts = moment(item.match(RXS.ts)[0].trim()).toDate();
			}
		}
		// BSD
		else if(item.match(RXS.month)) {
			entry.type = "BSD";
			var month = item.trim();
			var day = items.peek();
			var time = items.peek();
			entry.ts = moment(month+" "+day+" "+time,"MMM DD HH:mm:ss").toDate();
		}
		else {
			entry.type = "UNKNOWN";
			items.unshift(item.trim());
		}
		endparse = true;
	}

	// No timestamp
	if(!entry.ts) entry.ts = new Date();

	// Is a standard syslog message
	if(entry.type) {
		endparse = false;
		while(line.length && !endparse) {
			var item = items.peek();
			if(!item) {
				endparse = true;
			}
			else if(item.endsWith(":")){
				assign(entry,item.replace(/:$/,"").trim())
				entry.message = items.join(" ");
				endparse = true;
			}
			else if(!items.length) {
				items.unshift(item);
				entry.message = items.join(" ");
				endparse = true;
			}
			else {
				// Invalid item (malformed message)
				if(item.match(RXS.invalid)) {
					items.unshift(item);
					entry.message = items.join(" ");
					endparse = true;
				}
				else {
					var r = assign(entry,item.replace(/: $/,"").trim())
					if(r) {
						items.unshift(item);
						entry.message = items.join(" ");
						endparse = true;
					}
				}
			}
		}
	}
	else {
		entry.message = items.join(" ");
	}

	// Structured data
	if(entry.type=="RFC5424") {
		var sdata = entry.message.match(RXS.sdata) || [];
		var idx=0;
		entry.structuredData = sdata.map(item=>{
			var map = {}, nokeys = [];
			var lastKey = null;
			idx = entry.message.indexOf(item)+item.length+1;
			item.replace(/(^\[)|(\]$)/g,"").split(" ").forEach((t,i)=>{
				// Extra space
				if(!t.trim()) return;
				// First element (ID of data)
				if(i==0) {
					map["$id"] = t;
				}
				// Key/Pair values
				else {
					var kv = t.split("=");
					// Correct key/value pair
					if(kv[0] && kv[1] && kv[1]!='"') {
						lastKey = kv.shift();
						map[lastKey] = kv.join("=").replace(/\"/g,"");
					}
					// Last key had values separated by spaces
					else if(kv[0] && kv[1]===undefined){
						map[lastKey] += " "+(kv[0]||"").replace(/\"/g,"");
					}
					else if(kv[0] && (!kv[1].length || kv[1]=='"')){
						map[lastKey] += " "+(kv[0]||"").replace(/\"/g,"")+"=";
					}
				}
			});
			return map;
		});
		entry.message = entry.message.substring(idx);
	}

	// Message with fields
	var fields = [];
	entry.message.split(",").forEach(kv=>{
		var prop = kv.split("=");
		if(prop.length==2)
			fields[prop[0]] = prop[1];
	});
	entry.fields = fields;

	// header
	entry.header = line.substring(0,line.length-entry.message.length);

	return entry;
}

module.exports = function(line) {try {return parse(line)}catch(err){return {err:err}}};
