var React = require('react');
var Tick = require('./Tick.cs.jsx');
var ticker = require('./ticker.cs.js');
var _ = require('underscore');

module.exports = React.createClass({
	PropTypes:{
		majorGrid: React.PropTypes.bool,
		minorGrid: React.PropTypes.bool
	},
	getDefaultProps: function(){
		return {
			// general for axis, default to abscissa bottom
			ds:{}, // see space-mgr for details
			type: 'number',
			dir: 0, // \theta in degrees
			placement: 'bottom',
			origin: {x:0, y:0},
			ticksLabel: [], // bars, text labels and coord pos
			label:'',
			labelDist: 20,
			labelFSize: 20 ,
			majorGrid: false,
			minorGrid: false,
			minorTick: false,
			gridLength: 0,
			stroke: 'black',
			strokeWidth: 1,
			empty: true,
			// ticks
			tickProps: {},
		};
	},
	render: function(){

// theta in radian
		var theta = this.props.dir * Math.PI / 180;

// axes
		var length = this.props.ds.c.max - this.props.ds.c.min;
		var xstart = this.props.origin.x;
		var ystart = this.props.origin.y;
		var xend = xstart + length * Math.cos(theta);
		var yend = ystart + length * Math.sin(theta); // y sign already dealt with

// ticks
		// ds = {c:{min, max}, d: {min, max}, d2c, c2d}
		// props.type = 'text' || 'number' || 'date'
		// props.labels = ['tick labels'] // if props.type === 'text'
		// props.placement = 'top' || 'bottom' || 'left' || 'right'
		// props.empty = true || false // if there's data
		var props = {};
		props.type = this.props.type;
		props.labels = this.props.ticksLabel;
		props.placement = this.props.placement;
		props.empty = this.props.empty;
		var tickProps = Tick.getDefaultProps(); //always start fresh
		_.each(this.props.tickProps,function(value,key){
			tickProps[key] = value;
		});
		tickProps.grid = this.props.majorGrid;
		tickProps.gridLength = this.props.gridLength;
		var key = this.props.name;
		var ticks = _.map(ticker.ticks(this.props.origin,this.props.ds,this.props.dir,props),function(tick,index){
			if(!!tick.offset){tickProps.major.offset = tick.offset;}
		   tickProps.name = key + 't' + index;
			return <Tick {...tickProps} where={tick.here} label={tick.me} dir={tick.dir} />;
		});
		var subTickProps = Tick.getDefaultProps(); //always start fresh
		subTickProps.isMajor = false;
		_.each(this.props.subTickProps,function(value,key){
			subTickProps[key] = value;
		});
		if(this.props.minorTicks){
			ticks = ticks.concat(_.map(ticker.subticks(this.props.origin,this.props.ds,this.props.dir,props),function(subtick,index){
					if(!!subtick.offset){subTickProps.minor.offset = subtick.offset;}
		   		subTickProps.name = key + 'st' + index;
					return <Tick {...subTickProps} where={subtick.here} label={subtick.me} dir={subtick.dir}/>;
				})
			);
		}

// label
		// on axis
		var fs = this.props.labelFSize;
		var xL = (xend + xstart)/2;
		var yL = (yend + ystart)/2;
		var textAnchor = 'middle';
		// shifting from axis
		var labelDist = this.props.labelDist;
		var offset = function(fac){return labelDist + fac * fs;}; // hard-coded for the moment, size of ticks
		switch(this.props.placement){
			case 'bottom':
				yL += offset(1); // font height
				break;
			case 'top':
				yL -= offset(0.33); // font depth
				break;
			case 'left':
				xL -= offset(1);
				break;
			case 'right':
				xL += offset(0);
				break;
			default:
				throw 'Unkonw anchor attribute';
		}

		var dird = (this.props.dir > 0)?-this.props.dir:this.props.dir;
		var rotate = 'rotate(' + dird + ' ' + xL + ' ' + yL + ')'; // in degrees

		var keyL = this.props.name + 'L';
		var keyT = this.props.name + 'T';
		var keyg = this.props.name + 'g';

		return <g key={keyg}>
			<line key={keyL} x1={xstart} x2={xend} y1={ystart} y2={yend} 
				stroke={this.props.stroke}
				strokeWidth={this.props.strokeWidth} />
			{ticks}
			<text key={keyT} x={xL} y={yL} transform={rotate} textAnchor={textAnchor} fontSize={fs}>{this.props.label}</text>
			</g>;
}
});
