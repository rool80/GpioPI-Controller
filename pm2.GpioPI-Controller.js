module.exports = {
  apps : [{
    name    : "GpioPI Controller",
    script  : "./app.js",
    watch   : true,
    ignore_watch  : [ "logs", "logs/*", "node_modules", "*.code-workspace", ".gitignore", ".git", ".git/*", "cache", "cache/*" ],
    error_file    : "logs/pm2-error.log",
    out_file      : "logs/pm2-out.log"
  }]
}
