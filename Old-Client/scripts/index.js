let app = angular.module('app', ['ngWebSocket']);

let machineList = {
  1: "Italy",
  2: "Slovakia",
  3: "Portugal",
  4: "Ireland",
  5: "Germany",
  6: "Croatia"
};

let reverseMachineList = {
  Italy: 1,
  Slovakia: 2,
  Portugal: 3,
  Ireland: 4,
  Germany: 5,
  Croatia: 6,
};

app.factory("wb", ($websocket) => {
  const statusUpdater = () => {
    const stream = $websocket('wss://progettommm.kirito012.repl.co/statusUpdater');

    const startMMM = () => {
      let list = document.querySelectorAll(".nations");
      let message = {command: "start"};

      for (const nation in list) {
        message[nation.getAttribute('id')] = reverseMachineList[nation.innerHTML];
      };

      stream.send(JSON.stringify(message));
    };

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
      document.querySelector(".timer").innerHTML = currentMachine

      if (data.userTurn) {
        //do cool thingy
      }
    });
  }
  return statusUpdater;
});

app.controller('mainController', ($scope, $http, wb) => {
  $scope.state = "login";

  $scope.errorList = {
    wrongcredintials: "Wrong password try again.",
    emailnotfound: "email not found try again.",
    invaliddata: "fields are empty try again.",
    sessionmissing: "session is not present"
  };

  $scope.errorMessage = document.querySelector(".loginError");

  $scope.setState = (newState) => {
    let x = window.matchMedia("(max-width: 800px)");

    if (newState == "register" && newState != $scope.state) {
      $scope.state = newState;

      document.querySelector("#sign_up").style.display = "flex";
      document.querySelector("#log_in").style.display = "flex"

      document.querySelector(".login-form").style.display = "flex";
      document.querySelector(".logged-panel").style.display = "none";

      $scope.errorMessage.innerHTML = ""
      document.querySelector(".loginPane").style.display = "none"
      document.querySelector(".registerPane").style.display = "flex"
      document.querySelector("#sign_up").classList.remove("active-button");
      document.querySelector("#log_in").removeAttribute("disabled");
      document.querySelector("#log_in").classList.add("active-button");
      document.querySelector("#sign_up").setAttribute("disabled", true);
    }
    else if (newState == "login" && newState != $scope.state) {
      $scope.state = newState;

      document.querySelector("#sign_up").style.display = "flex";
      document.querySelector("#log_in").style.display = "flex"

      document.querySelector(".login-form").style.display = "flex";
      document.querySelector(".logged-panel").style.display = "none";

      $scope.errorMessage.innerHTML = ""
      document.querySelector(".loginPane").style.display = "flex"
      document.querySelector(".registerPane").style.display = "none"
      document.querySelector("#sign_up").classList.add("active-button");
      document.querySelector("#log_in").setAttribute("disabled", true);
      document.querySelector("#log_in").classList.remove("active-button");
      document.querySelector("#sign_up").removeAttribute("disabled");
    }
    else if (newState == "queue") {
      $scope.state = newState;

      document.querySelector(".login-form").style.display = "none";
      document.querySelector(".logged-panel").style.display = "flex";

      document.querySelector(".userTurn").style.display = "none";
      document.querySelector(".watcher").style.display = "flex";
      document.querySelector(".spacer").style.display = "flex";
    }
    else if (newState == "userTurn") {
      $scope.state = newState;

      document.querySelector(".login-form").style.display = "none";
      document.querySelector(".logged-panel").style.display = "flex";

      document.querySelector(".userTurn").style.display = "flex";
      document.querySelector(".watcher").style.display = "none";
      document.querySelector(".spacer").style.display = "none";
    }
    else if (newState == "mobileLogin") {
      if (!$scope.state == "userTurn") {
        $scope.setState("queue");
      }

      document.querySelector("#input").style.display = "flex";
      document.querySelector("#contweb").style.display = "none";
      if (!x.matches) {
        document.querySelector(".spacer").style.display = "none";
      }
    }
    else if (newState == "mobileHome") {
      document.querySelector("#input").style.display = "none";
      document.querySelector("#contweb").style.display = "flex";
    }
  };

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
        $scope.setState("queue");
        $scope.statusUpdate();
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
      $scope.errorMessage.innerHTML = $scope.errorList[error];
    }

    if (result) {
      if (result == "success") {
        $scope.setState("login");
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
      $scope.setState("login");
    }

    if (result) {
      if (result == "success") {
        $scope.setState("queue");
        $scope.statusUpdate();
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
      $scope.setState("login");
      $scope.errorMessage = $scope.errorList[error];
    }
  };

  $scope.statusUpdate = wb;

  $scope.stateCheck();
});