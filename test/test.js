const fs = require('fs');

function testStationsJson() {
  const raw = fs.readFileSync('data/stations.json', 'utf8');
  const stations = JSON.parse(raw);
  console.assert(Array.isArray(stations), 'stations should be array');
  console.assert(stations.length >= 1, 'stations should not be empty');
  stations.forEach(s => {
    console.assert(s.name && s.filename, 'station should have name and filename');
  });
}

try {
  testStationsJson();
  console.log('All tests passed');
} catch (e) {
  console.error('Test failed', e);
  process.exit(1);
}
