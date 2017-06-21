var SensorTag = require('sensortag');
var mqtt = require('mqtt')
var TempVal = {}
var flag = 0

SensorTag.discover(function(tag) {
    tag.on('disconnect', function() {
        console.log('disconnected!');
        process.exit(0);
    });

    function connectAndSetUpMe() {
        console.log('connectAndSetUp');
        client = mqtt.connect('mqtt://192.168.0.4:1883')
        client.subscribe('command')
        client.on('connect', function() {

            console.log("Connected")
                //   client.subscribe('presence')    
        })
        tag.connectAndSetUp(enableIrTempMe);
    }

    function enableIrTempMe() {
        console.log('enableIRTemperatureSensor');
        // when you enable the IR Temperature sensor, start notifications:
        tag.enableIrTemperature(notifyMe);
    }

    function notifyMe() {
        tag.notifyIrTemperature(listenForTempReading); // start the temperature listener
    }

    // When you get an temperature change, print it out:
    function listenForTempReading() {
        tag.on('irTemperatureChange', function(objectTemp, ambientTemp) {
            TempVal.OTemp = objectTemp.toFixed(1);
            TempVal.ATemp = ambientTemp.toFixed(1);
            console.log(TempVal)
            console.log("In Mqtt send")

            client.publish('test', JSON.stringify(TempVal))

        });
        client.on('message', (topic, message) => {
            if (message.toString() == 'off') {
                console.log("Disconneted")
                flag = 1
                tag.disconnect();
            }

        })
    }
    // run the process from start again:
    connectAndSetUpMe();
});