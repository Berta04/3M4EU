const mysql = require("mysql");

const queryPreset = {
  insertNewUser: "insert into JQd3DPKJdz.users (username, email, password, accountdate) values(?, ?, ?, current_timestamp());",
  checkExistingEmail: "select email from JQd3DPKJdz.users where email = ?;",
  checkEmailPsw: "select idusers, username from JQd3DPKJdz.users where email = ? and password = ?",
  updateSession: "update JQd3DPKJdz.users set token = ? where idusers = ?",
  checkSession: "select token from JQd3DPKJdz.users where token = ?",
};

module.exports.query = async (con, qr, params) => {
  let query = queryPreset[qr];
  let rows

  if (!query) {
    query = qr;
  }

  return new Promise((resolve, reject) => {
    con.query(query, params, (error, elements) => {
      if (error) {
        return reject(error);
      }
      return resolve(elements);
    });
  });
};

module.exports.connectToDB = async (host, db) => {
  let con = mysql.createConnection({
    host: host,
    user: process.env["dbusr"],
    password: process.env['dbpsw'],
    database: db,
    multipleStatements: true,
  });

  return con;
};