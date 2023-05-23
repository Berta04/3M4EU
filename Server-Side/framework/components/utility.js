const crypto = require('crypto');
const validator = require("email-validator");
const path = require("path");

module.exports.generateRandomKey = async () => {
    return crypto.randomBytes(48).toString('hex');
}

module.exports.dayCheck = async (day) => {
    let today = new Date;
    today.setHours(23,59,59,998);
    
    let newDay = new Date(day);
    newDay.setHours(23,59,59,998);
  
    if (today < newDay){
        return false;
    }
    else if (today.getFullYear() - 16 > newDay.getFullYear()){
        return true;
    }
    else {
        return false;
    }
}

module.exports.checkEmail = async (Email) => {
    if (Email) {
        return await validator.validate(Email);
    }
    else{
        return false;
    }
}

module.exports.checkLength = async (obj) => {
    if (obj) {
        let length = Object.keys(obj).length || obj.length
        if (length > 0){
            return length;
        }
        else{
            return null;
        }
    }
};

module.exports.forEach = forEach = (obj,callback,lastindexcallback) => {
    let index = 0;
  
    if (typeof obj == "object"){
      let keys = Object.keys(obj);
  
      for (let key in obj) {
        index++;
        callback(obj[key],key,index);
  
        if (key == keys[keys.length - 1] && lastindexcallback != undefined){
          lastindexcallback();
        }
      }
    }
    else if (Array.isArray(obj)){
      for (let i = 0; i < obj.length;i++){
        callback(obj[i],i,i);
  
        if (i == obj.length -1 && lastindexcallback != undefined) {
          lastindexcallback();
        }
      }
    }
    else {
      throw console.error("you can't loop over a " + typeof obj);
    }
}

module.exports.formatDate = async (date) => {
    return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
}

module.exports.formatTime = async (time) => {
    return time.getFullYear() + "-" + ("0" + (time.getMonth() + 1)).slice(-2) + "-" + ("0" + time.getDate()).slice(-2) + "T" + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + "." + time.getMilliseconds() + "Z";
}

module.exports.formatCleanTime = async (time) => {
    return time.getFullYear() + "-" + ("0" + (time.getMonth() + 1)).slice(-2) + "-" + ("0" + time.getDate()).slice(-2) + " " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
  }