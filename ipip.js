"use strict";

const search_ip = (ip, again) => new Promise(async (resolve, reject) => {
	const get_verify = () => new Promise((resolve, reject) => {
		const onreadystatechange = () => {
			if(done || xhr.readyState < 2) return;
			if(xhr.status !== 200){
				abort();
				return xhr.status === 303 ? reject(EvalError("spam")) : resolve(get_verify());
			}
			const match = xhr.responseText.match(/_auth = '(.*?)'/u);
			if(!match) return xhr.readyState === 4 && reject(EvalError("unknown"));
			abort();
			resolve(match[1]);
		};
		const abort = () => {
			done = true;
			xhr.abort();
		};
		const xhr = new XMLHttpRequest;
		let done = false;
		xhr.open("GET", url);
		xhr.addEventListener("readystatechange", onreadystatechange);
		xhr.send();
	});
	const post = () => {
		const abort = () => {
			clearInterval(timer);
			iframe.remove();
			form.remove();
		};
		const check = loaded => {
			if(!iframe.contentWindow) return;
			if(!iframe.contentWindow.document){
				iframe.src = "about:blank";
				abort();
				return post();
			}
			const [last] = Array.from(iframe.contentDocument.querySelectorAll("*")).slice(-1);
			const span = iframe.contentDocument.querySelector(".table-striped.table-bordered span");
			const span_loaded = span && last !== span;
			if(!span_loaded || span.textContent.trim() !== ip){
				if(!span_loaded && !loaded) return;
				iframe.contentWindow.stop();
				abort();
				return again ? reject(EvalError("unknown")) : resolve(search_ip(ip, true));
			}
			const myself = iframe.contentDocument.querySelector("#myself");
			const result = myself && myself.textContent.trim();
			if(!result || last === myself){
				if(!loaded) return;
				abort();
				return reject(EvalError("unknown"));
			}
			iframe.contentWindow.stop();
			abort();
			resolve(result);
		};
		const iframe = document.createElement("iframe");
		const form = document.createElement("form");
		const verify1 = document.createElement("input");
		const ip1 = document.createElement("input");
		form.action = url;
		verify1.value = verify;
		iframe.style.border = "none";
		iframe.style.margin = iframe.style.width = iframe.style.height = "0";
		iframe.tabIndex = -1;
		iframe.sandbox.add("allow-same-origin");
		form.method = "POST";
		form.style.display = "none";
		verify1.name = "_verify";
		ip1.name = "ip";
		ip1.value = ip;
		form.append(verify1, ip1);
		while(iframe.name = form.target = Math.random(), document.getElementsByName(iframe.name).length);
		document.body.append(iframe, form);
		iframe.addEventListener("load", check);
		form.submit();
		const timer = setInterval(check);
	};
	const url = "/ip.html";
	const verify = await get_verify();
	post();
});
