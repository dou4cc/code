//min
javascript:((d,s,c,p,h,i,l=d.URL,w=l=="about:blank",b=/^https?:/.test(l),f=(r,t,u)=>t!=u?(u=d[c]("a"),u.href=t,d.head.appendChild(t=d[c]("base")).href=h,u=u.href,t.remove(),t=h+"archive.is/",u=u[p](/^https?:\/\/archive\.(is|today)\//,t),u==(u=u[p](r("^"+t+"o/(((?!_)\\w){4,}/)?"),""))?(r=r("^"+t),u=r.test(u)?u:t+"?run=1&url="+encodeURIComponent(h+"4r.gitlab.io/#"+u),!r.test(l)&b?open(u):location=u):f(r,u)):w&d.readyState[0]=="u"?location=l:0,g=_=>f(RegExp,prompt("URL:"+"\40".repeat(96),b?l:"")))=>{w&!d[i]?s(_=>s(g,d[i]=""),d[i]=0):g()})(document,setTimeout,"createElement","replace","https://","title")

//source
javascript:{
	const parse = url => {
		if(url === null) return document.location.href === "about:blank" && document.readyState === "uninitialized" && (document.location = "about:blank");
		document.head.appendChild(base);
		iframe.src = url;
		url = iframe.src;
		url = url.replace(archiveis_reg, archiveis_base);
		if(url !== (url = url.replace(/^https:\/\/archive\.is\/o\/(?:[A-Za-z0-9]{4,}\/)?/u, ""))) return parse(url);
		url =
			archiveis_reg.test(url)
			? url
			: archiveis_base + "?run=1&url=" + encodeURIComponent(redirector(url));
		if(!archiveis_reg.test(document.location) && web_reg.test(document.location)){
			open(url);
		}else{
			document.location = url;
		}
	};
	const start = () => parse(prompt("URL:" + " ".repeat(96), web_reg.test(document.location) ? document.location : ""));
	const web_reg = /^https?:/u;
	const base = document.createElement("base");
	base.href = "https://";
	const iframe = document.createElement("iframe");
	const archiveis_reg = /^https?:\/\/archive\.(?:is|today)\//u;
	const archiveis_base = "https://archive.is/";
	const redirector = target => "https://4r.gitlab.io/#" + target;
	if(document.location.href === "about:blank" && document.title === ""){
		document.title = "title";
		setTimeout(() => {
			document.title = "";
			setTimeout(start);
		});
	}else{
		start();
	}
	base.remove();
}
