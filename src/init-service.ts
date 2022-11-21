import { createRemoteServices } from "./remote-services";

const remoteServices = createRemoteServices("ws://127.0.0.1:3000", {
  limitConnect: 3,
});

export const newA = remoteServices.getClsService("A");
export const newB = remoteServices.getClsService("B");

const remoteServices2 = createRemoteServices("ws://127.0.0.1:3000");

export const newA2 = remoteServices2.getClsService("A");
