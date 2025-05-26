// Script to retrieve CLABE details from Juno Stage
const axios = require("axios");
const crypto = require("crypto");

const JUNO_STAGE_API_KEY = process.env.JUNO_STAGE_API_KEY || "jZTixUvZJM";
const JUNO_STAGE_API_SECRET = process.env.JUNO_STAGE_API_SECRET || "<TU_API_SECRET_AQUI>";

// Replace with the CLABE you want to look up (user id 3):
const clabe = "710969000000351106";

const url = `https://stage.buildwithjuno.com/spei/v1/clabes/${clabe}`;
const requestPath = `/spei/v1/clabes/${clabe}`;
const method = "GET";
const nonce = (Date.now()).toString();
const body = ""; // GET requests have empty payload

const dataToSign = nonce + method + requestPath + body;
const signature = crypto.createHmac("sha256", JUNO_STAGE_API_SECRET).update(dataToSign).digest("hex");

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bitso ${JUNO_STAGE_API_KEY}:${nonce}:${signature}`
};

console.log("--- JUNO CLABE LOOKUP DEBUG ---");
console.log("String to sign:", dataToSign);
console.log("Signature:", signature);
console.log("Headers:", headers);
console.log("GET URL:", url);
console.log("------------------------------");

axios.get(url, { headers })
  .then(resp => {
    console.log("CLABE details response:", resp.data);
  })
  .catch(err => {
    if (err.response) {
      console.error("CLABE details error:", err.response.data);
    } else {
      console.error("CLABE details error:", err.message);
    }
  });
