import { Service } from "./service";

const aService = Service("AService");

await aService.new("1").add(1, 2).$();
await aService.get("1").add(3333, 2222).$();
const data = await aService.get("1").data.$();
console.log(data);
