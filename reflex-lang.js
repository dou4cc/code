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

const flatten = list => {
	const begin = Symbol();
	const end = Symbol();
	const f = list => [].concat(...list.map(a => a instanceof Array ? f([begin, ...a, end]) : [a]));
	return [begin, end, f(list)];
};

const unflatten = (begin, end, [...list]) => {
	let pos;
	while((pos = list.indexOf(end)) >= 0){
		const list1 = [];
		list1.push(...list.splice(pos - (pos -= list.lastIndexOf(begin, pos)), pos + 1, list1).slice(1, -1));
	}
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

const vm = () => {
	const flatten1 = list => {
		const [begin, end] = [, , list] = flatten(list);
		return list.map(a => a === begin ? begin0 : a === end ? end0 : a);
	};
	const unflatten1 = list => unflatten(begin0, end0, list);
	const begin0 = Symbol();
	const end0 = Symbol();
	const reflex0 = reflex();
	const handles = multi_key_map();
	reflex0.on("on", (...list) => {
		if(handles.get("on", ...list)) return;
		const trigger = unflatten1(list);
		const pattern = trigger[0];
		const list1 = flatten1(pattern);
		const path = list1.slice(0, list1.concat(0).indexOf(0));
		handles.set("on", ...list, reflex0.on(...path.map(a => typeof a === "number" ? a - 1 : a), (...list) => {
			const match = (pattern, list) => {
				if(pattern === 0) return args.push(list);
				if(list.length > 1) return;
				if(pattern instanceof Array && list[0] instanceof Array) return pattern.length <= list[0].length && list[0].splice(0, pattern.length - 1).map(a => [a]).concat(list).every((a, i) => match(pattern[i], a));
				return (typeof pattern === "number" ? pattern - 1 : pattern) === list[0];
			};
			const args = [, ];
			if(match(pattern, [unflatten1(path.concat(list))])) unflatten1([].concat(...flatten1(trigger.slice(1)).map(a => {
				if(typeof a !== "number") return [a];
				if(a === 0) return [trigger];
				if(a < args.length) return args[a];
				return [a - args.length];
			}))).forEach(signal => reflex0.emit(...flatten1(signal)));
		}));
	});
	reflex0.on("off", (...list) => (handles.get("on", ...list) || (() => {}))());
	return {
		emit: (...signals) => signals.forEach(signal => reflex0.emit(...flatten1(signal))),
		on: (...path) => {
			const listener = path.pop();
			return reflex0.on(...path, (...list) => listener(...unflatten1(list)));
		},
	};
};

/*test*

var vm0 = vm();
vm0.on("+", (a, b, ...rest) => rest.length || vm0.emit(["+", a, b, (+a + +b).toString()]));
vm0.on("echo", console.log);
vm0.emit(["on", ["+", 0, 0, 0], ["echo", 1, "+", 2, "=", 3]]);
vm0.emit(["+", "1", "1"]);

//*/
