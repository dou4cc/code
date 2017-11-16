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

const flatten = (listify, ...list) => {
	listify = listify || (a => a instanceof Array ? a : null);
	const begin = Symbol();
	const end = Symbol();
	const used = new Set;
	const holes = new Set;
	const f = list => [].concat(...list.map(a => {
		if(used.has(a) && holes.add(a) || !listify(a)) return [a];
		used.add(a);
		return [begin, ...f(listify(a)), end];
	}));
	return [holes, begin, end, ...f(list)];
};

const unflatten = (unlistify, begin, end, ...list) => {
	let pos;
	while((pos = list.lastIndexOf(begin)) >= 0) list.splice(pos, 0, (unlistify || (a => a))(list.splice(pos, list.indexOf(end, pos) - pos + 1).slice(1, -1)));
	return list;
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

const same_list = (a, b) => a && a.length === b.length && a.every((a, i) => a === b[i] || Object.is(a, b[i]));

const cache = f => {
	let args;
	let result;
	const results = new WeakMap;
	return (...args1) => {
		if(same_list(args, args1)) return result;
		if(args1.length === 1){
			let result1 = results.get(args1[0]);
			if(result1) return result1[0];
			result1 = f(args1[0]);
			try{
				results.set(args1[0], [result1]);
				return result1;
			}catch(error){}
			result = result1;
		}else{
			result = f(...args1);
		}
		args = args1;
		return result;
	};
};

const is_char = a => typeof a === "string" && a.length === 1;

const vm = () => {
	const listify = cache(a => a instanceof Array ? a : typeof a === "string" ? Array.from(a) : null);
	const flatten1 = (...list) => {
		const [, begin1, end1] = [, , , ...list] = flatten(listify, ...list);
		return list.map(a => a === begin1 ? begin : a === end1 ? end : a);
	};
	const unflatten1 = (...list) => unflatten(list => list.every(is_char) ? list.join("") : list, begin, end, ...list);
	const on = (path, listener) => reflex0.on(...flatten1(path).slice(0, ...listify(path) ? [-1] : []), (...list) => listener(...unflatten1(...list.slice(0, -1))));
	const emit = (...signals) => signals.forEach(signal => reflex0.emit(...flatten1(signal)));
	const begin = Symbol();
	const end = Symbol();
	const reflex0 = reflex();
	const handles = multi_key_map();
	reflex0.on(begin, ...flatten1("on"), (...list) => {
		if(handles.get(begin, ...flatten1("on"), ...list)) return;
		const [pattern, ...signals] = unflatten1(...list.slice(0, -1));
		const list1 = flatten1(...pattern);
		const path = list1.slice(0, list1.concat(0).indexOf(0));
		handles.set(begin, ...flatten1("on"), ...list, reflex0.on(...path.map(a => typeof a === "number" ? a - 1 : a), (...list) => {
			const match = (pattern, ...signals) => {
				if(pattern === 0) return args.push(signals);
				if(signals.length > 1) return;
				if(!listify(pattern) || !listify(signals[0])) return same_list([typeof pattern === "number" ? pattern - 1 : pattern], signals);
				[pattern, signals] = [pattern, signals].map(listify);
				return pattern.length <= signals[0].length && signals[0].splice(0, pattern.length - 1).map(a => [a]).concat(signals).every((a, i) => match(pattern[i], ...a));
			};
			const args = [[pattern, ...signals]];
			if(match(pattern, unflatten1(...path.concat(list)))) emit(...unflatten1([].concat(...flatten1(...signals).map(a => {
				if(typeof a !== "number") return [a];
				return a < args.length ? args[a] : [a - args.length];
			}))));
		}));
	});
	reflex0.on(begin, ...flatten1("off"), (...list) => (handles.get(begin, ...flatten1("on"), ...list) || (() => {}))());
	return {
		on,
		emit,
		exec: code => emit(...code2signals(code)),
	};
};

const code2ast = source => {
	source = source.replace(/\r\n?/gu, "\n");
	const words = source.match(/`(?:\\`|[^`])*`|[[\]]|(?:(?!\]|;)\S)+|;.*/gu);
	return unflatten(null, "[", "]", ...words.filter(a => !a.startsWith(";")).map(a => {
		if(/^[[\]]$/u.test(a)) return a;
		if(/^`.*`$/u.test(a)) return {flag: "`", content: a.slice(1, -1).replace(/\\(\\*`)/gu, "$1")};
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
vm0.emit(["on", ["+", 0, 0, 0], ["log", 1, "+", 2, "=", 3]]);
vm0.emit(["+", "1", "1"]);

//*/
