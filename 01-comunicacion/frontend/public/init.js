const PATH_API_CONFIG = "/api/config";

const message01 = document.getElementById("message01");
const message02 = document.getElementById("message02");

const callBackend = (response) => {
  fetch(response.pathBackend1)
    .then((response) => response.json())
    .then((data) => {
      message01.innerHTML = data.message01;
      message02.innerHTML = data.message02;
    });
};

fetch(PATH_API_CONFIG)
  .then((response) => response.json())
  .then(callBackend);
