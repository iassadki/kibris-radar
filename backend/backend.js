const { SerialPort } = require('serialport');
const xbee_api = require('xbee-api');
const mqtt = require('mqtt');
require('dotenv').config();

var C = xbee_api.constants;

// 📌 Chargement des variables d'environnement
const SERIAL_PORT = process.env.SERIAL_PORT;
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const MQTT_TOPIC = process.env.MQTT_TOPIC;
const BAUDRATE = parseInt(process.env.SERIAL_BAUDRATE) || 9600;

if (!SERIAL_PORT || !MQTT_BROKER_URL || !MQTT_TOPIC) {
  throw new Error('❌ Vérifie tes variables d\'environnement: SERIAL_PORT, MQTT_BROKER_URL, MQTT_TOPIC');
}

// Configuration du module XBee en API MODE 2
var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

// Configuration du port série
let serialport = new SerialPort({
  path: SERIAL_PORT,
  baudRate: BAUDRATE,
});

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);

// 🔗 Connexion au broker MQTT
const mqttClient = mqtt.connect(MQTT_BROKER_URL);

mqttClient.on('connect', function () {
  console.log(`✅ Connecté à MQTT Broker: ${MQTT_BROKER_URL}`);
});

mqttClient.on('error', function (err) {
  console.error('❌ Erreur de connexion MQTT:', err);
});

// 📡 Réception des trames XBee
xbeeAPI.parser.on("data", function (frame) {
  if (C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET === frame.type) {
    console.log("📩 Trame reçue : ZIGBEE_RECEIVE_PACKET");

    let dataReceived = String.fromCharCode.apply(null, frame.data);
    console.log("💬 Données reçues :", dataReceived);

    // 📤 Publier les données reçues sur MQTT
    mqttClient.publish(MQTT_TOPIC, dataReceived, function (err) {
      if (err) {
        console.error('❌ Erreur d\'envoi MQTT:', err);
      } else {
        console.log(`✅ Données envoyées sur MQTT: ${MQTT_TOPIC}`);
      }
    });

  } else {
    console.log('ℹ️ Frame reçue mais non traitée:', frame);
  }
});
