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

const client = new Paho.MQTT.Client(
    "broker.hivemq.com",
    8000,
    "clientId_" + Math.random().toString(16).substr(2, 8)
);

function onConnect() {
    mqttState.status = "connected";
    console.log(mqttState.status);
    client.subscribe("mon/topic");
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        mqttState.status = responseObject.errorMessage;
        console.log(mqttState.status);
    }
}

function onMessageArrived(message) {
    mqttState.lastMessage = message.payloadString;
    console.log(mqttState.lastMessage);
}

client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;
client.onConnect = onConnect;

client.connect({
    onSuccess: onConnect,
    useSSL: false,
});

export default client;