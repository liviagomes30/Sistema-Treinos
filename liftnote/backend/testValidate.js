const validateRequest = require("./src/middlewares/validateRequest");
const schemas = require("./src/validators/authSchemas");
const req = { body: {}, query: {}, params: {} };
const res = { status: (c) => ({ json: (d) => console.log(c, d) }) };
const next = (e) => console.log("Next called with:", e ? e.name : "no error");

const middleware = validateRequest(schemas.registerSchema);
middleware(req, res, next);
