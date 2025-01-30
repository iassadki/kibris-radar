import init from 'react_native_mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Créer un objet pour stocker l'état
export const mqttState = {
    status: 'disconnected',
    lastMessage: ''
};

init({
    size: 10000,
    storageBackend: AsyncStorage,
    defaultExpires: 1000 * 3600 * 24,
    enableCache: true,
    reconnect: true,
    sync: {},
});

// Configurer le client MQTT pour se connecter à test.mosquitto.org
const client = new Paho.MQTT.Client(
    "test.mosquitto.org",
    9600,                 // Port par défaut pour MQTT
    "clientId_" + Math.random().toString(16).substr(2, 8)  // ID unique pour le client
);

// Fonction exécutée après une connexion réussie
function onConnect() {
    mqttState.status = "connected";
    console.log(mqttState.status);

    // Souscrire au topic "13a20041642063"
    // client.subscribe($(MQTT_BROKER_TOPIC));
    client.subscribe("13a20041642063");
}

// Fonction en cas de perte de connexion
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        mqttState.status = responseObject.errorMessage;
        console.log(mqttState.status);
    }
}

// Fonction appelée à la réception d'un message
function onMessageArrived(message) {
    mqttState.lastMessage = message.payloadString;
    console.log("Message reçu : " + mqttState.lastMessage); // Afficher le message reçu dans la console
    // Stocker le message dans AsyncStorage
    AsyncStorage.setItem('mqtt_message', mqttState.lastMessage)
        .then(() => {
            console.log('Message stored in AsyncStorage');
        })
        .catch((error) => {
            console.error('Error storing message:', error);
        });
}

// Attacher les événements au client MQTT
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// Connexion au broker MQTT
client.connect({
    onSuccess: onConnect,  // Callback après une connexion réussie
    useSSL: false,         // Utilisation de SSL (mettre à `true` si nécessaire)
});

export default client; 