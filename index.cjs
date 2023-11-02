//Imporint packeges
const express = require("express");
const bodyParser = require("body-parser");
const winston = require("winston");
const path = require("path");
const fetch = require("node-fetch-commonjs");

/**********************************/

//Creating Express APP to our Application
const app = express();
const port = 3000;

/**********************************/

//Creating new Log folder and file to Application
const logsFolder = (__dirname, "./logs/");
const databaseFolder = (__dirname, "./database/");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: path.join(
        logsFolder,
        `${new Date().toISOString().replace(/:/g, "-")}.log`
      ),
    }),
  ],
});

//Creating folder and file for creating & updating data (creq,cres and etc.)
const databaseDirectory = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: path.join(
        databaseFolder,
        `${new Date().toISOString().replace(/:/g, "-")}.log`
      ),
    }),
  ],
});

/**********************************/

//It is our DB, All data will be added to this matris
let dataBase = [];

/**********************************/

//APP extensions
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/**********************************/

//It is an endpoint which will recieve a POST request and it will be work when HTML Form submitted
app.post("/", async (req, res) => {
  logger.info(
    "---------------------------------------------------------------------------------------------------"
  );
  logger.info(new Date() + "------" + "Recieved a POST '/' request");
  logger.info(
    new Date() + "------" + "Full Request body : " + JSON.stringify(req.body)
  );

  //Defining a variable to catch and use the request body
  let receivedData;

  if (req.body.creq === undefined){
     receivedData = req.body.CReq;	
  }

  else receivedData = req.body.creq;
  
   logger.info(
    new Date() +
      "------" +
      "Recieved Encoded CReq : " +
      JSON.stringify(receivedData)
  );

  /**********************************/

  try {
    //Decoding the CReq
    let decodedBuffer = Buffer.from(receivedData, "base64").toString();
    logger.info(
      new Date() +
        "------" +
        "Recieved Encoded CReq decoded to String : " +
        JSON.stringify(decodedBuffer)
    );

    //Parsing the CReq
    decodedBuffer = JSON.parse(decodedBuffer);
    logger.info(
      new Date() +
        "------" +
        "Recieved Encoded CReq String Parsed and converted to JSON : " +
        JSON.stringify(decodedBuffer)
    );

    //Adding new data to DB
    dataBase[dataBase.length] = {
      id: dataBase.length,
      creq: receivedData,
      decodedCreq: decodedBuffer,
    };

    logger.info(
      new Date() +
        "------" +
        "New item added to DB : " +
        JSON.stringify(dataBase[dataBase.length - 1])
    );

    /**********************************/

    //Checking the decoded CReq fields
    if (
      decodedBuffer.messageType == undefined ||
      decodedBuffer.threeDSServerTransID == undefined ||
      decodedBuffer.acsTransID == undefined ||
      decodedBuffer.messageVersion == undefined ||
      decodedBuffer.challengeWindowSize == undefined
    ) {
      //If CReq is in the true format, costumer redirected to ACS Page
      logger.error(
        new Date() +
          "------" +
          "Entered CReq is not valid, costumer Redirected to Error Page"
      );
      res.sendFile(__dirname + "/public/error.html");
    } else {
      //Else costumer redirected to Error page
      logger.info(
        new Date() +
          "------" +
          "Entered CReq is valid, Costumer Redirected to ACS Page"
      );
      res.sendFile(__dirname + "/public/webpage.html");
    }
    /**********************************/
  } catch (error) {
    //If there is an error to Parsing data , costumer goes to Error page
    logger.error(
      new Date() +
        "------" +
        "Error occured while parsing the CReq, costumer Redirected to Error Page. Error Message : " +
        JSON.stringify(error.message)
    );
    res.sendFile(__dirname + "/public/error.html");
  }

  logger.info(
    "---------------------------------------------------------------------------------------------------"
  );
  logger.info("");
  logger.info("");
  logger.info("");
  databaseDirectory.info(
    "database after update '/' : " + JSON.stringify(dataBase)
  );
});

/***********************************/

//GET Endpoint to return the last ID of a matris
app.get("/getId", (req, res) => {
  res.send(dataBase[dataBase.length - 1]);
  logger.info(
    "---------------------------------------------------------------------------------------------------"
  );
  logger.info(new Date() + "------" + "Recieved a GET request");
  logger.info(
    new Date() +
      "------" +
      "Response to GET request : " +
      JSON.stringify(dataBase[dataBase.length - 1])
  );
  logger.info(
    "---------------------------------------------------------------------------------------------------"
  );
  logger.info("");
  logger.info("");
  logger.info("");
});

/**********************************/

