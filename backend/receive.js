import init from 'react_native_mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de l'état MQTT
export const mqttState = {
    status: 'disconnected',
    lastMessage: ''
};

// Initialisation MQTT
init({
    size: 10000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: true,
    reconnect: true,
    sync: {},
});

// Configuration du client MQTT
const client = new Paho.MQTT.Client(
    "test.mosquitto.org",  // host
    8081,                  // Port WebSocket sécurisé
    "clientId_" + Math.random().toString(16).substr(2, 8)
);

// Options de connexion
const connectOptions = {
    onSuccess: onConnect,
    onFailure: onFailure,
    useSSL: true,
    keepAliveInterval: 30,
    cleanSession: true,
    reconnect: true
};

// Gestionnaire de connexion réussie
function onConnect() {
    mqttState.status = "connected";
    console.log("Connecté au broker MQTT");

    // Souscription au topic
    client.subscribe("13a20041642063", {
        qos: 0,
        onSuccess: () => console.log("Souscription réussie"),
        onFailure: (error) => console.error("Erreur de souscription:", error)
    });
}

// Gestionnaire d'échec de connexion
function onFailure(error) {
    mqttState.status = "connection_failed";
    console.error("Échec de connexion:", error);
}

// Gestionnaire de perte de connexion
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        mqttState.status = "disconnected";
        console.error("Connexion perdue:", responseObject.errorMessage);

        // Tentative de reconnexion
        setTimeout(() => {
            console.log("Tentative de reconnexion...");
            client.connect(connectOptions);
        }, 5000);
    }
}

// Gestionnaire de réception de messages
function onMessageArrived(message) {
    mqttState.lastMessage = message.payloadString;
    console.log("Message reçu:", mqttState.lastMessage);

    AsyncStorage.setItem('mqtt_message', mqttState.lastMessage)
        .then(() => console.log('Message stocké dans AsyncStorage'))
        .catch(error => console.error('Erreur de stockage:', error));
}

// Attribution des gestionnaires d'événements
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// Connexion au broker
client.connect(connectOptions);

export default client;