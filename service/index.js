const { A } = require("./A");
const { B } = require("./B");
const { registerCls, startServer } = require("./service");

registerCls("A", A);
registerCls("B", B);

startServer();
