const
    fs = require('fs'),
    winston = require('winston'),
    { transports, createLogger, format } = require('winston')

    
require('dotenv').config()

// ---
  if (!fs.existsSync(process.env.DIR_LOG)) {
    fs.mkdirSync(process.env.DIR_LOG)
  }
// ---

const logger = winston.createLogger({
  level: 'silly',
  // format: winston.format.json(),
  // defaultMeta: { service: 'user-service' },
  format: format.combine(
    format.timestamp({format: 'DD.MM.YYYY HH:mm:sss.ssss'}),
    format.json()
  ),
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: `${process.env.DIR_LOG}/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${process.env.DIR_LOG}/combined.log` }),
  ],
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }))
}

module.exports = logger