//server-side main script paired with a framework and different components
//Author: Andrea Bertarione (Italy)

const BertaFramework = require("./framework/framework.js"); //A personal framework coded by myself
const queueComponent = require("./queue");
const path = require("path");

const fw = new BertaFramework.framework("/");

const setup = async () => {
  let currentMachine = 0;
  let cycleNumber = 0;

  const newQueue = new queueComponent.queue();

  await fw.createServer({
    hostDB: "remotemysql.com",
    nameDB: "JQd3DPKJdz",
    staticRoot: path.resolve(__dirname + "/../Client-Side"),
    cookieMaxAge: 1000 * 60 * 60 * 24,
    port: 8081,
  });

  await fw.connectMqtt("mqtt://broker.mqttdashboard.com:1883");

  fw.newRequest(["post", "/login", false], async (res, req) => {
    let body = req.body;

    if (!body.email || !body.password) { res.send({ result: "error", error: "missinginputs" }); return; }

    let user = await fw.queryDB("checkEmailPsw", [body.email, body.password])
    if (await fw.utility.checkLength(user[0])) {
      let secret = await fw.utility.generateRandomKey();

      req.session.username = user[0].username;
      req.session.secret = secret;

      let results = await fw.queryDB("updateSession", [secret, user[0].idusers]);
      if (results) {
        if (results.affectedRows > 0) {
          res.send({
            result: "success",
            error: "",
          });
          return;
        }
      }
      res.send({
        result: "error",
        error: "unexpectederror",
      });
      return;
    }
    res.send({
      result: "error",
      error: "wrongcredintials",
    });
  });

  fw.newRequest(["post", "/register", false], async (res, req) => {
    let body = req.body;

    if (body.password != body.repeatPassword) { res.send({ result: "error", error: "differentpasswords" }); return; }
    if (body.password.length < 8 || body.password.length > 30) { res.send({ result: "error", error: "passwordcharactersoutofbound" }); return; }
    if (body.username.length > 30) { res.send({ result: "error", error: "nametoolong" }); return; }
    if (!fw.utility.checkEmail(body.email)) { res.send({ result: "error", error: "emailnotcorrect" }); return; }

    let email = await fw.queryDB("checkExistingEmail", [body.email]);
    if (email[0]) {
      if (email[0].email == body.email) { res.send({ result: "error", error: "emailalreadyexist" }); return; }
    }

    let result = await fw.queryDB("insertNewUser", [body.username, body.email, body.password]);
    if (result) {
      res.send({
        result: "success",
        error: "",
      });
    }
    else {
      res.send({
        result: "error",
        error: "unexpectederror",
      });
    }
  });

  fw.newRequest(["post", "/joinQueue", true, false], async (res, req) => {
    let body = req.body;

    let obj = { session: req.session.secret, username: req.session.username, disabled: false };
    let index = await newQueue.checkExistance(obj);
    if (!index) {
      newQueue.addItem(obj);
      res.send({
        result: "success",
        error: "",
      });
    }
    else {
      res.send({
        result: "error",
        error: "alreadyinqueue",
      });
    }

  });

  fw.newRequest(["get", "/getState", false], async (res, req) => {
    let secret = await fw.queryDB("checkSession", [req.session.secret]);
    if (secret[0]) {
      if (secret[0].token == req.session.secret && secret[0].token != null) {
        res.send({
          result: "success",
          error: "",
        });
        return;
      }
    }
    res.send({
      result: "error",
      error: "sessionfinished",
    });
  });
  fw.newWs(["/statusUpdater"], async (ws, req) => {
    let canStart = false;
    let commandSent = false;

    ws.send(JSON.stringify({ queue: newQueue.getLength(), currentMachine: currentMachine }));

    ws.on("message", (msg) => {
      let jsmsg = JSON.parse(msg);

      if (jsmsg.command == "start" && canStart) {
        canStart = false;
        commandSent = true;

        delete jsmsg.command;

        fw.mqttPublish("MMM", "s");
        setTimeout(function() {
          fw.mqttPublish("MMM", "6" + jsmsg[1] + jsmsg[2] + jsmsg[3] + jsmsg[4] + jsmsg[5] + jsmsg[6]);
        }, 2000);
      }
    });

    let loop = setInterval(function() {
      let session = req.session.secret;

      let pos = newQueue.getPosition(session);

      let jsonData = {
        queue: newQueue.getLength(),
        currentMachine: currentMachine,
        currentPosition: pos + 1,
      }

      if (pos == 0) {
        jsonData.userTurn = true;
        canStart = true

        if (!newQueue.list[pos].disabled) {
          newQueue.list[pos].disabled = true;
          let time = setTimeout(function() {
            if (commandSent) {
              clearTimeout(time);
            }
            else {
              newQueue.removeFirstItem();
            }
          }, 60000);
        }

        ws.send(JSON.stringify(jsonData));
      }
      else {
        ws.send(JSON.stringify(jsonData));
      }
    }, 3000);

    ws.on("close", () => {
      clearInterval(loop);
    })
  });

  fw.subscribeTopic("MMM");
  fw.newTopicEvent("MMM", async (payload) => {
    const message = payload.toString();

    const commands = {
      s: () => {
        currentMachine = 1;
        fw.mqttPublish("MMM", "0");
        console.log("start Magic")

        setTimeout(function() {
          fw.mqttPublish("MMM", "1");
          console.log("first red ball")
        }, 40000)
      },
      p: () => {
        currentMachine++;
        setTimeout(function() {
          fw.mqttPublish("MMM", "1");
        }, 3000);
      },
      e: () => {
        newQueue.removeFirstItem();
        currentMachine = 0;
      },
      7: () => {
        console.log("Machine N." + message);
      }
    }


    if (commands[message[0]]) {
      commands[message[0]]();
    }
  });

  fw.mqttStartEventLoop();

}

module.exports.setup = setup;