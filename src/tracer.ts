import ddTrace from "dd-trace";

const tracer = ddTrace.init({
  logInjection: true,
  debug: true,
  logger: console,
});
tracer.use("express", {
  enabled: true,
});

export {tracer};