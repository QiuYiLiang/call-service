const fs = require("fs");
const path = require("path");
class B {
  id;
  source = [];
  constructor(...args) {
    this.source.push(...args);
  }
  async sum(a, b) {
    const sum = a + b;
    this.source.push(sum);

    await new Promise((reslove) => {
      setTimeout(() => {
        reslove();
      }, 2000);
    });

    return sum;
  }
  saveFile(base64File) {
    const { base64, name } = base64File;
    const parts = base64.split(";base64,");
    // const contentType = parts[0].split(":")[1];
    const raw = parts[1];

    var dataBuffer = Buffer.from(raw, "base64");
    fs.writeFileSync(path.resolve(__dirname, `./${name}`), dataBuffer);

    return "ok";
  }
}

module.exports = {
  B,
};
