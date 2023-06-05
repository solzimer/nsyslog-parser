const Pri = require("./pri.js");
const CEF = require("./cef.js");
const { isValidTimeZone } = require("./isValidTimeZone.js");

const RXS = {
	"pri" : /^<\d+>/,
	"prinmr" : /^\d+ /,
	"prival" : /<(\d+)>/,
	"month" : /^[A-Za-z]{3} /,
	"day" : /^\d{1,2}/,
	"time" : /^\d+:\d+:\d+ /,
	"ts" : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\S+ /,
	"invalid" : /[^a-zA-Z0-9\.\$\-_#%\/\[\]\(\)]/,
	"sdata" : /\[(\S+)( [^\=]+\=\"[^\"]*\")+\]/g,
	"asdata" : /^\s*[^\[]+\[/,
	"bsdata" : /^\s*\[/,
	"cef" : /^CEF:\d+/
}

const DOPS = {
	cef : true,
	fields : true,
	pid : true,
	generateTimestamp: true
}

/**
 * Removes the first non whitespace item from the array and returns the item
 * @param {string[]} arr the array to shift the item from
 * @returns the first non whitespace item of the array
 */
function shiftItem(arr) {
	do {
		var item = arr.shift();
		if(item===undefined) return item;
		else item = item.trim();
	}while(!item);

	return item;
}

/**
 * Gets the first non whitespace item from the array without mutating the array
 * @param {string[]} arr the array to peek for the first item
 * @returns the first non whitespace item of the array
 */
function peekItem(arr) {
	for (const item of arr) {
		let trimmedItem = item.trim();
		if (trimmedItem) {
			return trimmedItem;
		}
	}
	return undefined;
}

function assign(entry,item) {
	if(!entry.host) entry.host = item.trim();
	else if(!entry.appName) entry.appName = item.trim();
	else if(!entry.pid) entry.pid = item.trim();
	else if(!entry.messageid) entry.messageid = item.trim();
	else if(!entry.structuredData) {
		entry.structuredData = item.trim();
		return false;
	}
	else return true;
}

function parse(line,opts) {
	if(opts)
		opts = Object.assign({},DOPS,opts);
	else
		opts = DOPS;

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
		entry.prival = null;
	}

	//Split message
	var items = line.substring(entry.pri.length).split(" ");

	// Date search
	var endparse = false;
	while(line.length && !endparse) {
		var item = shiftItem(items)+" ";
		var nextItem = peekItem(items);

		// RFC RFC5424
		if(item.match(RXS.prinmr)) {
			entry.version = parseInt(item);
			entry.type = "RFC5424";
			item = shiftItem(items)+" ";
			if(item.match(RXS.ts)) {
				entry.ts = new Date(Date.parse(item.match(RXS.ts)[0].trim()));
			}
		}
		// BSD
		else if(item.match(RXS.month) && nextItem && nextItem.match(RXS.day)) {
			entry.type = "BSD";
			const month = item.trim();
			const day = shiftItem(items);
			let time = shiftItem(items);
			let year = new Date().getYear() + 1900
			let timezone = "";
			// Check if the time is actually a year field and it is in the form "MMM dd yyyy HH:mm:ss"
			if (time.length === 4 && !Number.isNaN(+time)) {
				year = +time;
				time = shiftItem(items);
			}
			// Check if we have a timezone
			if (isValidTimeZone(items[0].trim())) {
				timezone = shiftItem(items);
			}

			entry.ts = new Date(Date.parse(`${year} ${month} ${day} ${time} ${timezone}`.trim()));
		}
		else {
			entry.type = "UNKNOWN";
			items.unshift(item.trim());
		}
		endparse = true;
	}

	// No timestamp
	if(!entry.ts && opts.generateTimestamp) entry.ts = new Date();

	// Is a standard syslog message
	if(entry.type) {
		endparse = false;

		function invalidate(item) {
			items.unshift(item);
			entry.message = items.join(" ");
			endparse = true;
		}

		while(line.length && !endparse) {
			var item = shiftItem(items);
			if(!item) {
				endparse = true;
			}
			else if(item.endsWith(":")){
				let eitem = item.replace(/:$/,"").trim();
				if(eitem.match(RXS.invalid)) {
					invalidate(item);
				}
				else {
					assign(entry,eitem)
					entry.message = items.join(" ");
					endparse = true;
				}
			}
			else if(!items.length) {
				invalidate(item);
			}
			else {
				// Invalid item (malformed message)
				if(item.match(RXS.invalid)) {
					invalidate(item);
				}
				else {
					var r = assign(entry,item.replace(/: $/,"").trim())
					if(r===true) {
						items.unshift(item);
						entry.message = items.join(" ");
						endparse = true;
					}
					else if(r===false) {
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

	// Chained hostnames
	entry.chain = (entry.host||"").split("/");
	entry.host = entry.chain.pop();

	if (entry.message !== undefined) {
		// Structured data
		if(entry.type=="RFC5424") {
			// Look if sdata if before or after message
			let bsdata = RXS.bsdata.test(entry.message);
			let asdata = RXS.asdata.test(entry.message);

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

			// Structured data parsed successfuly
			if(entry.structuredData.length) {
				let sidx = entry.message.indexOf("[");
				// sdata before message
				if(bsdata) {
					if(sidx>=0) entry.header = line.substring(0,line.length-entry.message.length);
					entry.message = entry.message.substring(idx);
				}
				// sdata after message
				else if(asdata) {
					if(sidx>=0) {
						entry.header = line.substring(0,line.length-entry.message.length);
						entry.message = entry.message.substring(0,sidx);
					}
				}
			}
		}

		// CEF Event message
		if(opts.cef!==false && RXS.cef.test(entry.message)) {
			entry.type = "CEF";
			let cef = CEF.parse(entry.message);
			entry.cef = cef.headers;
			entry.fields = cef.fields;
		}
		// Default syslog message
		else if(opts.fields!==false && entry.type!="UNKNOWN"){
			// Message with fields
			var fields = [];
			entry.message.split(",").forEach(kv=>{
				var prop = kv.split("=");
				if(prop.length==2)
					fields[prop[0]] = prop[1];
			});
			entry.fields = fields;
		}

		// header
		entry.header = entry.header || line.substring(0,line.length-entry.message.length);
		entry.message = entry.message.trim();

		// PID
		if(opts.pid && entry.appName && entry.appName.endsWith("]")) {
			let idx = entry.appName.indexOf("[");
			if(idx>=0) {
				entry.pid = entry.appName.substring(idx+1,entry.appName.length-1);
				entry.appName = entry.appName.substring(0,idx);
			}
		}
	} else {
		entry.type = "UNKNOWN"
	}

	return entry;
}

module.exports = function(line,opts) {try {return parse(line,opts)}catch(err){ console.log(err); return {err:err}}};
