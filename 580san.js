"use strict";

const force_fetch = async url => {
	try{
		const response = await fetch(url);
		if(!response.ok) throw null;
		const text = await response.text();
		if(text.trim()) return text;
	}catch(error){}
	return force_fetch(url);
};
const ip2num = ip => ip.match(/\d+/ug).reduce((s, a) => s * 256 + +a);
const format_ips = ips => Array.from(ips).sort((a, b) => ip2num(a) - ip2num(b)).join("|");
const scan_ips = async (q, i) => {
	if(i < 0) return;
	scan_ips(q, i - 1);
	view_ips(await force_fetch("/ip.php?" + q + "&" + i));
};
const view_ips = code => {
	(code.match(/href=('|").+?(?=\1>更多<\/a>)/ug) || []).forEach(async code => collect_ips(await force_fetch(code.slice(6))));
	collect_ips(code);
};
const collect_ips = code => (code.match(/<p>.+?<\/p>/ug) || []).forEach(code => (code.match(/\d+\.\d+\.\d+\.\d+/ug) || []).forEach(ip => ips.add(ip)));
const ips = new Set;
