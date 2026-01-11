const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

/* =====================
   CONFIG
===================== */
const PORT = 3000;

// RumahOTP
const OTP_APIKEY = "otp_lBzWnujFYvccptTY";

// Pterodactyl
const PANEL_URL = "https://cloudyshinee.woila.biz.id";
const PLTA_KEY = "ptla_DhHujCiWqRKtYfKIFphzrgYCCziqa3twXqhyLjfSV0H";

// Node / Egg ID (WAJIB SESUAI PANEL KAMU)
const NODE_ID = 1;
const EGG_ID = 5;
const LOCATION_ID = 15;

/* =====================
   CREATE DEPOSIT
===================== */
app.post("/api/deposit", async (req, res) => {
  const { amount } = req.body;

  const depo = await axios.get(
    `https://www.rumahotp.com/api/v2/deposit/create?amount=${amount}&payment_id=qris`,
    { headers: { "x-apikey": OTP_APIKEY } }
  );

  res.json(depo.data);
});

/* =====================
   CHECK STATUS
===================== */
app.get("/api/deposit/status/:id", async (req, res) => {
  const depo = await axios.get(
    `https://www.rumahotp.com/api/v2/deposit/get_status?deposit_id=${req.params.id}`,
    { headers: { "x-apikey": OTP_APIKEY } }
  );
  res.json(depo.data);
});

/* =====================
   CANCEL DEPOSIT
===================== */
app.get("/api/deposit/cancel/:id", async (req, res) => {
  const depo = await axios.get(
    `https://www.rumahotp.com/api/v1/deposit/cancel?deposit_id=${req.params.id}`,
    { headers: { "x-apikey": OTP_APIKEY } }
  );
  res.json(depo.data);
});

/* =====================
   CREATE USER & SERVER
===================== */
app.post("/api/create-server", async (req, res) => {
  const { username, email, password, ram } = req.body;

  // 1ï¸âƒ£ CREATE USER
  const user = await axios.post(
    `${PANEL_URL}/api/application/users`,
    {
      username,
      email,
      first_name: username,
      last_name: "User",
      password
    },
    {
      headers: {
        Authorization: `Bearer ${PLTA_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const userId = user.data.attributes.id;

  // 2ï¸âƒ£ CREATE SERVER
  const server = await axios.post(
    `${PANEL_URL}/api/application/servers`,
    {
      name: `Server-${username}`,
      user: userId,
      egg: EGG_ID,
      docker_image: "ghcr.io/pterodactyl/yolks:nodejs_18",
      startup: "npm start",
      environment: {
        NODE_ENV: "production"
      },
      limits: {
        memory: ram === "unli" ? 0 : ram * 1024,
        swap: 0,
        disk: 10000,
        io: 500,
        cpu: 0
      },
      feature_limits: {
        databases: 1,
        backups: 1
      },
      allocation: {
        default: 1
      }
    },
    {
      headers: {
        Authorization: `Bearer ${PLTA_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  res.json({
    success: true,
    panel_login: `${PANEL_URL}/auth/login`,
    user: {
      email,
      password
    },
    server: {
      name: server.data.attributes.name,
      uuid: server.data.attributes.uuid
    }
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
