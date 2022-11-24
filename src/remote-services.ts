interface ServiceOptions {
  serviceName: string;
  remoteServices: RemoteServices;
}

interface RemoteServicesOptions {
  limitConnect?: number;
}

class Service {
  private serviceName: string;
  private wsRemoteServices: RemoteServices;
  constructor({ serviceName, remoteServices }: ServiceOptions) {
    this.serviceName = serviceName;
    this.wsRemoteServices = remoteServices;
  }
  private async send(paths: any[], delay = 10000) {
    if (this.wsRemoteServices.limitConnect === 0) {
      return null;
    }

    const socket = await this.wsRemoteServices.getWs();

    if (!socket) {
      return null;
    }

    const requestId = Date.now() + Math.random().toString(36).slice(-10);

    (socket as WebSocket).send(
      JSON.stringify([requestId, this.serviceName, paths])
    );

    return await new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.wsRemoteServices.sends.delete(requestId);
        console.log("响应超时!");

        resolve(null);
      }, delay);

      this.wsRemoteServices.sends.set(requestId, {
        resolve,
        timer,
      });
    });
  }

  getRemoteService(delay?: number): any {
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

                return await this.send(paths, delay || _delay);
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
  }
}

class RemoteServices {
  private ws: WebSocket | null = null;
  limitConnect: number = 3;
  private timeConnect: number = 0;
  sends = new Map<
    string,
    {
      resolve: (data: any) => void;
      timer: number;
    }
  >();

  constructor(public wsService: string, options?: RemoteServicesOptions) {
    const { limitConnect } = options || {};
    if (limitConnect) {
      this.limitConnect = limitConnect;
    }
  }

  private initSocket() {
    return new Promise((resolve) => {
      if (!this.wsService) {
        return resolve(null);
      }

      const socket = new WebSocket(this.wsService);

      socket.addEventListener("open", () => {
        this.ws = socket;

        resolve(this.ws);
      });

      socket.addEventListener("message", ({ data: dataStr }: any) => {
        const [requestId, data] = JSON.parse(dataStr);

        const { resolve, timer } = this.sends.get(requestId) ?? {};
        if (resolve) {
          clearTimeout(timer);
          resolve(data);
        }
      });

      socket.addEventListener("close", () => {
        if (this.limitConnect > 0) {
          this.limitConnect--;
          this.timeConnect++;
          console.log("第" + this.timeConnect + "次重连");
          setTimeout(async () => {
            resolve(await this.initSocket());
          }, 2000);
        } else {
          this.ws = null;
          console.log("WebSocket 连接已超时");
          resolve(null);
        }
      });
    });
  }

  getClsService(serviceName: string, delay?: number) {
    return async (...args: any[]) => {
      const remoteService = new Service({
        serviceName,
        remoteServices: this,
      }).getRemoteService(delay);

      const id =
        serviceName + Date.now() + Math.random().toString(36).slice(-10);

      await remoteService.new(id, ...args).$();

      return [remoteService.get(id), () => remoteService.del(id)];
    };
  }

  getService(serviceName: string, delay?: number) {
    const service = new Service({
      serviceName,
      remoteServices: this,
    });
    return service.getRemoteService(delay);
  }

  async getWs() {
    return this.ws ? this.ws : await this.initSocket();
  }
}

export const createRemoteServices = (
  wsService: string,
  options?: RemoteServicesOptions
) => {
  const remoteServices = new RemoteServices(wsService, options);
  return {
    getClsService: remoteServices.getClsService.bind(remoteServices),
    getService: remoteServices.getService.bind(remoteServices),
  };
};

export const fileToBase64File = async (file: File) => {
  const { lastModified, name, size, webkitRelativePath } = file;
  const base64 = await blobToBase64(file);
  return {
    lastModified,
    name,
    size,
    webkitRelativePath,
    base64,
  };
};

export const blobToBase64 = (blob: Blob) =>
  new Promise((reslove) => {
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = (e: any) => {
      reslove(e.target.result);
    };
  });

interface Base64File {
  lastModified: number;
  name: string;
  size: number;
  webkitRelativePath: string;
  base64: string;
}

export const downloadBase64File = (
  base64FileOrBase64: Base64File | string,
  fileName?: string
) => {
  const { base64, name } =
    typeof base64FileOrBase64 === "string"
      ? { base64: base64FileOrBase64, name: fileName }
      : base64FileOrBase64;
  if (!name) {
    console.log("无法下载没有名称的文件!");

    return;
  }
  const parts = base64.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  const blob = new Blob([uInt8Array], {
    type: contentType,
  });

  const aLink = document.createElement("a");
  aLink.download = fileName ?? name;
  aLink.href = URL.createObjectURL(blob);
  aLink.click();

  return URL.createObjectURL(blob);
};
