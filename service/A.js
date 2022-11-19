class A {
  id;
  data = [];
  constructor(id) {
    this.id = id;
  }
  add(a, b) {
    const sum = a + b;
    this.data.push(sum);
    return sum;
  }
}

module.exports = {
  A,
};
