"use strict";

const fs = require("fs");
const [$ = process.exit()] = [process.argv[2]];
const reg =
	$.startsWith("I")
	? RegExp($.slice(1), "u")
	: RegExp($, "iu");

const visit = path => {
	const list = [];
	for(let name of fs.readdirSync(path)){
		try{
			const pathname = path + name;
			if(fs.lstatSync(pathname).isDirectory()){
				if(reg.test(name)){
					log(pathname + "/");
					list.push(...visit(pathname + "/"));
				}else{
					list.push(pathname + "/");
				}
			}else if(reg.test(name)) log(pathname);
		}catch(error){}
	}
	return list.length === 1 ? visit(list[0]) : list;
};

const search = function*(path){
	try{
		const head = {};
		let p = head;
		for(let i of visit(path)){
			p = p.next = {value: search(i)};
		};
		while(head.next){
			p = head;
			while(p.next){
				yield;
				if(p.next.value.next().done){
					p.next = p.next.next;
				}else{
					p = p.next;
				}
			}
		}
		yield;
	}catch(error){}
};

let t2;
const log = msg => {
	if(t2){
		t2 = Date.now();
	}else{
		t2 = Date.now();
		console.log("找出第一条结果的用时：" + (t2 - t1) + "ms");
	}
	console.log(msg);
};

const t1 = Date.now();
for(let i of search("./"));

if(t2) console.log("从开始搜索到找出最后一条结果的用时：" + (t2 - t1) + "ms");
