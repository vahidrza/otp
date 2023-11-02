/* ------------------------------------*/
//Defining variables
let attemptCounter = 3; // Count of attempt
let inputs = document.getElementsByTagName("input");
let form = document.getElementsByTagName("form")[0];
let textArea = document.getElementsByTagName("h1")[0];
let body = document.getElementsByTagName("body")[0];
let button = document.getElementsByTagName("button")[0];
let isEmptyCount = 5; //Count of empty inputs
let numbers = []; // Numbers Countainer

document.addEventListener("DOMContentLoaded", async (e) => {
  fetch("/getId", {
    method: "GET",
  })
    .then((res) => res.json())
    .then((res) => {
      document.getElementsByTagName("button")[0].id = `${res.id}`;
    })
    .catch((err) => console.log(err));
});

/* ------------------------------------*/

// Fulfilling Numbers Countainer array
for (let index = 0; index < 10; index++) {
  numbers[index] = index;
}

/* ------------------------------------*/

textArea.innerHTML = attemptCounter; //Writer of an attempt count to UI

/* ------------------------------------*/

//Inserting all inputs in a loop
for (let index = 0; index <= 4; index++) {
  //to adding Changing event
  inputs[index].addEventListener("input", (e) => {
    let isNumber = false;
    let target = e.target;
    let inputValue = e.target.value;
    e.target.value = inputValue.charAt(inputValue.length - 1);

    //Checking the entered value is number or not
    for (let value = 0; value < numbers.length; value++) {
      if (target.value == numbers[value]) {
        isNumber = true;
      }
    }

    //Resetting the input value if it is not a number
    if (!isNumber) {
      target.value = "";
    }

    //Steps for if it is a number
    else {
      //if it is the lastest input go to -> Submit , else next input
      index == 4
        ? form.lastElementChild.firstElementChild.focus()
        : target.nextElementSibling.focus();

      //Decrasing Empty Count when entered value is a number
      isEmptyCount--;

      //Setting the Submit button's visibility to open when all inputs is fulfilled
    }
    e.preventDefault();
  });
}

/* ------------------------------------*/

setInterval(() => {
  button.disabled = isEmptyCount <= 0 ? false : true;
}, 100);

/* ------------------------------------*/

//Adding event when submit button clicked
document.getElementsByTagName("button")[0].onclick = (e) => {
  let inputData = ""; //Container for inputs' values

  //Function for 3 unsuccessful attempts
  function noAttemptRemain() {
    fetch("/unsuccess", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: document.getElementsByTagName("button")[0].id,
        result: "notok",
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        document.forms[0].action = res.notificationUrl;
        inputs[5].value = res.cres;
        document.forms[0].submit();
      })
      .catch((err) => console.log(err));
  }

  //Getting full OTP numbers
  for (let index = 0; index < inputs.length; index++)
    inputData += inputs[index].value;

  if (inputData === "12345") {
    fetch("/final", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: document.getElementsByTagName("button")[0].id,
        result: "ok",
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        document.forms[0].action = res.notificationUrl;
        inputs[5].value = res.cres;
        document.forms[0].submit();
      })
      // .then((res) => console.log(res))
      .catch((err) => console.log(err));
  } else {
    attemptCounter--;
    textArea.innerHTML = attemptCounter;

    isEmptyCount = 5;
    if (attemptCounter === 0) {
      noAttemptRemain();
    }
  }

  button.disabled = true;
  isEmptyCount = 5;

  for (let index = 0; index < inputs.length; index++) inputs[index].value = "";

  e.preventDefault();
};
