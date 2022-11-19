import { Service } from "./service";

const aaa = Service("aaa");

const a = await aaa.a.b.c(1123, 123).d().e().$();
console.log(1, a);

const c = await aaa.e.sum(1111, 2222).$();
console.log(2, c);
