var fs = require( 'fs' );
var _ = require( 'underscore' );

var response = require( './../data/2016-09-27_2016-09-28_all.json' ).aggregates;
// var response = require( './../data/2016-10-05_2016-10-06_all.json' ).aggregates;
// var response = require( './../data/2016-10-10_2016-10-11_all.json' ).aggregates;

var candidates = [];
var civilities = [];
var exclusives = [];
var genders = [];
var topics = [];

var index = 1;
var debate = {
	start: Date.parse( '2016-09-27 01:00' ),
	end: Date.parse( '2016-09-27 03:00' )
	// start: Date.parse( '2016-10-05 01:00' ),
	// end: Date.parse( '2016-10-05 03:00' )
	// start: Date.parse( '2016-10-10 01:00' ),
	// end: Date.parse( '2016-10-10 03:00' )
};

_.each( response, function ( d ) {

	if ( candidates.indexOf( d.candidate ) === -1 ) {
		candidates.push( d.candidate );
	}

	if ( civilities.indexOf( d.civility ) === -1 ) {
		civilities.push( d.civility );
	}

	if ( exclusives.indexOf( d.exclusive_follower_of ) === -1 ) {
		exclusives.push( d.exclusive_follower_of );
	}

	if ( genders.indexOf( d.gender ) === -1 ) {
		genders.push( d.gender );
	}

	if ( topics.indexOf( d.topic ) === -1 ) {
		topics.push( d.topic );
	}

} );

var rawData = {
	during: {
		trump: {
			all: 0
		},
		clinton: {
			all: 0
		},
		all: {
			all: 0
		}
	},
	post: {
		trump: {
			all: 0
		},
		clinton: {
			all: 0
		},
		all: {
			all: 0
		}
	}
};

var keys = [ 'trump', 'clinton', 'all' ];

_.each( topics, function ( topic ) {
	_.each( keys, function ( key ) {
		rawData.during[key][topic] = 0;
		rawData.post[key][topic] = 0;
	} );
} );

_.each( response, function ( d ) {

	_.each( d.timeline, function ( t ) {

		if ( Date.parse( t[0] ) >= debate.start && Date.parse( t[0] ) < debate.end ) {

			if ( d.exclusive_follower_of === 'Donald Trump' ) {
				rawData.during.trump.all += t[1];
				rawData.during.trump[d.topic] += t[1];
			}

			if ( d.exclusive_follower_of === 'Hillary Clinton' ) {
				rawData.during.clinton.all += t[1];
				rawData.during.clinton[d.topic] += t[1];
			}

			rawData.during.all.all += t[1];
			rawData.during.all[d.topic] += t[1];

		} else if ( Date.parse( t[0] ) >= debate.end ) {

			if ( d.exclusive_follower_of === 'Donald Trump' ) {
				rawData.post.trump.all += t[1];
				rawData.post.trump[d.topic] += t[1];
			}

			if ( d.exclusive_follower_of === 'Hillary Clinton' ) {
				rawData.post.clinton.all += t[1];
				rawData.post.clinton[d.topic] += t[1];
			}

			rawData.post.all.all += t[1];
			rawData.post.all[d.topic] += t[1];

		}

	} );

} );

var data = {
	during: {},
	post: {}
};

_.each( keys, function ( key ) {
	data.during[key] = {};
	_.each( topics, function ( topic ) {
		data.during[key][topic] = rawData.during[key][topic] / rawData.during[key].all;
	} );
	data.post[key] = {};
	_.each( topics, function ( topic ) {
		data.post[key][topic] = rawData.post[key][topic] / rawData.post[key].all;
	} );
} );

_.each( keys, function ( key ) {

	var duringCsv = '';
	_.each( topics, function ( topic, i ) {
		duringCsv += i === 0 ? topic : ',' + topic;
	} );
	duringCsv += '\n';

	_.each( topics, function ( topic, i ) {
		duringCsv += i === 0 ? data.during[key][topic] : ',' + data.during[key][topic];
	} );

	fs.writeFile( './data/csv/during-' + index + '-' + key + '.csv', duringCsv, function ( e ) { console.log( e ? e : 'File written.' ); } );

	var postCsv = '';
	_.each( topics, function ( topic, i ) {
		postCsv += i === 0 ? topic : ',' + topic;
	} );
	postCsv += '\n';

	_.each( topics, function ( topic, i ) {
		postCsv += i === 0 ? data.post[key][topic] : ',' + data.post[key][topic];
	} );

	fs.writeFile( './data/csv/post-' + index + '-' + key + '.csv', postCsv, function ( e ) { console.log( e ? e : 'File written.' ); } );

} );

fs.writeFile( './data/data-' + index + '.json', JSON.stringify( data, null, 2 ), function ( e ) { console.log( e ? e : 'File written.' ) } );


var csv = 'issue';
_.each( [ 'during', 'post' ], function ( timeframe ) {
	_.each( keys, function ( key ) {
		csv += ',' + timeframe + ' ' + key;
	} );
} );
csv += '\n';
_.each( topics, function ( topic ) {
	csv += topic;
	_.each( [ 'during', 'post' ], function ( timeframe ) {
		_.each( keys, function ( key ) {
			csv += ',' + data[timeframe][key][topic];
		} );
	} );
	csv += '\n';
} );

fs.writeFile( './data/data-' + index + '.csv', csv, function ( e ) { console.log( e ? e : 'File written.' ) } );

