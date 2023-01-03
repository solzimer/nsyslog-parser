const FRX = /[a-zA-Z][a-zA-Z0-9]+=/;
const LEEF_FIELDS = [
	{k:"leefVersion",v1:true,v2:true}, 
	{k:"vendor",v1:true,v2:true}, 
	{k:"product",v1:true,v2:true}, 
	{k:"version",v1:true,v2:true}, 
	{k:"eventID",v1:true,v2:true}, 
	{k:"delimiter",v1:false,v2:true}, 
	{k:"extension",v1:true,v2:true}, 
];
const LLEN = LEEF_FIELDS.length;

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

	const ver = arr[0]=='LEEF:1.0'? 'v1' : 'v2';
	for(let i=0;i<LLEN;i++) {
		let f = LEEF_FIELDS[i];
		if(f[ver]) map[f.k] = arr.shift();
	}

	return map;
}

function splitFields(msg, delimiter) {
	delimiter = delimiter || '\t';
	let tokens = msg.split(delimiter);

	let map = tokens.reduce((map,token)=>{
		let keyval = token.split('=');
		map[keyval[0]] = keyval[1];
		return map;
	},{});

	return map;
}

module.exports = {
	parse(text) {
		var headers = splitHeaders(text);
		var fields = splitFields(headers.extension || "", headers.delimiter);
		return {
			headers : headers,
			fields : fields
		}
	}
}
