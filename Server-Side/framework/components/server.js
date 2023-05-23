const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const websockets = require('express-ws')
const cors = require("cors");
const fs = require("fs");
const path = require("path");

module.exports.newApp = async (settings) => {
    let app = express();
    let jsonParser = bodyParser.json();
    let urlencodedParser = bodyParser.urlencoded({ extended: false });
  
    app.use(jsonParser);
    app.use(urlencodedParser);
    app.use(cors());

    app.use(express.static(settings[0]));

    app.use(
        session({
          secret: "secret",
          resave: true,
          saveUninitialized: true,
          cookie: {maxAge: settings[1]},
        })
    );
    
    websockets(app);

    return app
};

module.exports.startApp = async (app,port) => {
    await app.listen(port);
    console.log(`Web app listening on port ${port}`);
}

module.exports.newRequest = (app,settings,callback) => {
    app[settings[0]](settings[1], async (req,res) => {
        let result = await module.exports.sessionCheck(res,req);
        if (settings[2]){
            if (!result) {
                res.send({
                    result: "error",
                    error: "sessionmissing",
                });
                return;
            }
        }
        callback(res,req);
    });
}

module.exports.newStatic = (app,link,redirectTo,requireSession,file) => {
	module.exports.newRequest(app,["get",link,requireSession,redirectTo], (res,req) => {
		res.sendFile(path.resolve(file));
    });
}

module.exports.newWs = (app, route, callback) => {
	app.ws(route, (ws, req) => {
      callback(ws,req);
  })
}

module.exports.redirect = async (res, url, variable , content) => {
	if (variable && content) {
		res.redirect(url + "?" + variable + "=" + content);
	} else {
		res.redirect(url);
	}
};

module.exports.sessionCheck = async (res, req) => {
    if (req.session) {
        if (!req.session.secret) {
            return false;
        }
        return true;
    }
    return true;
};
