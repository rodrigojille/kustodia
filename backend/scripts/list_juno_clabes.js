// Script para listar las CLABEs asociadas a tu cuenta Juno Stage usando firma HMAC
require('dotenv').config();
const axios = require("axios");
const crypto = require("crypto");

const JUNO_STAGE_API_KEY = process.env.JUNO_STAGE_API_KEY;
const JUNO_STAGE_API_SECRET = process.env.JUNO_STAGE_API_SECRET;

const url = "https://stage.buildwithjuno.com/spei/v1/clabes";
const requestPath = "/spei/v1/clabes";
const method = "GET";
const nonce = Date.now().toString();
const body = ""; // GET no lleva body

const dataToSign = nonce + method + requestPath + body;
const signature = crypto.createHmac("sha256", JUNO_STAGE_API_SECRET).update(dataToSign).digest("hex");

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bitso ${JUNO_STAGE_API_KEY}:${nonce}:${signature}`
};

console.log("--- JUNO LIST CLABES DEBUG ---");
console.log("String to sign:", dataToSign);
console.log("Signature:", signature);
console.log("Headers:", headers);
console.log("------------------------------");

axios.get(url, { headers })
  .then(resp => {
    console.log("CLABEs response:", JSON.stringify(resp.data, null, 2));
  })
  .catch(err => {
    if (err.response) {
      console.error("CLABEs error:", err.response.data);
    } else {
      console.error("CLABEs error:", err.message);
    }
  });
