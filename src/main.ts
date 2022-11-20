import { makeNew, setServiceConfig } from "./service";

setServiceConfig({ wsService: "ws://127.0.0.1:3000", limitConnect: 10 });

export const newA = makeNew("A");

const [a] = await newA();
(window as any).a = a;

const d = await a.add(1, 2).$();
console.log(d);
const c = await a.add(222, 111).$();
console.log(c);
const data = await a.data.$();

const sum = async (num1: number, num2: number) => {
  console.log(await a.add(num1, num2).$());
};

(window as any).sum = sum;
console.log(data);
