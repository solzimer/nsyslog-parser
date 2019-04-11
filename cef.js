const FRX = /[a-zA-Z][a-zA-Z0-9]+=/;
const CEP_FIELDS = [
	"version",
	"deviceVendor",
	"deviceProduct",
	"deviceVersion",
	"deviceEventClassID",
	"name",
	"severity",
	"extension"
]

function splitHeaders(text) {
	var arr = [], map = {};
	var scape = false;
	var fields = 7;
	var curr = "";

	text.split("").forEach(ch=>{
		if(!fields) {
			curr += ch;
		}
		else {
			if(ch=="|") {
				if(scape) {
					scape = false;
					curr += ch;
				}
				else {
					arr.push(curr);
					curr = "";
					fields--;
				}
			}
			else if(ch=="\\") {
				curr += ch;
				scape = !scape;
			}
			else {
				scape = false;
				curr += ch;
			}
		}
	});

	if(curr.length)
		arr.push(curr);

	CEP_FIELDS.forEach((f,i)=>map[f]=arr[i]);
	return map;
}

function splitFields(msg) {
	let tokens = msg.split(" ");
	let map = {};

	let token = null;
	while(tokens.length) {
		if(!token) {
			token = tokens.shift();
			if(token.indexOf('=')>=0) {
				let kv = token.split("=");
				token = kv[0];
				map[token] = kv[1];
			}
			else {
				map[token] = "";
			}
		}
		else {
			let val = tokens.shift();
			if(val.indexOf('=')<0) {
				map[token] += ` ${val}`;
			}
			else {
				token = null;
				tokens.unshift(val);
			}
		}
	}

	return map;
}

module.exports = {
	parse(text) {
		var headers = splitHeaders(text);
		var fields = splitFields(headers.extension || "");
		return {
			headers : headers,
			fields : fields
		}
	}
}
