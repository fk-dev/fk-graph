import { map, each, findWhere, reject, extend } from 'underscore';
import { isNil, mgr as typeMgr } from './utils.js';
import { shader } from './colorMgr.js';

// axis
import { vm as axisLineVM } from '../axis/axis-line-vm.js';
import { vm as ticksVM } from '../axis/tick-vm.js';

// charts
import { vm as plainVM }    from '../graphs/plain-vm.js';
import { vm as barChartVM } from '../graphs/bar-chart-vm.js';
import { vm as stairsVM }   from '../graphs/stairs-vm.js';
import { vm as pieVM }      from '../graphs/pie-vm.js';

// marks
import { vm as dotVM, 
				ovm as odotVM }    from '../marks/dot-vm.js';
import { vm as squareVM, 
				ovm as osquareVM } from '../marks/square-vm.js';
import { vm as barVM }     from '../marks/bar-vm.js';
// pin
import { vm as pinVM } from '../marks/pin.js';

// graph
let graphVM = {
	PLAIN:   plainVM,
	BARS:    barChartVM,
	YBARS:   barChartVM,
	STAIRS:  stairsVM,
	PIE:     pieVM
};

// marks
let marksVM = {
	OPENDOT:    odotVM,
	DOT:        dotVM,
	OPENSQUARE: osquareVM,
	SQUARE:     squareVM,
	BAR:        barVM
};

const curve = function(get, { spaces, serie, data, gprops, idx }){

			// 1 - find ds: {x: , y:}
			// common to everyone

			// we add the world
			// we find the proper x & y axis
			let xplace = 'bottom';
			if(!!data.abs && 
				!!data.abs.axis){
				xplace = data.abs.axis;
			}

			let yplace = 'left';
			if(!!data.ord && 
				!!data.ord.axis){
				yplace = data.ord.axis;
			}
			let ds = {
				x: spaces.x[xplace],
				y: spaces.y[yplace]
			};

			// 2 - line of graph
			let gtype = data.type || 'Plain';

			// positions are offsetted here
			let positions = map(serie, (point) => {

				let mgr = {
					x: typeMgr(point.x),
					y: typeMgr(point.y)
				};

				let offx = isNil(point.offset.x) ? 0 : point.offset.x;
				let offy = isNil(point.offset.y) ? 0 : point.offset.y;

				let out = {
					x: mgr.x.add(point.x,offx),
					y: mgr.y.add(point.y,offy),
					drop: {
						x: isNil(point.drop.x) ? null : mgr.x.add(point.drop.x,offx),
						y: isNil(point.drop.y) ? null : mgr.y.add(point.drop.y,offy),
					},
					span: point.span
				};

				for(let aa in point){
					switch(aa){
						case 'x':
						case 'y':
						case 'drop':
						case 'span':
						case 'offset':
							continue;
						default:
							out[aa] = point[aa];
					}
				}

				return out;

			});

			// 3 - points
			// we extend positions with any precisions done by the user,

			// first shader
			if(!isNil(gprops.shader)){
				shader(gprops.shader,positions);
			}

			// then explicit, takes precedence
			each(positions, (pos,idx) => {
				for(let u in data.series[idx]){
					switch(u){
						case 'x':
						case 'y':
						case 'drop':
						case 'span':
							continue;
						default:
							pos[u] = data.series[idx][u];
					}
				}
			});



			let isBar = (type) => type.search('Bars') >= 0 || type.search('bars') >= 0;

			let graphKey = gtype + '.' + idx;
			let mtype = isBar(gtype) ? 'bar' : gprops.markType || 'dot';
			let mprops = gprops.mark ? map(positions,(pos,idx) => {
				let markKey = graphKey + '.' + mtype[0] + '.' + idx;
				return {
					key: markKey,
					mark: marksVM[mtype.toUpperCase()].create(() => get().marks[idx], { position: pos, props: gprops, ds}), 
					pin: pinVM.create(() => get().marks[idx], {pos, tag: gprops.tag,ds}) 
				};
			}) : [];

			return {
				key: graphKey,
				type: gtype,
				path: gprops.onlyMarks ? {show: false} : graphVM[gtype.toUpperCase()].create(() => get().path, { serie: positions, props: gprops, ds }),
				markType: mtype,
				marks: mprops,
				show: gprops.show
			};
};

