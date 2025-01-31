const { SerialPort } = require('serialport');
const xbee_api = require('xbee-api');
const mqtt = require('mqtt');
require('dotenv').config();

var C = xbee_api.constants;

// 📌 Chargement des variables d'environnement
const SERIAL_PORT = process.env.SERIAL_PORT;
const SERIAL_PORT_ARDUINO = process.env.SERIAL_PORT_ARDUINO;
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const MQTT_TOPIC_DATA = process.env.MQTT_TOPIC + "/data";
const MQTT_TOPIC_LED1 = process.env.MQTT_TOPIC + "/led1";
const MQTT_TOPIC_LED2 = process.env.MQTT_TOPIC + "/led2";
const BAUDRATE = parseInt(process.env.SERIAL_BAUDRATE) || 9600;

if (!SERIAL_PORT || !MQTT_BROKER_URL || !process.env.MQTT_TOPIC) {
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

let arduino = new SerialPort({
  path: SERIAL_PORT_ARDUINO,
  baudRate: BAUDRATE,
});

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);

// 🔗 Connexion au broker MQTT
const mqttClient = mqtt.connect(MQTT_BROKER_URL);

mqttClient.on('connect', function () {
  console.log(`✅ Connecté à MQTT Broker: ${MQTT_BROKER_URL}`);
  // Abonnement aux topics des LEDs
  mqttClient.subscribe([MQTT_TOPIC_LED1, MQTT_TOPIC_LED2, MQTT_TOPIC_DATA], function (err) {
    if (err) {
      console.error('❌ Erreur abonnement MQTT:', err);
    } else {
      console.log(`📡 Abonné aux topics: ${MQTT_TOPIC_LED1} et ${MQTT_TOPIC_LED2}`);
    }
  });
});

mqttClient.on('message', function (topic, message) {
  let command = message.toString();
  let finalCommand = command;
  
  if (finalCommand === "1" || finalCommand === "0") {
    // Ajouter l'identifiant de la LED en fonction du topic
    let ledIdentifier = topic === MQTT_TOPIC_LED1 ? "1:" : "2:";
    finalCommand = ledIdentifier + finalCommand;
    
    console.log(`📤 Tentative d'envoi sur le port série: ${SERIAL_PORT_ARDUINO}`);
    console.log(`📝 Commande à envoyer: "${finalCommand}\r\n"`);
    
    // Vérifier si le port est ouvert
    if (!serialport.isOpen) {
      console.error('❌ Le port série n\'est pas ouvert!');
      return;
    }

    const frame = {
      type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
      destination64: "0013A2004147961D",  // Adresse du routeur
      options: 0x00,
      data: finalCommand
    };
    
    // Envoyer la trame
    xbeeAPI.builder.write(frame, (err) => {
      if (err) {
        console.error("❌ Erreur lors de l'envoi de la trame :", err);
      } else {
        console.log("✅ Trame envoyée avec succès !");
      }
    });

    serialport.write(finalCommand + '\r\n', function(err){
      if(err){
        console.error('❌ Erreur d\'envoi sur le port série:', err);
      } else {
        console.log(`✅ Commande envoyée à l'Arduino: ${finalCommand}`);
        
        // Vider le buffer pour s'assurer que la commande est envoyée
        serialport.drain((err) => {
          if (err) {
            console.error('❌ Erreur lors du drain du port série:', err);
          } else {
            console.log('✅ Buffer série vidé avec succès');
          }
        });
      }
    });
  } else {
    console.log(`⚠️ Message ignoré : ${command} sur le topic ${topic}`);
  }
});

mqttClient.on('error', function (err) {
  console.error('❌ Erreur de connexion MQTT:', err);
});

// 📡 Réception des trames XBee
xbeeAPI.parser.on("data", function (frame) {
  if (C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET === frame.type) {
    let dataReceived = String.fromCharCode.apply(null, frame.data);
    
    // Déterminer le topic en fonction de la donnée reçue
    // 📤 Publier les données reçues sur MQTT
    mqttClient.publish(MQTT_TOPIC_DATA, dataReceived, function (err) {
      if (err) {
        console.error('❌ Erreur d\'envoi MQTT:', err);
      } else {
        console.log(`✅ Données envoyées sur MQTT (${MQTT_TOPIC_DATA}):`, dataReceived);
      }
    });
  } else {
  }
});

// Ajouter des listeners pour les événements du port série
serialport.on('open', () => {
  console.log('🔌 Port série ouvert avec succès');
});

serialport.on('error', (err) => {
  console.error('🚨 Erreur port série:', err);
});
