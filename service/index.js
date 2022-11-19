const { A } = require("./A");
const { registerCls, startServer } = require("./service");

registerCls("A", A);

startServer();
