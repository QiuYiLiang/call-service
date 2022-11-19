const express = require("express");
const http = require("http");
const WebSocket = require("ws");

class Service {
  Cls;
  insMap = new Map();
  constructor(Cls) {
    this.Cls = Cls;
  }
  get(id) {
    return this.insMap.get(id);
  }
  new(id, ...args) {
    const ins = new this.Cls(...args);
    this.insMap.set(id, ins);
    return ins;
  }
  del(id) {
    this.insMap.delete(id);
  }
}

const serviceMap = new Map();

const registerService = (serviceName, Service) => {
  serviceMap.set(serviceName, Service);
};

const registerCls = (serviceName, Cls) => {
  serviceMap.set(serviceName, new Service(Cls));
};

const destoryService = (serviceName) => {
  serviceMap.delete(serviceName);
};

const getService = (serviceName) => {
  return serviceMap.get(serviceName);
};

const callServiceName = async (serviceName, paths) => {
  try {
    return await paths.reduce(async (targetPromise, path) => {
      const target = await targetPromise;
      const a =
        typeof path !== "string"
          ? await target[path[0]](...path[1])
          : target[path];
      return a;
    }, getService(serviceName));
  } catch (e) {
    console.log(e);
    return null;
  }
};

const startServer = () => {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("连接成功！");
    ws.on("message", async (dataStr) => {
      debugger;
      const [requestId, serviceName, paths] = JSON.parse(dataStr);

      const msg = JSON.stringify([
        requestId,
        await callServiceName(serviceName, paths),
      ]);

      ws.send(msg);
    });
  });

  server.listen(3000, function listening() {
    console.log("服务器启动成功！");
  });
};

module.exports = {
  registerService,
  registerCls,
  destoryService,
  startServer,
};
