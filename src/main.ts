import { makeNew } from "./service";

export const newA = makeNew("A");

const [a] = await newA();

const d = await a.add(1, 2).$();
const c = await a.add(222, 111).$();
const data = await a.data.$();

console.log(d, c, data);
