/*
	all the proprieties
*/
let { extend, extendOwn, map } = require('underscore');

// defaults for marks
let marks = {};

marks.dot = marks.Dot = () => {
	return {
		draw: false,
		ds: {
			x: {},
			y:{}
		},
		position: {
			x: 0,
			y: 0
		},
		radius: 3,
		color: 'black',
		width: 0,
		fill: null,
		size: null,
		shade: 1
	};
};

marks.square = marks.Square = () => {
	return {
		draw: false,
		ds: {
			x: {},
			y: {}
		},
		position:{
			x: 0,
			y: 0
		},
		color: 'black',
		width: 0,
		fill: null,
		size: 0,
		shade: 1
	};
};

marks.bar = marks.Bar = () => {
	return {
		draw: false,
		ds: {
			x: {}, // see space-mgr for details
			y: {}
		}, // see space-mgr for details
		position:{
			x:0,
			y:0
		},
		drop:{
			x:null,
			y:0
		},
		width: 0,
		span:0.5,
		offset: {
			x: 0,
			y: 0
		},
		shade: 1
	};
};

// defaults for graphs
let graph = {};
graph.common = () => {
	return {
		color: 'black',
		width: 1,
		fill: 'none',
		shade: 1,
		// mark props, explicit at heigh level
		// overwritten if present in markProps
		mark: true,
		markColor: null,
		baseLine: {x:null, y:0},
		dropLine: {x: false, y:false},
		markSize: 3,
		markType: 'dot',
		onlyMarks: false,
		// contains low-level description,
		// i.e. specific things like radius
		// for a dot, or anything.
		markProps: {},
		shader: null, //playing with colors
		process: null, //playing with data {dir: x || y, type: 'histogram'}
		tag: {
			show: false, // show the tag
			print: (t) => t + '',
			fontSize: 10,
			pin: false, // show the pin
			pinColor: 'black', // color of the pin
			pinLength: 10, // 10 px as pin length
			pinAngle: 90, // direction of pin
			pinHook: 3, // 3px for hook
			color: 'black' // color of the tag
		}
	};
};

graph.Bars = graph.bars = () => extend(graph.common(), {
	color: 'none',
	width: 0,
	dir: {
		x: false,
		y: true
	},
	drop: {x: null, y: 0},
	markType: 'bar',
	markProps: {
		width: 0,
		draw: false
	},
	// Number or {}
	span: null, // auto compute
	offset: {x: 0, y: 0}
});

graph.yBars = graph.ybars = () => extend(graph.Bars(),{
	dir: {
		x: true,
		y: false
	},
});

graph.Pie = graph.pie = () => extend(graph.common(),{
	pie: 'disc', // tore
	pieOrigin: {x: 0, y:0}, // offset from center
	pieRadius: null, // 2/3 of world
	pieToreRadius: 0, // 0: no hole, 1 : no border!
	tag: {
		show: false, // show the tag
		print: (t) => t + '',
		pin: false, // show the pin
		pinColor: 'black', // color or the pin
		pinLength: 0.35, // 10 px as pin length
		pinRadius: 0.75, // 3/4 of pie size
		pinHook: 10, // absolute length
		color: 'black' // color of the tag
	}
});

//graph.Bars = graph.common;
graph.Plain = graph.plain = graph.common;

graph.Stairs = graph.stairs = () => extend(graph.common(), { stairs: "right" });

///////////
// major / minor props
/////////////

let m = {};

// that's a major
m.Grid = {
	show: false,
	color: 'LightGray',
	width: 0.5,
	length: 0
};

// that's a major
m.Tick = {
	show: true,
	width: 1,
	length: 15,
	out: 0.25, // proportion that is outside
	step: null,
	color: 'black',
	labelOffset: {x:0, y:0, along: null, perp: null},
	labelize: () => {return false;}, //utils.isNil(val) ? '' : val instanceof Date ? moment(val).format('YYYY') : val.toFixed(1);},
	label: '',
	rotate: 0,
	labelFSize: 10,
	labelColor: 'black'
};


