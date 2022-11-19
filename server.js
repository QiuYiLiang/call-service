var express = require("express");
var http = require("http");
var WebSocket = require("ws");
var app = express();
var server = http.createServer(app);
var wss = new WebSocket.Server({ server });

const aaa = {
  e: {
    sum(a, b) {
      return a + b;
    },
  },
};

const serviceMap = new Map();
serviceMap.set("aaa", aaa);

wss.on("connection", (ws) => {
  console.log("连接成功！");
  ws.on("message", (dataStr) => {
    const [requestId, serviceName, paths] = JSON.parse(dataStr);
    console.log(requestId, serviceName, paths);
    wss.clients.forEach((client) => {
      // const a = serviceMap
      //   .get(serviceName)
      //   [paths[0]][paths[1][0]](...paths[1][1]);

      client.send(
        JSON.stringify([
          requestId,
          {
            msg: "哈哈哈",
            paths,
          },
        ])
      );
    });
  });
});

server.listen(3000, function listening() {
  console.log("服务器启动成功！");
});
