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

function splitFields(txt) {
	var tokens = [], map = {};
	var res = null;

	do {
		res = FRX.exec(txt);
		if(res) {
			var tok = res[0];
			var idx = res.index;
			if(tokens.length) {
				tokens[tokens.length-1] += txt.substring(0,idx);
			}
			tokens.push(tok);
			txt = txt.substring(idx+tok.length);
		}
		else if(txt.length && tokens.length) {
			tokens[tokens.length-1] += txt;
			txt = "";
		}
	}while(res && txt.length);

	tokens.map(t=>t.trim()).map(t=>{
		t = t.split("=");
		return {k:t.shift(), v:t.join("=")}
	}).forEach(t=>{
		map[t.k] = t.v;
	});

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
