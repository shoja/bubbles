var Speaker = require('speaker');
var net = require('net');
var os = require('os');

var MY_HOST = os.hostname()
var PORT = 52280;
var RATE = 44100;
var CHANNELS = process.env.CHANNELS || 2;
var BIT_DEPTH = 16;

var CLIENT_MAP = {
  "bubble-server-0": "192.168.0.201",
  "bubble-server-1": "192.168.0.202",
  "bubble-server-2": "192.168.0.203",
  "bubble-server-3": "192.168.0.200"
}

var launchClient = function() {
  var speakerConfig = {
    channels: CHANNELS,
    sampleRate: RATE,
    bitDepth: BIT_DEPTH,
  }

  if(process.env.DEBUG) {
    speakerConfig.debug = true;
  }

  var speaker = new Speaker(speakerConfig);
  var client = new net.Socket();

  speaker.on('error', function(error) {
    console.log('speaker error', error);
  });

  if(process.env.SERVER) {
    var host = process.env.SERVER;
  } else {
    var host = CLIENT_MAP[MY_HOST];
  }

  console.log(MY_HOST, host);

  client.connect({ host: host, port: PORT }, function() {
    console.log('Connected: ' + host + ':' + PORT);
    client.pipe(speaker);
  });

  client.on('close', function(data) {
    console.log('Closed', data);
    client.unpipe();
    client = undefined;
    attemptToReconnect();
  });

  client.on('error', function(error) {
    console.log('Error', error);
  });
};

var attemptToReconnect = function() {
  setTimeout(function() {
    console.log('Attempting to reconnect.');
    launchClient()
  }, 3000);
};

launchClient();

