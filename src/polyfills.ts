// Polyfill global.setImmediate and clearImmediate before any framework code executes
if (typeof (global as any).setImmediate === 'undefined') {
  (global as any).setImmediate = function (fn: (...args: any[]) => void, ...args: any[]) {
    return setTimeout(fn, 0, ...args);
  };
}
if (typeof (global as any).clearImmediate === 'undefined') {
  (global as any).clearImmediate = function (id: any) {
    clearTimeout(id);
  };
}
