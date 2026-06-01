const path = require("path");
const dotenv = require("dotenv");

function loadEnv() {
	dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

module.exports = { loadEnv };
