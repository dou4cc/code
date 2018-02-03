//Invalid implement

"use strict";

const guid = () => {
	let d = Date.now();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/x|y/gu, c => {
		const r = Math.floor(d + Math.random() * 16) % 16;
		d /= 16;
		return (c === "x" ? r : r & 0x3 | 0x8).toString(16);
	});
};

const db_name = () => "ondestruct/" + guid();

indexedDB.open;
document.cookie;

const ref = new WeakMap;

const ondestruct = (target, listener) => new Promise((resolve, reject) => {
	const onfail = () => resolve(ondestruct(target, listener));
	try{
		const onopen = () => {
			cn.result.close();
			onfail();
		};
		new WeakSet([target]);
		const cn = indexedDB.open(db_name());
		cn.addEventListener("error", onfail);
		cn.addEventListener("blocked", onfail);
		cn.addEventListener("success", onopen);
		cn.addEventListener("upgradeneeded", () => {
			const ondelete = () => listener();
			cn.removeEventListener("error", onfail);
			cn.addEventListener("error", () => reject(cn.error));
			cn.removeEventListener("success", onopen);
			const promise = new Promise(resolve => cn.addEventListener("success", resolve));
			ref.set(target, cn.result);
			const del = indexedDB.deleteDatabase(cn.result.name);
			del.addEventListener("success", ondelete);
			resolve(() => {
				del.removeEventListener("success", ondelete);
				promise.then(() => cn.result.close());
			});
		});
	}catch(error){
		if(!(error instanceof DOMError)) return reject(error);
		onfail();
	}
});

ondestruct;
