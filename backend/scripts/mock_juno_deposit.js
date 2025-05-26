// Script para simular un depósito SPEI en Juno Stage
defaults = {
  amount: "2000",
  receiver_clabe: "710969000000351106", // CLABE de usuario id 3
  receiver_name: "Test Seller", // Nombre de usuario id 3
  sender_name: "Rodrigo Jimenez",   // Nombre de usuario id 2
  sender_clabe: "710969000000351083" // CLABE de usuario id 2
};

const axios = require("axios");
const crypto = require("crypto");

// Debes poner tu API KEY y SECRET aquí o usar variables de entorno
const JUNO_STAGE_API_KEY = process.env.JUNO_STAGE_API_KEY || "jZTixUvZJM";
const JUNO_STAGE_API_SECRET = process.env.JUNO_STAGE_API_SECRET || "<TU_API_SECRET_AQUI>";

const url = "https://stage.buildwithjuno.com/spei/test/deposits";
const requestPath = "/spei/test/deposits";
const method = "POST";
const nonce = (Date.now()).toString();
// El body debe ser JSON compacto, sin espacios extra
const body = JSON.stringify(defaults);

// El requestPath debe ser exactamente '/spei/test/deposits', sin barra final
const dataToSign = nonce + method + requestPath + body;
const signature = crypto.createHmac("sha256", JUNO_STAGE_API_SECRET).update(dataToSign).digest("hex");

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bitso ${JUNO_STAGE_API_KEY}:${nonce}:${signature}`
};

console.log("--- JUNO MOCK DEPOSIT DEBUG ---");
console.log("String to sign:", dataToSign);
console.log("Signature:", signature);
console.log("Headers:", headers);
console.log("Request body:", body);
console.log("------------------------------");

axios.post(url, defaults, { headers })
  .then(resp => {
    console.log("Mock deposit response:", resp.data);
  })
  .catch(err => {
    if (err.response) {
      console.error("Mock deposit error:", err.response.data);
    } else {
      console.error("Mock deposit error:", err.message);
    }
  });
