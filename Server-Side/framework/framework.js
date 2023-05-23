const serverPath = "./components/server.js";
const databasePath = "./components/database.js";
const utilityPath = "./components/utility.js";
const mqttPath = "./components/mqtt.js";

const templates = __dirname + "/../../Client-Side/template";
const index = templates + "/index.html";

class framework {
    constructor(indexRoot,nameDB) {
        this.server = require(serverPath);
        this.database = require(databasePath);
        this.utility = require(utilityPath);
        this.mqtt = require(mqttPath);

        this.nameDB = nameDB;
        this.connectionDB = {};
        this.requests = {};

        this.indexRoot = indexRoot;
    };

    createServer = async (settings) => {
        this.app = await this.server.newApp([settings.staticRoot, settings.cookieMaxAge]);
        this.connectionDB = await this.database.connectToDB(settings.hostDB, settings.nameDB);

        await this.server.startApp(this.app, settings.port)

        this.newStatic({
            link: this.indexRoot,
            requireSession: false,
            file: index,
        });
    }

    newStatic = (settings) => {
        this.server.newStatic(
          this.app,
          settings.link,
          settings.redirectTo,
          settings.requireSession,
          settings.file,
        );
    };

    newRequest = (settings, callback) => {
        this.server.newRequest(this.app,settings,callback);
    }

    newWs = (settings, callback) => {
        this.server.newWs(this.app,settings[0],callback);
    }

    redirect = async (res, url, variable , message) => {
        await this.server.redirect(res, url, variable , message);
    };

    queryDB = async (qr, params) => {
        return await this.database.query(this.connectionDB, qr, params);
    };

    connectMqtt = async (ip) => {
        const newId = await this.utility.generateRandomKey();

        this.mqttClient = await this.mqtt.connectClient(ip, newId);
    };

    subscribeTopic = async (topic) => {
        this.mqttClient.subscribe(topic);
    };

    unsubscribeTopic = async (topic) => {
        this.mqttClient.unsubscribe(topic);
    };

    mqttPublish = async (topic, message) => {
        this.mqttClient.publish(topic, message);
    };

    newTopicEvent = async (topic, callback) => {
        this.mqtt.newTopicEvent(topic, callback);
    };

    mqttStartEventLoop = async () => {
        this.mqtt.mqttStartEventLoop(this.mqttClient);
    };
}

module.exports.framework = framework;