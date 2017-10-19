'use strict'; //ES.next

const $ = do{
	let top=this;
	const init = (target, ...keys) => do{
		try{
			typeof target === 'function'
			? target(...keys)
			: target[keys[0]];
		}catch(error){
			console.error(error);
		}
	};
	const isScope = target => typeof target === 'object' && target !== null || typeof target === 'function';
	const new_scope = (old, new_match, value) => (...matches) =>
		matches.length === 1 && matches[0] === new_match
		? value
		: init(old, ...matches);
	const def = (...matches) => value => {
		const def = (scope, value, ...matches) =>
			new_scope(scope, matches[0],
				matches.length > 1
				? def(init(scope, matches[0]), value, ...matches.slice(1))
				: value
			);
		top = def(top, value, ...matches);
	};
	def('def')(def);
	match => do{
		const $ = scope => (...matches) => do{
			const value = init(scope, ...matches);
			isScope(value)
			? $(value)
			: value;
		};
		match === undefined
		? undefined
		: $(top)(match);
	};
};



$('Math')('sqrt')(16);
//4

$('def')('Math', 233)(1);
//undefined

$('Math')(233);
//1

$('Math')('233');
//undefined

$('Math')('sqrt')(16);
//4

$('def')('Math', 233, 'test')(2);
//undefined

$('Math')(233);
//[Function]

$('Math')(233)('test');
//2

$('Math')(233)(233);
//undefined

$('def')('Math', 'sqrt', 16)('^_^');
//undefined

$('Math')('sqrt')(16);
//^_^

$('Math')('sqrt')(54397632289);
//233233

$('def')(undefined)('T_T');
//undefined

$(undefined);
//undefined

$('def')('a')(x => x + 6);
//undefined

$('a')(660);
//666

$('def')('b')($('a'));
//undefined

$('def')('b', 660)('^_^');
//undefined

$('b')(660);
//^_^

$('a')(660);
//666

$('b')('FP is cool. +1008');
//FP is cool. +10086
