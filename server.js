var express = require("express");
var http = require("http");
var WebSocket = require("ws");
var app = express();
var server = http.createServer(app);
var wss = new WebSocket.Server({ server });

class A {
  id;
  data = [];
  constructor(id) {
    this.id = id;
  }
  add(a, b) {
    const sum = a + b;
    this.data.push(sum);
    return sum;
  }
}

class AService {
  static aMap = new Map();
  static get(id) {
    return this.aMap.get(id);
  }
  static new(id) {
    const a = new A(id);
    this.aMap.set(id, a);
    return a;
  }
  static del(id) {
    this.aMap.delete(id);
  }
}

const serviceMap = new Map();

serviceMap.set("AService", AService);

const callServiceName = (serviceName, paths) => {
  try {
    return paths.reduce((target, path) => {
      const a =
        typeof path !== "string" ? target[path[0]](...path[1]) : target[path];
      return a;
    }, serviceMap.get(serviceName));
  } catch (e) {
    console.log(e);
    return null;
  }
};

wss.on("connection", (ws) => {
  console.log("连接成功！");
  ws.on("message", (dataStr) => {
    const [requestId, serviceName, paths] = JSON.parse(dataStr);
    // console.log(requestId, serviceName, paths);
    wss.clients.forEach((client) => {
      client.send(
        JSON.stringify([requestId, callServiceName(serviceName, paths)])
      );
    });
  });
});

server.listen(3000, function listening() {
  console.log("服务器启动成功！");
});
