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
}

module.exports = {
  B,
};
