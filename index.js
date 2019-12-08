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

	client.subscribe('hermes/intent/Volumeup');
	client.subscribe('hermes/intent/Naechstemusik');
	client.subscribe('hermes/intent/Listmusik');
	client.subscribe('hermes/intent/Resumemusik');
	client.subscribe('hermes/intent/Titelspielen');
	client.subscribe('hermes/intent/Musicbeenden');
	client.subscribe('hermes/intent/Arstistspielen');
	client.subscribe('hermes/intent/Vorherigemusik');
	client.subscribe('hermes/intent/Stummschalten');
	client.subscribe('hermes/intent/Volumedown');

});

client.on('message', function (topic, message) {
		
		var payload = JSON.parse(message);
		var name = payload["intent"]["#"];
		var slots = payload[slots];

		console.log(`received a message on topic ${topic}`);

		//action = topic.split('/').pop();
		//console.log(`action is ${action}`);

	if (topic.startsWith('hermes/hotword/default/detected')) {
		console.log("Hotword detected!");
			//player.listenOn();

		console.log(`Intent ${name} detected with slots ` +
		`{JSON.stringify(slots)}`);
			
    } else if (topic.startsWith('hermes/intent/Titelspielen')) {
			//action = player.methods[action];
			player.tilelFinden();
			
			console.log(`Intent ${name} detected with slots ` +
		`{JSON.stringify(slots)}`);

    } else {
		
		payload = '{ "sessionId": "${message.sessionId}" }';

		//player.tilelFinden();
		//console.log("SessionPlaying!");
		//action = player.methods[action];
		//if(action)
		//action(data);
		console.log("Data Session!");
		client.publish('hermes/dialogueManager/endSession', payload); 
	}

	setTimeout(player.logInfo.bind(player), 500);
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

