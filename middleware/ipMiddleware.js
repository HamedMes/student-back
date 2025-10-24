const getClientIp = (req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress ||
    req.ip;

  req.clientIp = ip === "::1" ? "127.0.0.1" : ip;

  next();
};

module.exports = getClientIp;
