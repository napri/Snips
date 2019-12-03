var mqtt = require('mqtt');
	Player = require('./player.js');

var hostname = "mqtt://raspberrypi.local";
var client  = mqtt.connect(hostname);
player = new Player(client);

client.on('connect', function () {
    console.log("[Snips Log] Connected to MQTT broker " + hostname);

	// Subscribe to the hotword detected topic
	client.subscribe('hermes/hotword/default/detected');
	// Subscribe to intent topic
	client.subscribe('hermes/dialogueManager/sessionEnded');

	client.subscribe('hermes/intent/Lautstaerkeerhoehen');
	client.subscribe('hermes/intent/NaechsteMusik');
	client.subscribe('hermes/intent/listSongs');
	client.subscribe('hermes/intent/Wiederaufnahme');
	client.subscribe('hermes/intent/playSong');
	client.subscribe('hermes/intent/Speakerhalten');
	client.subscribe('hermes/intent/Arstistspielen');
	client.subscribe('hermes/intent/vorherigersong');
	client.subscribe('hermes/intent/ToggleStummschaltung');
	client.subscribe('hermes/intent/Lautstaerkereduziert');

});

client.on('message', function (topic, message) {
	let data,
		payload,
		action;

		data = JSON.parse(message);
		console.log(`received a message on topic ${topic}`);
		action = topic;
		console.log(`action is ${action}`);

	if (action == 'hermes/hotword/default/detected') {
			console.log("Hotword detected!");
			player.listenOn();
			
    } else if (action == 'sessionEnded') {
			player.listenOff();
    } else {
		
		payload = '{ "sessionId": "${data.sessionId}" }';
		action = player.methods[action];
		if(action)
		action(data);
		client.publish('hermes/dialogueManager/endSession', payload);
	}

	setTimeout(player.logInfo.bind(player), 2000);
});

player.start();

































/*
function onIntentDetected(intent) {
    console.log("[Snips Log] Intent detected: " + JSON.stringify(intent));
}

function onHotwordDetected() {
    console.log("[Snips Log] Hotword detected");
}

function onListeningStateChanged(listening) {
    console.log("[Snips Log] " + (listening ? "Start" : "Stop") + " listening");
}
*/
/*function sagen (text)
{
	client.publish('hermes/dialogueManager/startSession', JSON.dumps(
		{
			'init': {
				'type':'notification',
				'text': text
			}
		}
	))
}
function fehler (text)
{

}
*/

