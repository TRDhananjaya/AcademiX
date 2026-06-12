function errorMiddleware(err, req, res, next) {
	console.error(err);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
	res.json({ message: err.message || "Server error" });
}

module.exports = { errorMiddleware };
