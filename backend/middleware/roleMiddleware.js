function roleMiddleware() {
	return (req, res, next) => next();
}

module.exports = { roleMiddleware };
