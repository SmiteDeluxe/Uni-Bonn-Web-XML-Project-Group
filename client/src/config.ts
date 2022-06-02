//Edited by: *** ***
import mqtt from 'mqtt';

export function randomClientId(): string {
    return 'mqttjs_node_' + Math.random().toString(16).substr(2, 8);
}

const connection = {
    host: "localhost",
    port: 9001,
    keepalive: 1000,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 4000,
    clientId: randomClientId(),
    username: "mosquitto",
    password: "test"
};
const {host, port, ...options} = connection;
export const url = `tcp://${host}:${port}`;
export const client = mqtt.connect(url, options);
