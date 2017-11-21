"use strict";

const reflex = free => {
	const off = () => !children.size && !listeners.size && free && free();
	const children = new Map;
	const listeners = new Set;
	const f = path => ({
		emit: (...list) => {
			list = path.concat(list);
			if(list.length) (children.get(list[0]) || {emit(){}}).emit(...list.slice(1));
			listeners.forEach(f => f(...list));
		},
		on: (...rest) => {
			let first = (rest = path.concat(rest)).shift();
			if(!rest.length){
				first = first.bind();
				listeners.add(first);
				return () => {
					listeners.delete(first);
					off();
				};
			}
			if(!children.has(first)) children.set(first, reflex(() => {
				children.delete(first);
				off();
			}));
			return children.get(first).on(...rest);
		},
		path: (...list) => f(path.concat(list)),
	});
	return f([]);
};

const flatten = (...list) => {
	const begin = Symbol();
	const end = Symbol();
	const f = list => [].concat(...list.map(a => Array.isArray(a) ? [begin, ...f(a), end] : a));
	return [begin, end, ...f(list)];
};

const unflatten = (begin, end, ...list) => {
	const pos = list.lastIndexOf(begin);
	if(pos < 0) return list;
	list.splice(pos, 0, list.splice(pos, list.indexOf(end, pos) - pos + 1).slice(1, -1));
	return unflatten(begin, end, ...list);
};

const multi_key_map = () => {
	const dot = new Map;
	const f = (node, keys) => node && keys.length ? f(node.get(keys.shift()), keys) : node;
	return {
		set: (...keys) => {
			const [value] = keys.splice(-1, 1, dot);
			const f = parent => {
				const key = keys.shift();
				if(value === undefined){
					if(key !== dot){
						const child = parent.get(key);
						if(!child || !f(child)) return;
					}
					parent.delete(key);
					return !parent.size;
				}
				if(key !== dot) return f(parent.get(key) || (() => {
					const child = new Map;
					parent.set(key, child);
					return child;
				})());
				parent.set(key, value);
			};
			f(dot);
		},
		get: (...keys) => f(dot, keys.concat(dot)),
	};
};

const vm = () => {
	const flatten1 = (...list) => {
		const [begin1, end1] = [, , ...list] = flatten(...list);
		return list.map(a => a === begin1 ? begin : a === end1 ? end : a);
	};
	const unflatten1 = (...list) => unflatten(begin, end, ...list);
	const emit = (...signals) => signals.forEach(signal => reflex0.emit(...flatten1(signal)));
	const begin = Symbol();
	const end = Symbol();
	const reflex0 = reflex();
	const reflex1 = reflex();
	const handles = multi_key_map();
	reflex0.on(begin, "on", (...list) => {
		const is_token = a => typeof a === "string" && /^\$*$/u.test(a);
		const escape = a => is_token(a) ? a.slice(1) : a;
		const match = list => {
			const f = (pattern, ...list) => {
				if(pattern === "") return args.push(list);
				if(list.length > 1) return;
				if(!Array.isArray(pattern) || !Array.isArray(list[0])) return list.includes(escape(pattern));
				return pattern.length <= list[0].length && (!list[0].length || list[0].splice(0, pattern.length - 1).map(a => [a]).concat(list).every((a, i) => f(pattern[i], ...a)));
			};
			const args = [[pattern, ...effects]];
			return f(pattern, ...unflatten1(...path, ...list)) && args;
		};
		if(handles.get(...list)) return;
		const [pattern, ...effects] = unflatten1(...list.slice(0, -1));
		const list1 = flatten1(pattern);
		const path = list1.slice(0, list1.concat("").indexOf("")).map(escape);
		handles.set(...list, [
			reflex0.on(...path, (...list) => {
				const args = match(list);
				if(args) emit(...unflatten1(...[].concat(...flatten1(...effects).map(a => is_token(a) ? a.length < args.length ? args[a.length] : a.slice(args.length) : a))));
			}),
			reflex1.on(...path, (...list1) => match(list1) && reflex0.emit(begin, "on", ...list)),
		]);
	});
	reflex0.on(begin, "off", (...list) => {
		const handle = handles.get(...list);
		if(!handle) return;
		handle.forEach(f => f());
		handles.set(...list, undefined);
	});
	reflex0.on(begin, "match", (...list) => unflatten1(...list.slice(0, -1)).forEach(signal => reflex1.emit(...flatten1(signal))));
	return {
		emit,
		on: (path, listener) => {
			if(!listener) reflex0.on((...list) => path(...unflatten1(...list)));
			reflex0.on(...flatten1(path).slice(0, ...Array.isArray(path) ? [-1] : []), (...list) => listener(...unflatten1(...list.slice(0, -1))));
		},
		exec: code => emit(...code2signals(code)),
	};
};

const code2ast = source => {
	source = source.replace(/\r\n?/gu, "\n");
	const words = source.match(/`(?:\\`|[^`])*`|[[\]]|(?:(?!\]|;)\S)+|;.*/gu);
	return unflatten("[", "]", ...words.filter(a => !a.startsWith(";")).map(a => {
		if(/^[[\]]$/u.test(a)) return a;
		if(/^`.*`$/u.test(a)) return {flag: "`", content:
			a.slice(1, -1)
			.replace(/\\(\\*`)/gu, "$1")
			.replace(/(^|[^\\])\\[nrt]/gu, ($, $1) => $1 + {n: "\n", r: "\r", t: "\t"}[$1])
			.replace(/(^|[^\\])\\([0-9a-f]+);/giu, ($, $1, $2) => $1 + String.fromCodePoint(Number.parseInt($2, 16)))
			.replace(/\\(\\+(?:[0-9A-Fa-f]+;|[nrt]))/gu, "$1")};
		return {flag: "", content: a};
	}));
};

const ast2signals = source => {
};

const code2signals = source => ast2signals(code2ast(source));

/*test*
var vm0 = vm();
vm0.on(["+"], (a, b, ...rest) => rest.length || vm0.emit(["+", a, b, (+a + +b).toString()]));
vm0.on(["log"], console.log);
vm0.emit(["on", ["+", "", "", ""], ["log", "$", "+", "$$", "=", "$$$"]]);
vm0.emit(["+", "1", "1"]);
//*/
