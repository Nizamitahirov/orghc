const isDev = process.env.NODE_ENV === 'development';

const logger = {
  log:   (...args) => { if (isDev) console.log(...args); },
  warn:  (...args) => { if (isDev) console.warn(...args); },
  error: (...args) => { if (isDev) console.error(...args); },
  info:  (...args) => { if (isDev) console.info(...args); },
  debug: (...args) => { if (isDev) console.debug(...args); },
};

export default logger;