const axis = function(props,state,axe,dir){

	let partnerAxe = axe === 'abs' ? 'ord' : 'abs';
	let othdir = dir === 'x' ? 'y' : 'x';

	// for every abscissa
	let out = map(state.spaces[dir], (ds,key) => {

		if(isNil(ds)){
			return null;
		}

		let find = (key) => {
			switch(key){
				case 'top':
				case 'right':
					return 'max';
				default:
					return 'min';
			}
		};

		let axisKey = axe + '.' + key;

		let axisProps = findWhere(props.axisProps[axe], {placement: key});

		let partnerAxis = props.axisProps[partnerAxe][axisProps.partner];
		let partnerDs = state.spaces[othdir][partnerAxis.placement];

		let DS = {};
		DS[dir] = ds;
		DS[othdir] = partnerDs;
		let mgr = typeMgr(partnerDs.d.max);
		let partner = {
			pos: partnerDs.d[find(key)],
			length: mgr.distance(partnerDs.d.max,partnerDs.d.min)
		};
		let bounds = {min: ds.d.min, max: ds.d.max};

		return {
			show: axisProps.show,
			key: axisKey,
			axisLine: axisLineVM(ds,axisProps,partnerDs,dir ),
			ticks: ticksVM(DS, partner, bounds, dir, axisProps, axisProps.factor, axisKey)
		};
	});

	return reject(out, (val) => isNil(val));

};

export let cadreVM = {
	create: (get, props) => {
		return props;
	}
};

export let backgroundVM = {
	create: (get, { background, spaces }) => {
		return {
			color: background || 'none',
			spaceX:{
				min: Math.min.apply(null,map(spaces.x,(ds) => ds ? ds.c.min :  1e6 )),
				max: Math.max.apply(null,map(spaces.x,(ds) => ds ? ds.c.max : -1e6 ))
			},
			spaceY:{
				min: Math.min.apply(null,map(spaces.y,(ds) => ds ? ds.c.min : 1e6  )),
				max: Math.max.apply(null,map(spaces.y,(ds) => ds ? ds.c.max : -1e6 ))
			}
		};
	}
};

const defaultTo = (v,def) => isNil(v) ? def : v;

export let foregroundVM = {
	create: (get, { foreground, spaces }) => {
		if(isNil(foreground)){
			return null;
		}

		let fore = Array.isArray(foreground) ? foreground : [ foreground ];
		each(fore, f => {
			let { cx, cy, width, height } = f;
			cx     = defaultTo(cx,0);
			cy     = defaultTo(cy,0);
			width  = defaultTo(width,0);
			height = defaultTo(height,0);
			extend(f,{ cx, cy, width, height });
		});

		let { x, y } = spaces;
		let { bottom } = x;
		let { left }   = y;
		return {
			ds: {
				x: bottom,
				y: left
			},
			fore
		};
	}
};

export let titleVM = {
	create: (get, { title, titleFSize, width, height }) => {

		return {
			title, titleFSize, width, height, placement: 'top'
		};
	}
};

export let axesVM = {

	create: (get, { props, state }) => {
		return {
			css: props.css,
			abs: axis(props,state,'abs','x'),
			ord: axis(props,state,'ord','y')
		};
	}

};

export let curvesVM = {

	create: (get, { props, state }) => {

		let { spaces } = state;
		return map(state.series, (serie,idx) => {
			let data   = props.data[idx];
			let gprops = props.graphProps[idx];
			return curve(() => get()[idx], { spaces, serie, data, gprops, idx});
		});
	}

};
