import React from 'react';

import { toC }             from '../core/space-transf.js';
import { isEqual }         from '../core/im-utils.js';
import { isNil, toNumber } from '../core/utils.js';

/*
	{
		ds: {x: , y:},
		position: {x: , y:},
		label: '',
		FSize: ,
		offset: {x, y},
		anchor: '',
		color: '',
		dir: {x, y},
		rotate: true || false,
		transform: true || false
	},
*/

export default class Label extends React.Component {

	shouldComponentUpdate(props){
		return !isEqual(props.state,this.props.state);
	}

	power(label, props){
		const { base, power } = label;
		return <text {...props}>
			<tspan>{base}</tspan>
			{ power !== 0 ? <tspan>&#183;10</tspan> : null }
			{ power !== 0 ? <tspan dy={-0.5 * toNumber(props.fontSize)}>{power}</tspan> : null }
		</text>;
	}

	render(){

		if(this.props.state.label.length === 0){
			return null;
		}

// label
		// => theta = arctan(y/x) [-90,90]

		const { state, className } = this.props;

		const { transform, ds, position, offset, rotate, angle, dir, color, FSize, anchor, label, howToRotate, LLength, LHeight, css } = state;

		const xL = ( transform ? toC(ds.x,position.x) : position.x ) + offset.x;
		const yL = ( transform ? toC(ds.y,position.y) : position.y ) + offset.y;

		const theta = isNil(angle) ? rotate ? Math.floor( Math.atan( - Math.sqrt( dir.y / dir.x ) ) * 180 / Math.PI ) : 0 : angle; // in degrees

		const alpha = theta * Math.PI/180; // radians

		const rotation = `rotate(${theta} ${xL} ${yL})`;

		const ly = - dir.x * (1 - Math.cos(alpha)) * LHeight;
		const lx =  LLength ?  dir.x * (1 - Math.cos(alpha)) * LLength : 0;
		const translation = lx && ly && ( Math.abs(lx) > 1 || Math.abs(ly) > 1 ) ? `translate(${lx},${2 *ly})` : ''; // projection

		const rotateAnchor = theta * howToRotate;

		const props = {
			className: css ? className : '',
			x: xL,
			y: yL, 
			transform: `${translation} ${rotation}`,
			textAnchor: rotateAnchor  > 0 ? 'start' : rotateAnchor < 0 ? 'end' : anchor,
			fill: color,
			fontSize: typeof FSize === 'number' ? `${FSize}pt` : FSize
		};

		const write = () => typeof label === 'string' ? <text {...props}>{label}</text> : this.power(label,props);
		const rectMe = () => {
			const bck = s => `${s.split(' ').join('-background ')}-background`;
			const hoff = LHeight * 0.2; // descent
			const mar  = 3;
			//
			const xr = xL - (props.textAnchor === 'start' ? 0 : props.textAnchor === 'end' ? LLength : LLength/2) - mar;
			const yr = yL - LHeight + hoff - mar;
			const wr = LLength + 2*mar;
			const hr = LHeight + 2*mar;
			return <g>
				<rect x={xr} y={yr} width={wr} height={hr} fill='none' transform={`${translation} ${rotation}`} className={bck(className)}/>
				{write()}
			</g>;
		};

		return css ? rectMe() : write();
	}
}
