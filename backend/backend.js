const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://test.mosquitto.org')
client.on('connect', function () {
    console.log('test1')
    client.subscribe('13A2004147961D', function (err) {
        console.log('test2')
        if (!err){
            console.log('test3')
            client.publish('13A2004147961D', 'Hello mqtt')
        }
    })
})
client.on('message', function (topic, message) {
    // message is Buffer
    console.log(topic, message.toString())
    client.end()
})