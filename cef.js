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
			else if(ch=="\\" && !scape) {
				scape = true;
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
	var map = {};
	var scape = false;
	var key = "";
	var nextKey = "";
	var curr = "";

	msg.split("").forEach(ch=>{
		if(ch=="=") {
			if(scape) {
				// Escape this = and treat it like any other character
				scape = false;
				curr += ch;
				nextKey += ch;
			}
			else {
				// The equals isn't escaped, so add the previous key value to the map
				if (key) {
					map[key] = curr.slice(0, curr.length - nextKey.length - 1);
				}
				// Now prepare for the next key value
				key = nextKey;
				curr = "";
				nextKey = "";
			}
		}
		else if(ch=="\\" && !scape) {
			// This is the escape character, so flag the next character to be escaped
			scape = true;
		}
		else if(ch==" ") {
			scape = false;
			curr += ch;
			// reset the next possible key as we've seen a space
			nextKey = "";
		}
		else {
			scape = false;
			// add the character to the possible key and current value
			curr += ch;
			nextKey += ch;
		}
	});

	if(key && curr) {
		map[key] = curr;
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
