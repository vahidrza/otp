const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

let finalData = {
    creq: "",
    result: "",
  };

function updateFinalData(parameter,value) {
    finalData[parameter] = value;
}

function getFinalData(){
return finalData;
}

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/", async (req, res) => {
  const receivedData = req.body;
  console.log("/ : Alınan veri:", receivedData);

  try {
    await fetch("http:localhost:3000/final", {
      method: "POST",
      body: JSON.stringify(receivedData),
      headers: { "Content-Type": "application/json" },
    });

    // const responseData = await express.response.json();
  } catch (error) {
    console.log("/" + error);
  }

  res.sendFile(__dirname + "/public/index.html");
});

app.post("/final", async (req, res) => {
  if (req.body.result === undefined) {
    updateFinalData('creq',req.body.creq);
    // next();
  } else {
    updateFinalData('result',req.body.result)
    // next();
  }

  console.log("/final: " + JSON.stringify(getFinalData()));
  res.send("got it");
});

app.listen(port, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${port}`);
});