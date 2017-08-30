function splitHeaders(text) {
	var arr = [];
	var scape = false;
	var fields = 7;
	var curr = "";

	text.split("").forEach(ch=>{
		if(!fields) {
			curr += ch;
		}
		else {
			if(ch=="\\") {
				if(scape) {
					curr += ('\\'+ch);
					scape = false;
				}
				else {
					scape = true;
				}
			}
			else if(ch=="|") {
				if(scape) {
					curr += ('\\'+ch);
					scape = false;
				}
				else {
					console.log(curr);
					arr.push(curr);
					curr = "";
					fields--;
				}
			}
			else {
				curr += ch;
			}
		}
	});

	if(curr.length)
		arr.push(curr);

	return arr;
}


module.exports = {
	parse(text) {
		return splitHeaders(text);
	}
}
