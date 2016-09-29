var colors = {
	green: {
		dark: d3.rgb( '#3A4445' ),
		medium: d3.rgb( '#A0B1B2' ).darker(),
		light: d3.rgb( '#A0B1B2' ),
		extralight: d3.rgb( '#C9CCCD' )
	},
	blue: {
		dark: d3.rgb( '#5A76A8' ).darker(),
		medium: d3.rgb( '#5A76A8' ),
		light: d3.rgb( '#788AB5' ),
		extralight: d3.rgb( '#B4BBD5' )
	},
	purple: {
		dark: d3.rgb( '#6D658D' ).darker(),
		medium: d3.rgb( '#6D658D' ),
		light: d3.rgb( '#938BAA' ),
		extralight: d3.rgb( '#C0BCCD' )
	},
	red: {
		dark: d3.rgb( '#9F746E' ).darker(),
		medium: d3.rgb( '#9F746E' ),
		light: d3.rgb( '#AE8983' ),
		extralight: d3.rgb( '#D0BBB6' )
	},
	pink: {
		dark: d3.rgb( '#C58B9C' ).darker(),
		medium: d3.rgb( '#C58B9C' ),
		light: d3.rgb( '#D3A5B1' ),
		extralight: d3.rgb( '#DEC1C8' )
	},
	yellow: {
		dark: d3.rgb( '#B1AF76' ).darker(),
		medium: d3.rgb( '#B1AF76' ),
		light: d3.rgb( '#BFBC8C' ),
		extralight: d3.rgb( '#DCD9C0' )
	}
};

var map = {
	all: 'green',
	trump: 'red',
	clinton: 'blue',
	during: 'medium',
	post: 'extralight'
};

var timeframes = {
	during: 'During the debate',
	post: 'The day after the debate'
};

var exclusives = {
	trump: 'Tweets by exclusive followers of Trump',
	clinton: 'Tweets by exclusive followers of Clinton',
	all: 'Tweets by all Twitter users'
};


d3.json( 'data/data.json', function ( response ) {


	var activeTimeframes = [];
	var activeExclusives = [];
	var activeTopics = [];

	// Create the dropdowns, and bind them.
	d3.select( '#viz-timeframes-dropdown' ).selectAll( 'li' )
		.data( _.keys( timeframes ) )
		.enter()
		.append( 'li' )
		.text( function ( d ) { return timeframes[d] } );
	d3.select( '#viz-exclusives-dropdown' ).selectAll( 'li' )
		.data( _.keys( exclusives ) )
		.enter()
		.append( 'li' )
		.text( function ( d ) { return exclusives[d] } );
	d3.select( '#viz-topics-dropdown' ).selectAll( 'li' )
		.data( _.keys( response.during.all ) )
		.enter()
		.append( 'li' )
		.text( function ( d ) { return d; } );

	_.each( document.getElementsByClassName( 'viz-dropdown-wrapper' ), function ( el ) {

		el.getElementsByTagName( 'h2' )[0].addEventListener( 'click', function ( e ) {
			el.getElementsByClassName( 'viz-dropdown' )[0].classList.toggle( 'active' );
		} );

		_.each( el.getElementsByTagName( 'li' ), function ( subel ) {
			subel.addEventListener( 'click', function ( e ) {
				subel.classList.toggle( 'active' );
				activeTimeframes = [];
				activeExclusives = [];
				activeTopics = [];
				d3.select( '#viz-timeframes-dropdown' ).selectAll( 'li.active' ).each( function ( d, i ) {
					activeTimeframes.push( d );
				} );
				d3.select( '#viz-exclusives-dropdown' ).selectAll( 'li.active' ).each( function ( d, i ) {
					activeExclusives.push( d );
				} );
				d3.select( '#viz-topics-dropdown' ).selectAll( 'li.active' ).each( function ( d, i ) {
					activeTopics.push( d );
				} );
				if ( activeTopics.length > 0 && activeExclusives.length > 0 && activeTimeframes.length > 0 ) {
					render();
				} else {
					d3.selectAll( 'rect' ).remove();
				}

			} );

		} );

	} );

	var render = function () {

		var data = [];

		_.each( activeTimeframes, function ( timeframe , i) {
			_.each( activeExclusives, function ( exclusive, j ) {
				_.each( activeTopics, function ( topic, k ) {
					data.push( {
						timeframe: timeframe,
						exclusive: exclusive,
						topic: topic,
						value: response[timeframe][exclusive][topic]
					} );
				} );
			} );
		} );

		data.sort( function ( a, b ) {

		// 	// SORT BY THE MAX SIZE OF THE TOPIC VALUE.
		// 	// var aMax = d3.max( _.filter( data, function ( d ) { return d.topic === a.topic }, function ( d ) { return d.value } ) );
		// 	// var bMax = d3.max( _.filter( data, function ( d ) { return d.topic === b.topic }, function ( d ) { return d.value } ) );

		// 	// return aMax > bMax ? 1 : -1;

			if ( a.topic > b.topic ) {
				return 1;
			} else if ( b.topic > a.topic ) {
				return -1;
			} else {
				if ( a.exclusive > b.exclusive ) {
					return 1;
				} else if ( b.exclusive > a.exclusive ) {
					return -1;
				} else {
					return a.timeframe > b.timeframe ? 1 : -1;
				}
			}
 
		} );

		var xScale = d3.scaleLinear()
			.domain( [ 0, d3.max( data, function ( d ) { return d.value } ) ] )
			.range( [ 0, 800 ] );

		d3.select( '#viz' ).attr( 'width', 800 ).attr( 'height', ( data.length * 30 ) );

		d3.select( '#viz' ).selectAll( 'rect' ).remove();
		d3.select( '#viz' ).selectAll( 'rect' )
			.data( data )
			.enter()
			.append( 'rect' )
			.attr( 'x', 0 )
			.attr( 'y', function ( d, i ) {
				return i * 30;
			} )
			.attr( 'width', function ( d, i ) {
				return xScale( d.value );
			} )
			.attr( 'height', 20 )
			.style( 'fill', function ( d ) {
				return colors[map[d.exclusive]][map[d.timeframe]];
			} )
		d3.select( '#viz' ).selectAll( 'text' ).remove();
		d3.select( '#viz' ).selectAll( 'text.bar-label' )
			.data( data )
			.enter()
			.append( 'text' )
			.attr( 'x', 0 )
			.attr( 'y', function ( d, i ) {
				return ( i * 30 ) + 15;
			} )
			.classed( 'bar-label', true )
			.text( function ( d ) {
				return d.timeframe + ' // ' + d.exclusive + ' // ' + d.topic + ': ' + ( Math.round( d.value * 10000 ) / 100 ) + '%';
			});

	}



} );