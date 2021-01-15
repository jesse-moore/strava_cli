var gpxParse = require('gpx-parse');
var polyline = require('@mapbox/polyline');

//from file
gpxParse.parseGpxFromFile('./data/bpm.gpx', function (error, data) {
    const latlng = data.tracks[0].segments[0].map(({ lat, lon }) => {
        return [lat, lon];
    });
    const encoded = polyline.encode(latlng);
    // console.log(encoded);
    console.log(latlng[0]);
    console.log(latlng[latlng.length - 1]);
});
