# GpioPI Controller
Very simple controlling GPIO pins and monitoring GPIO states on Raspberry PI.

# Run
node app.js

or

pm2 start pm2.GpioPI-Controller.js

# API

GET<br>
api/v1/info/<br>
- print info
EXAMPLE
- http://ip_address_your_server:8080/api/v1/info/<br>
Result:<br>
{
  "name": "GpioPI Controller",
  "uptime": 52619.57,
  "author": "Roland Olejár",
  "version": "1.00"
}
