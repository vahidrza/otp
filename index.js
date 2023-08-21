const express = require("express");
const bodyParser = require("body-parser");

/**********************************/

const app = express();
const port = 3000;

/**********************************/

let dataBase = [];

/**********************************/

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/**********************************/

app.post("/", async (req, res) => {
  let receivedData = req.body.creq;
  /**********************************/
  try {
    let decodedBuffer = Buffer.from(receivedData, "base64").toString();
    decodedBuffer = JSON.parse(decodedBuffer);
    dataBase[dataBase.length] = {
      id: dataBase.length,
      creq: receivedData,
      decodedCreq: decodedBuffer,
    };

    /**********************************/

    console.log("/ : Alınan veri:", receivedData);
    console.log(dataBase);
    if (
      decodedBuffer.messageType == undefined ||
      decodedBuffer.threeDSServerTransID == undefined ||
      decodedBuffer.acsTransID == undefined ||
      decodedBuffer.messageVersion == undefined ||
      decodedBuffer.challengeWindowSize == undefined
    ) {
      res.sendFile(__dirname + "/public/error.html");
    } else {
      res.sendFile(__dirname + "/public/webpage.html");
    }
    /**********************************/
  } catch (error) {
    console.error("Veriyi çözme veya ayrıştırma hatası:", error.message);
    res.sendFile(__dirname + "/public/error.html");
  }
});




/***********************************/




app.get("/getId", (req, res) => {
  res.send(dataBase[dataBase.length - 1]);
});



/**********************************/




app.post("/final", async (req, res) => {
  
  let thisItemCReq = dataBase[req.body.id].decodedCreq;

  dataBase[req.body.id].result = "ok";
  dataBase[req.body.id].cres = {
    threeDSServerTransID:
    thisItemCReq.threeDSServerTransID,
    messageType: "CRes",
    messageVersion: thisItemCReq.messageVersion,
    acsTransID: thisItemCReq.acsTransID,
    transStatus: "Y",
  };
  dataBase[req.body.id].encodedCRes = Buffer.from(
    JSON.stringify(dataBase[req.body.id].cres)
  ).toString("base64");

  console.log(dataBase);

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

  /**********************************/

  res.send("got it");
});




/**********************************/




app.listen(port, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${port}`);
});
