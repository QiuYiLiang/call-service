class A {
  data = [];
  async add(a, b) {
    const sum = a + b;
    this.data.push(sum);

    await new Promise((reslove) => {
      setTimeout(() => {
        reslove();
      }, 1000);
    });

    return sum;
  }
}

module.exports = {
  A,
};
