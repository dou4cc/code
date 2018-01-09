javascript:((d,c,p,h,l=d.URL,b=/^https?:/.test(l),f=(r,t,u)=>{t=t||prompt('URL:',b?l:'');t!=u?(u=d[c]('a'),u.href=t,d.head.appendChild(t=d[c]('base')).href=h,u=u.href,t.remove(),t=h+'archive.is/',u=u[p](/^https?:\/\/archive\.(is|today)\//,t),u==(u=u[p](r('^'+t+'o/(((?!_)\\w){4,}/)?'),''))?(r=r('^'+t),u=r.test(u)?u:t+'?run=1&url='+encodeURIComponent(h+'4r.gitlab.io/#'+u),!r.test(l)&&b?open(u):location=u):f(r,u)):0})=>f(RegExp))(document,'createElement','replace','https://')

{
	const f = url => {
		const web_reg = /^https?:/u;
		url = url || prompt("URL:", web_reg.test(document.location) ? document.location : "");
		if(url === null) return;
		const base = document.createElement("base");
		base.href = "https://"
		document.head.appendChild(base);
		const iframe = document.createElement("iframe");
		iframe.src = url;
		url = iframe.src;
		base.remove();
		const archiveis_reg = /^https?:\/\/archive\.(?:is|today)\//u;
		url = url.replace(archiveis_reg, "https://archive.is/");
		if(url !== (url = url.replace(/^https:\/\/archive\.is\/o\/(?:[A-Za-z0-9]{4,}\/)?/u, ""))) return f(url);
		url = archiveis_reg.test(url) ? url : "https://archive.is/?run=1&url=" + encodeURIComponent("https://4r.gitlab.io/#" + url);
		if(!archiveis_reg.test(document.location) && web_reg.test(document.location)){
			open(url);
		}else{
			document.location = url;
		}
	};
}
