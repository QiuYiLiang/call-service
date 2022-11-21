import { newA, newA2, newB } from "./init-service";

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

const [b] = await newB(1, 3, 5, 7, 9);
const f = await b.sum(222, 111).$();
console.log(f);

const g = await b.sum(222, 111).$();
console.log(g);
const data2 = await b.source.$();
console.log(data2);

const [a2] = await newA2();

const d2 = await a2.add(11111, 2).$();
console.log(d2);
const c2 = await a2.add(22123123, 111).$();
console.log(c2);