//POST Endpoint to Successful Authentication
app.post("/final", async (req, res) => {
  logger.info(
    "---------------------------------------------------------------------------------------------------"
  );
  logger.info(new Date() + "------" + "Recieved a POST '/final' request");

  //Defining a variable to put CReq into this
  let thisItemCReq = dataBase[req.body.id].decodedCreq;
  logger.info(
    new Date() +
      "------" +
      "Defining this ID's CReq to a variable for Generating CRes"
  );

  //Updating the DB
  dataBase[req.body.id].result = "ok";

  //Generating a Successful CRes
  dataBase[req.body.id].cres = {
    threeDSServerTransID: thisItemCReq.threeDSServerTransID,
    messageType: "CRes",
    messageVersion: thisItemCReq.messageVersion,
    acsTransID: thisItemCReq.acsTransID,
    transStatus: "Y",
  };
  dataBase[req.body.id].encodedCRes = Buffer.from(
    JSON.stringify(dataBase[req.body.id].cres)
  ).toString("base64");

  logger.info(
    new Date() +
      "------" +
      "New CRes generated : " +
      JSON.stringify(dataBase[req.body.id].cres)
  );

  //Sending request to Backend for getting NotificationUrl 
  await fetch("http://10.10.40.33:8080/directory-server/check/otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      threeDSServerTransID: thisItemCReq.threeDSServerTransID,
      success: "true",
    }),
  })
    .then((res) => res.json())
    .then((restext) => {
      res.send({
        notificationUrl: restext.notificationUrl,
        cres: dataBase[req.body.id].encodedCRes,
      });
      logger.info(
        new Date() +
          "------" +
          "Request has been sent to Backend, Result : Successful"
      );
      logger.info(
        new Date() +
          "------" +
          "Successful Response converted to text : " +
          JSON.stringify(restext)
      );
      logger.info(
        new Date() +
          "------" +
          "Response has been sent to Frontend : " +
          `{"notificationUrl":${restext.notificationUrl},"cres":${
            dataBase[req.body.id].encodedCRes
          }}`
      );
    })
    .catch((err) => {
      logger.error(
        new Date() +
          "------" +
          "Request couldn't sent to Backend, Result : Unsuccessful"
      );
      logger.error(
        new Date() +
          "------" +
          "Unsuccessful Response converted to text : " +
          JSON.stringify(err)
      );
    });

  /**********************************/

  logger.info(
    "---------------------------------------------------------------------------------------------------"
  );
  logger.info("");
  logger.info("");
  logger.info("");

  databaseDirectory.info(
    "database after update '/final' : " + JSON.stringify(dataBase)
  );
});

/**********************************/

//POST Endpoint to Unsuccessful Authentication
app.post("/unsuccess", async (req, res) => {
  logger.info(
    "---------------------------------------------------------------------------------------------------"
  );
  logger.info(new Date() + "------" + "Recieved a POST '/unsuccess' request");

  //Defining a variable to put CReq into this
  let thisItemCReq = dataBase[req.body.id].decodedCreq;
  logger.info(
    new Date() +
      "------" +
      "Defining this ID's CReq to a variable for Generating CRes"
  );

  //Updating the DB
  dataBase[req.body.id].result = "notok";

  //Generating an Unsuccessful CRes
  dataBase[req.body.id].cres = {
    threeDSServerTransID: thisItemCReq.threeDSServerTransID,
    messageType: "CRes",
    messageVersion: thisItemCReq.messageVersion,
    acsTransID: thisItemCReq.acsTransID,
    transStatus: "N",
  };
  dataBase[req.body.id].encodedCRes = Buffer.from(
    JSON.stringify(dataBase[req.body.id].cres)
  ).toString("base64");

  logger.info(
    new Date() +
      "------" +
      "New CRes generated : " +
      JSON.stringify(dataBase[req.body.id].cres)
  );

  //Sending request to Backend for getting NotificationUrl 
  await fetch("http://10.10.40.33:8080/directory-server/check/otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      threeDSServerTransID: thisItemCReq.threeDSServerTransID,
      success: "false",
    }),
  })
    .then((res) => res.json())
    .then((restext) => {
      logger.info(
        new Date() +
          "------" +
          "Request has been sent to Backend, Result : Successful"
      );
      logger.info(
        new Date() +
          "------" +
          "Successful Response converted to text : " +
          JSON.stringify(restext)
      );
      res.send({
        notificationUrl: restext.notificationUrl,
        cres: dataBase[req.body.id].encodedCRes,
      });
      logger.info(
        new Date() +
          "------" +
          "Response has been sent to Frontend : " +
          `{"notificationUrl":${restext.notificationUrl},"cres":${
            dataBase[req.body.id].encodedCRes
          }}`
      );
    })
    .catch((err) => {
      logger.error(
        new Date() +
          "------" +
          "Request couldn't sent to Backend, Result : Unsuccessful"
      );
      logger.error(
        new Date() +
          "------" +
          "Unsuccessful Response converted to text : " +
          JSON.stringify(err)
      );
    });

  /**********************************/

  logger.info(
    "---------------------------------------------------------------------------------------------------"
  );
  logger.info("");
  logger.info("");
  logger.info("");
  databaseDirectory.info(
    "database after update '/unsuccess' : " + JSON.stringify(dataBase)
  );
});

/**********************************/

app.listen(port, () => {
  console.log(`Server is running at ${port}:th port 🚀🚀🚀.`);
  logger.info(
    "---------------------------------------------------------------------------------------------------"
  );
  logger.info(new Date() + `Server is running at ${port}:th port 🚀🚀🚀.`);
  logger.info(
    "---------------------------------------------------------------------------------------------------"
  );
  logger.info("");
  logger.info("");
  logger.info("");
});
