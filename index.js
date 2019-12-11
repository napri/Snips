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

	client.subscribe('hermes/intent/Princesse1999:Volumeup');
	client.subscribe('hermes/intent/Princesse1999:Naechstemusik');
	client.subscribe('hermes/intent/Princesse1999:Listmusik');
	client.subscribe('hermes/intent/Princesse1999:Resumemusik');
	client.subscribe('hermes/intent/Princesse1999:Titelspielen');
	client.subscribe('hermes/intent/Princesse1999:Musicbeenden');
	client.subscribe('hermes/intent/Princesse1999:Arstistspielen');
	client.subscribe('hermes/intent/Princesse1999:Vorherigemusik');
	client.subscribe('hermes/intent/Princesse1999:Stummschalten');
	client.subscribe('hermes/intent/Princesse1999:Volumedown');
	//client.subscribe('hermes/intent/#');

});

client.on('message', function (topic, message) {
		let payload,
			slots,
			name,
			action;
		

	    payload = JSON.parse(message);
		slots = payload[slots];
		console.log(`received a message on topic ${topic}`);
		action = topic.split('/').pop();
		console.log(`action is ${action}`);

	if (action == 'detected') {
		console.log("Hotword detected!");
		player.listenOn();
	} else if (action == 'sessionEnded'){
		player.listenOff();

	}else {
		
		payload1 = '{ "sessionId": "${message.sessionId}" }';
		action = player.methods[action];
		if(action)
		  action(payload);	
		client.publish('hermes/dialogueManager/startSession', payload1); 
	}

	setTimeout(player.logInfo.bind(player), 500);
});

player.start();

