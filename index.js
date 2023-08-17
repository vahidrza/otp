const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

let finalData = {
  threeDSServerTransID: "",
  success: undefined,
};

function getFinalData() {
  return finalData;
}

function updateFinalData(parameter, value) {
  finalData[parameter] = value;
}






app.use(express.static("public"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));







app.post("/", async (req, res) => {
  const receivedData = req.body;
  console.log("/ : Alınan veri:", receivedData.creq);

  try {
    await fetch("/final", {
      method: "POST",
      body: JSON.stringify(receivedData),
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("/" + error);
  }

  res.sendFile(__dirname + "/public/index.html");
});










app.post("/final", async (req, res) => {
  if (req.body.result === undefined) {
    updateFinalData("creq", req.body.creq);
  } else {
    updateFinalData("result", req.body.result);
    console.log("success at backend");
    await fetch("http://10.10.40.33:8080/directory-server/check/otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      threeDSServerTransID: "0ae5e8d0-253b-427f-aaa1-f622d0ac2814",
      success: "true",
    }),
  })
    .then((res) => res.text())
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
  }

  

  console.log("/final: " + JSON.stringify(getFinalData()));
  res.send("got it");
});









app.listen(port, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${port}`);
});