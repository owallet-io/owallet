function createRecursiveParser(max_depth, delimiter) {
  const MAX_DEPTH = max_depth;
  const DELIMITER = delimiter;

  const recursiveParser = (n, buffer, callback) => {
    if (buffer.length === 0) {
      return { code: 0, buffer: buffer };
    }
    if (n > MAX_DEPTH) {
      return { code: 1, buffer: buffer };
    }
    const xs = buffer.split(DELIMITER);
    if (xs.length === 1) {
      return { code: 0, buffer: buffer };
    }
    callback(xs.shift(), n);
    return recursiveParser(n + 1, xs.join(DELIMITER), callback);
  };
  return recursiveParser;
}

export class MessageParser {
  constructor(callback) {
    this.buffer = '';
    this.callback = callback;
    this.recursiveParser = createRecursiveParser(20, '\n');
  }

  run(chunk) {
    this.buffer += chunk;
    while (true) {
      const res = this.recursiveParser(0, this.buffer, this.callback);
      this.buffer = res.buffer;
      if (res.code === 0) {
        break;
      }
    }
  }
}
