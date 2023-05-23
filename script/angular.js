let app = angular.module('app', ['ngWebSocket']);

let machineList = {
  "1": "Italy",
  "2": "Slovakia",
  "3": "Portugal",
  "4": "Ireland",
  "5": "Germany",
  "6": "Croatia"
};

let reverseMachineList = {
  Italy: "1",
  Slovakia: "2",
  Portugal: "3",
  Ireland: "4",
  Germany: "5",
  Croatia: "6",
};

let loginOpen = false;
let registerOpen = false;

const height = window.innerHeight;

let section = document.querySelector("#sectionOne");
let sectionTwo = document.querySelector("#sectionTwo");
window.onscroll = () => {
    const y = pageYOffset;

    if (y < height) {
        section.style.top = y*0.5 + "px";
    } else {
        sectionTwo.style.top = (height/2 + y*0.5) + "px";
    }

    if(y > 200) {
        document.querySelector(".register").classList.remove("active");
        document.querySelector(".login").classList.remove("active");
    } else {
        if(loginOpen) {
            document.querySelector(".login").classList.add("active");
        }
        if(registerOpen) {
            document.querySelector(".register").classList.add("active");
        }
    }

}


let login = () => {
    if(document.querySelector(".register").className == "register active") {
        registerOpen = false;
        document.querySelector(".register").classList.remove("active");
        setTimeout(() => {
            document.querySelector(".login").classList.add("active");
        }, 500)
    } else {
        document.querySelector(".login").classList.add("active");
    }
    loginOpen = true;
}

let logClose = () => {
    loginOpen = false;
    document.querySelector(".login").classList.remove("active");
}

let reg = () => {
    loginOpen = false;
    document.querySelector(".login").classList.remove("active");
    setTimeout(() => {
        document.querySelector(".register").classList.add("active");
        registerOpen = true;
    }, 500)
}

let regClose = () => {
    registerOpen = false;
    document.querySelector(".register").classList.remove("active");
}


let inputs = document.querySelectorAll(".input");
let texts = document.querySelectorAll(".text");

let textAnimation = (element) => {
    console.log(element.className)
    inputs[(element.className.slice(-1)) -1].focus();
}

texts.forEach((element) => {
    element.addEventListener("click", () => {
        textAnimation(element);
    })
})

let openJoin = () => {
    document.querySelector(".join").classList.add("active");
    setTimeout(() => {
        document.querySelector(".join .container").classList.add("active");
    })
}

let closeJoin = () => {
    document.querySelector(".join .container").classList.remove("active");
    setTimeout(() => {
        document.querySelector(".join").classList.remove("active");
    }, 200)
}

let doneJoin = () => {
    document.querySelector(".join .container").classList.remove("active");
    document.querySelector(".join .container").classList.add("done");
    setTimeout(() => {
        document.querySelector(".join").classList.remove("active");
        document.querySelector(".join .container").classList.remove("done");
    }, 200)
}



let countries = document.querySelectorAll(".c");

let count = 1;

let countryOrder = (element) => {
    let newClass = element.className.slice(9, 10);
    document.querySelector(".c" + newClass + " span").innerHTML = count;
    count++;
}

countries.forEach((element) => {
    element.addEventListener("click", () => {
        countryOrder(element)
    })
})

let resetJoin = () => {
    document.querySelectorAll(".s").forEach((element) => {
        element.innerHTML = "";
    })
    count = 1;
}

app.factory("wb", ($websocket) => {
  const websocket = {
    stream: undefined,
  
    statusUpdater: () => {
    this.stream = $websocket('wss://progettommm.kirito012.repl.co/statusUpdater');
  
      stream.onMessage((msg) => {
        let data = JSON.parse(msg.data);
  
        let queue = data.queue;
        let currentMachine = data.currentMachine;
        let currentPosition = data.currentPosition;
  
        if (currentPosition) {
          document.querySelector(".queue").innerHTML = currentPosition;
        }
        else {
          document.querySelector(".queue").innerHTML = queue;
        }
        document.querySelector(".turn").innerHTML = currentMachine
  
        if (data.userTurn) {
          document.querySelector(".subcontainer1").classList.add("active")
          document.querySelector(".subcontainer2").classList.remove("active")
        }
        else{
          document.querySelector(".subcontainer2").classList.add("active")
          document.querySelector(".subcontainer1").classList.remove("active")
        }
      });
    },
    startMMM: () => {
      let message = {command: "start"};
      for (const id in machineList) {
        let order = document.querySelector(".c" + id + " .s").innerHTML;
        
        message[order] = id;
      }

      if (this.stream != undefined) {
         this.stream.send(JSON.stringify(message)); 
      }
    },
  }
  return websocket;
});

app.controller('mainController', ($scope, $http, wb) => {
  $scope.errorList = {
    wrongcredintials: "Wrong password try again.",
    emailnotfound: "email not found try again.",
    invaliddata: "fields are empty try again.",
    sessionmissing: "session is not present"
  };

  $scope.errorMessage = document.querySelector(".loginError");
  $scope.rErrorMessage = document.querySelector(".registerError")

  $scope.login = async () => {
    let email = document.querySelector(".loginEmail").value;
    let password = document.querySelector(".loginPassword").value;

    let response = await $http({
      method: 'POST',
      url: '/login',
      data: JSON.stringify({
        email: email,
        password: password
      }),
    });

    let result = response.data.result;
    let error = response.data.error;

    if (error) {
      $scope.errorMessage.innerHTML = $scope.errorList[error];
    }

    if (result) {
      if (result == "success") {
        document.querySelector(".joinQueue").classList.add("active")
        document.querySelector(".log").classList.remove("active")
        logClose();
        $scope.wb.statusUpdater();
      }
    }
  };

  $scope.register = async () => {
    let username = document.querySelector(".registerUser").value;
    let email = document.querySelector(".registerEmail").value;
    let password = document.querySelector(".registerPassword").value;
    let repeatPassword = document.querySelector(".registerRepeatPassword").value;

    let response = await $http({
      method: 'POST',
      url: '/register',
      data: JSON.stringify({
        username: username,
        email: email,
        password: password,
        repeatPassword: repeatPassword,
      }),
    });

    let result = response.data.result;
    let error = response.data.error;

    if (error) {
      $scope.rErrorMessage.innerHTML = $scope.errorList[error];
    }

    if (result) {
      if (result == "success") {
       login()
      }
    }
  };

  $scope.stateCheck = async () => {
    let response = await $http({
      method: 'GET',
      url: '/getState',
    });

    let result = response.data.result;
    let error = response.data.error;

    if (error) {
      document.querySelector(".joinQueue").classList.remove("active")
    }

    if (result) {
      if (result == "success") {
        document.querySelector(".joinQueue").classList.add("active")
        document.querySelector(".log").classList.remove("active")
        $scope.wb.statusUpdater();
      }
    }
  };

  $scope.joinQueue = async () => {
    let response = await $http({
      method: 'POST',
      url: '/joinQueue',
      data: JSON.stringify({}),
    });

    let result = response.data.result;
    let error = response.data.error;

    if (error == "sessionmissing") {
      $scope.errorMessage = $scope.errorList[error];
    }
  };

  $scope.wb = wb;

  $scope.startMMM = wb.startMMM;

  $scope.stateCheck();
});