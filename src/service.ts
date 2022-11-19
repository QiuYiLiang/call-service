let ws: any = null;

const startSocket = () => {
  return new Promise((resolve) => {
    const socket = new WebSocket("ws://127.0.0.1:3000");
    socket.addEventListener("open", () => {
      ws = socket;
      resolve(ws);
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
              const requestId =
                Date.now() + Math.random().toString(36).slice(-10);

              const socket = ws ? ws : await startSocket();

              socket.send(JSON.stringify([requestId, serviceName, paths]));
              return await new Promise((resolve) => {
                const listener = ({ data: dataStr }: any) => {
                  const [returnRequestId, data] = JSON.parse(dataStr);

                  if (requestId === returnRequestId) {
                    resolve(data);
                  }
                };
                socket.addEventListener("message", listener);
                setTimeout(() => {
                  socket.removeEventListener("message", listener);
                  resolve(null);
                }, delay || _delay || 10000);
              });
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

