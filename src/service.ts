let ws: any = null;

let wsService = "";
let limitConnect = 3;
let timeConnect = 0;

interface ServiceConfig {
  wsService: string;
  limitConnect?: number;
}

export const setServiceConfig = ({
  wsService: _wsService,
  limitConnect: _limitConnect,
}: ServiceConfig) => {
  if (!wsService) {
    wsService = _wsService;
    if (_limitConnect) {
      limitConnect = _limitConnect;
    }
  }
};

const sendMap = new Map<
  string,
  {
    resolve: (data: any) => void;
    timer: number;
  }
>();

const send = async (serviceName: string, paths: any[], delay = 10000) => {
  const socket = ws ? ws : await startSocket();

  if (!socket) {
    return null;
  }

  const requestId = Date.now() + Math.random().toString(36).slice(-10);

  socket.send(JSON.stringify([requestId, serviceName, paths]));

  return await new Promise((resolve) => {
    const timer = setTimeout(() => {
      sendMap.delete(requestId);
      console.log("响应超时!");

      resolve(null);
    }, delay);

    sendMap.set(requestId, {
      resolve,
      timer,
    });
  });
};

const startSocket = () => {
  if (!wsService) {
    return null;
  }
  return new Promise((resolve) => {
    const socket = new WebSocket(wsService);

    socket.addEventListener("open", () => {
      ws = socket;
      resolve(ws);
    });

    socket.addEventListener("message", ({ data: dataStr }: any) => {
      const [requestId, data] = JSON.parse(dataStr);

      const { resolve, timer } = sendMap.get(requestId) ?? {};
      if (resolve) {
        clearTimeout(timer);
        resolve(data);
      }
    });

    socket.addEventListener("close", () => {
      if (limitConnect > 0) {
        limitConnect--;
        timeConnect++;
        console.log("第" + timeConnect + "次重连");
        setTimeout(async () => {
          resolve(await startSocket());
        }, 2000);
      } else {
        ws = null;
        console.log("WebSocket 连接已超时");
        resolve(null);
      }
    });
  });
};

export const Service = (serviceName: string, delay?: number): any => {
  const _delay = delay;
  let paths: any[] = [];
  const makeProxy = (key: any, index: number): any => {
    const proxy = new Proxy(
      index === 0
        ? {}
        : (...args: any[]) => {
            paths[index - 1] = [key, args];
            return makeProxy(key, index);
          },
      {
        get: (_, key) => {
          if (index === 0) {
            paths = [];
          }

          if (key == "$") {
            return async (delay?: number) => {
              if (index === 0) {
                return;
              }

              return await send(serviceName, paths, delay || _delay);
            };
          }
          paths[index] = key;
          return makeProxy(key, index + 1);
        },
      }
    );

    return proxy;
  };

  return makeProxy("", 0);
};

export const makeNew = (ClassName: string) => {
  return async (...args: any[]) => {
    const service = Service(ClassName);
    const id = ClassName + Date.now() + Math.random().toString(36).slice(-10);

    await service.new(id, ...args).$();

    return [service.get(id), () => service.del(id)];
  };
};
