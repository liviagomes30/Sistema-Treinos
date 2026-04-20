const { RateLimiterMemory } = require("rate-limiter-flexible");

const rateLimiter = new RateLimiterMemory({
  points: 10, // 10 requisições
  duration: 60, // por 60 segundos por IP
});

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({ message: "Muitas requisições. Tente novamente mais tarde." });
    });
};

module.exports = rateLimiterMiddleware;
