// server/index.js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth",      require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));

app.get("/", (req, res) => res.send("Waste Assistant API running ✅"));

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));