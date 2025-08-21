class Logger {
  constructor(name) {
    this.name = name;
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m'
    };
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] [${level}] [${this.name}] ${message}${formattedArgs}`;
  }

  colorize(text, color) {
    if (process.env.NO_COLOR || !process.stdout.isTTY) {
      return text;
    }
    return `${this.colors[color]}${text}${this.colors.reset}`;
  }

  info(message, ...args) {
    const formatted = this.formatMessage('INFO', message, ...args);
    console.log(this.colorize(formatted, 'blue'));
  }

  warn(message, ...args) {
    const formatted = this.formatMessage('WARN', message, ...args);
    console.warn(this.colorize(formatted, 'yellow'));
  }

  error(message, ...args) {
    const formatted = this.formatMessage('ERROR', message, ...args);
    console.error(this.colorize(formatted, 'red'));
  }

  debug(message, ...args) {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      const formatted = this.formatMessage('DEBUG', message, ...args);
      console.log(this.colorize(formatted, 'dim'));
    }
  }

  success(message, ...args) {
    const formatted = this.formatMessage('SUCCESS', message, ...args);
    console.log(this.colorize(formatted, 'green'));
  }

  trace(message, ...args) {
    if (process.env.NODE_ENV === 'development' || process.env.TRACE) {
      const formatted = this.formatMessage('TRACE', message, ...args);
      console.log(this.colorize(formatted, 'magenta'));
    }
  }

  // 创建子logger
  child(childName) {
    return new Logger(`${this.name}:${childName}`);
  }

  // 性能计时
  time(label) {
    console.time(`[${this.name}] ${label}`);
  }

  timeEnd(label) {
    console.timeEnd(`[${this.name}] ${label}`);
  }

  // 记录HTTP请求
  logRequest(method, url, status, duration) {
    const statusColor = status >= 400 ? 'red' : status >= 300 ? 'yellow' : 'green';
    const message = `${method} ${url} ${this.colorize(status, statusColor)} - ${duration}ms`;
    this.info(message);
  }

  // 记录错误堆栈
  logError(error, context = {}) {
    this.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      context
    });
  }

  // 记录任务开始和结束
  logTaskStart(taskName, params = {}) {
    this.info(`Task started: ${taskName}`, params);
  }

  logTaskEnd(taskName, result = {}) {
    this.success(`Task completed: ${taskName}`, result);
  }

  logTaskError(taskName, error, params = {}) {
    this.error(`Task failed: ${taskName}`, {
      error: error.message,
      params
    });
  }
}

module.exports = Logger;