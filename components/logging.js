const dom = { log: undefined, status: undefined, perf: undefined };

export const log = (...msg) => {
  if (typeof document !== 'undefined') {
    if (!dom.log) dom.log = document.getElementById('log');
    dom.log.innerText += msg.join(' ') + '\n';
  }
  console.log(...msg);
};

export const status = (msg) => {
  if (typeof document !== 'undefined') {
    if (!dom.status) dom.status = document.getElementById('status');
    console.log('status', msg, dom.status?.innerText);
    dom.status.innerText = msg;
  }
};