//
let axe = {
	ticks: {
		major: m.Tick,
		minor: extendOwn(extend({},m.Tick),{
			show: false,
			length: 7,
			out: 0,
			color: 'gray',
			labelize: () => ''
		})
	},
	grid: {
		major: m.Grid,
		minor: extendOwn(extend({},m.Grid),{
			width: 0.3
		})
	},
	show: true,
	// to force locally definition
	min: null,
	max: null,
	tickLabels: [], //{coord: where, label: ''}, coord in ds
	color:     'black',
	width:      1,
	label:      '',
	labelOffset: {x: 0, y: 0},
	labelAnchor: 'middle',
	labelFSize: 20,
	labelColor: 'black',
	empty:      false,
	CS:         'cart',
	partner: 0,
	// for ticklabel formatting
	factor: 1,
	factorColor: 'black',
	factorOffset: {x: 0, y: 0},
	factorAnchor: 'middle',
	factorFSize: 10
};

m.Axes = (axis) => {
	return {
		abs: map(axis.abs, (p) => extend({placement: p}, axe)),
		ord: map(axis.ord, (p) => extend({placement: p}, axe))
	};
};


///
m.Graph = (axis) => {
	return {
		// general
		css: false,
		name: 'G',
		height: 400,	// defines the universe's height
		width:	600,	// defines the universe's width
    cadre: null,
		legend: {
			iconWidth: 30,
			iconHeight: 20,
			iconHMargin: 0, // offset from center
			iconVMargin: 0, // offset from center
			iconUnit: 'px'
		},
		foreground: null,
		background: null,
		title: '',
		titleFSize: 30,
		axisOnTop: false,
		// margins
		innerMargin: {left: null, bottom: null, right: null, top: null}, // left, bottom, right, top
		// defMargins.axis.ticks
		// if defined, overwrite
		factorMargin: {left: null, bottom: null, right: null, top: null}, // left, bottom, right, top
		// factorMargin + defMargins.axis.label + defMargins.axis.ticks
		// if defined, overwrite
		outerMargin: {left: null, bottom: null, right: null, top: null}, // left, bottom, right, top
		// data
		data: [],
		graphProps: [],
		// axis
		axisProps: m.Axes(axis),
		// data process
		discard: true
	};
};

let type = (arr,dir) => {
	let v = arr.length === 0 ? 0 : arr[0][dir];
	let lab = arr.length !== 0 && arr[0].label && arr[0].label[dir];
	return lab ? 'label' : v instanceof Date ? 'date' : 'number';
};

let data = 	(serie) => {
	return {
		type: 'Plain', // Plain, Bars, yBars
		series: [], // x, y
		phantomSeries:[], // added points to play on the world's limit
		stacked: null, // x || y || null
		coordSys: 'cart', // cart || polar
		ord: {
			axis: 'left', // 'left' || 'right'
			type: type(serie,'y') // 'number' || 'date' || 'label'
		},
		abs: {
			axis: 'bottom', // 'bottom' || 'top'
			type: type(serie,'x') // 'number' || 'date' || 'label'
		}
	};
};

m.defaults     = (key) => key === 'data' ? data : graph[key]();

m.marksDefault = (key) => marks[key]();

/* If no marginsO are defined, here are the rules:
 *  - ticks and ticks labels are 20 px in the y dir (height of text),
 *			40 px in the x dir (length of text).
 *  - we take a 10px margin on title and labels
 *  - bottom and right margin:
 *			- 20px + ({x,y}LabelFSize + 10 px) if a {x,y}Label is defined,
 *  - top and left margin:
 *			- 20px + ({x,y}LabelFSize	+ 10 px) if a {x,y}Label is defined,
 *  - top margin takes a titleFSize + 10px more if a title is defined
 */
m.defMargins = {
	outer: {
		label: {
			bottom: 20,
			top: 20,
			left: 20,
			right: 20,
			mar: 10
		},
		ticks: {
			left: 20,
			right: 20,
			bottom: 15,
			top: 15
		},
		factor: {
			right: 30,
			top: 25
		},
		min: 3
	},
	inner: {
		left: 10, 
		bottom: 10, 
		right: 10, 
		top: 10
	},
	title: 10,
	min: 0,
	max: 4
};

module.exports = m;
