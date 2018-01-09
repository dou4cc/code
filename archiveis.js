//min
javascript:((d,c,p,h,l=d.URL,b=/^https?:/.test(l),f=(r,t,u)=>{t!=u&&(u=d[c]('a'),u.href=t,d.head.appendChild(t=d[c]('base')).href=h,u=u.href,t.remove(),t=h+'archive.is/',u=u[p](/^https?:\/\/archive\.(is|today)\//,t),u==(u=u[p](r('^'+t+'o/(((?!_)\\w){4,}/)?'),''))?(r=r('^'+t),u=r.test(u)?u:t+'?run=1&url='+encodeURIComponent(h+'4r.gitlab.io/#'+u),!r.test(l)&b?open(u):location=u):f(r,u))})=>f(RegExp,prompt('URL:',b?l:'')))(document,'createElement','replace','https://')

//source
javascript:{
	const f = url => {
		if(url === null) return;
		document.head.appendChild(base);
		iframe.src = url;
		url = iframe.src;
		url = url.replace(archiveis_reg, "https://archive.is/");
		if(url !== (url = url.replace(/^https:\/\/archive\.is\/o\/(?:[A-Za-z0-9]{4,}\/)?/u, ""))) return f(url);
		url =
			archiveis_reg.test(url)
			? url
			: "https://archive.is/?run=1&url=" + encodeURIComponent("https://4r.gitlab.io/#" + url);
		if(!archiveis_reg.test(document.location) && web_reg.test(document.location)){
			open(url);
		}else{
			document.location = url;
		}
	};
	const web_reg = /^https?:/u;
	const base = document.createElement("base");
	base.href = "https://"
	const iframe = document.createElement("iframe");
	const archiveis_reg = /^https?:\/\/archive\.(?:is|today)\//u;
	f(prompt("URL:", web_reg.test(document.location) ? document.location : ""));
	base.remove();
}
