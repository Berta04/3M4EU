const mqtt = require("mqtt");

const events = {};

module.exports.connectClient = async (ip, clientId) => {
    return mqtt.connect(ip, {
        clientId: clientId,
        protocolVersion: 5,
        reconnectPeriod: 1000,
        properties: {
            requestResponseInformation: true,
            requestProblemInformation: true,
        },
        will: {
            topic: "will/message",
            payload: "connection promise",
            qos: 0,
            retain: false,
        },
    });
};


module.exports.mqttStartEventLoop = (client) => {
    client.on("message", (topic, payload) => {
        if (events[topic]) {
          
          if (JSON.stringify(payload) == undefined) {
            return;
          }
          events[topic](payload);
        }
    });
};

module.exports.newTopicEvent = (topic, callback) => {
    events[topic] = callback;
};