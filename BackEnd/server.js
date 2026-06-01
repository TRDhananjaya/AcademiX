const express = require("express");
const cors = require("cors");
const { loadEnv } = require("./config/dotenv");

loadEnv();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
	res.json({ status: "ok" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`AcademiX API running on port ${port}`);
});
