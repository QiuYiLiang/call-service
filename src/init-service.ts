import { makeNew, setServiceConfig } from "./service";

setServiceConfig({ wsService: "ws://127.0.0.1:3000", limitConnect: 3 });

export const newA = makeNew("A");
export const newB = makeNew("B");
