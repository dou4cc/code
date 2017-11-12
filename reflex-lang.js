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
		on: (...list) => {
			const [first, ...rest] = path.concat(list);
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
		path: (...list) => f(path.concat(...list)),
	});
	return f([]);
};

const flatten = list => {
	const start = Symbol();
	const end = Symbol();
	const f = list => [].concat(...list.map(a => a instanceof Array ? f([start, ...a, end]) : [a]));
	return [start, end, f(list)];
};

const unflatten = (start, end, [...list]) => {
	const pos = list.indexOf(start);
	if(pos < 0) return list;
	const list1 = [];
	list1.push(...unflatten(start, end, list.splice(pos, list.lastIndexOf(end) - pos + 1, list1).slice(1, -1)));
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
		const [start, end] = [, , list] = flatten(list);
		return list.map(a => a === start ? start0 : a === end ? end0 : a);
	};
	const unflatten1 = list => unflatten(start0, end0, list);
	const start0 = Symbol();
	const end0 = Symbol();
	const reflex0 = reflex();
	const handles = multi_key_map();
	reflex0.on("on", (...list) => {
		const pattern = unflatten1(list)[0];
		const flattened_pattern = flatten1(pattern);
		const path = flattened_pattern.slice(0, flattened_pattern.indexOf(0));
		handles.set("on", ...list, reflex0.on(...path, (...list) => {
			const match_args = (pattern, list) => pattern.every((a, i) => a
			list = path.concat(list);
			const args = [, ];
			if(!pattern1.every((a, i) => a === 0 ? args.push(flatten1(list[i])) : a === list[i])) return;
		}));
	});
};
