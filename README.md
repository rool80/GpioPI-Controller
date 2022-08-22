# GpioPI Controller
Very easy to control GPIO pins and monitor GPIO states on Raspberry PI.
- the controller allows you to switch the GPIO to "**in**", "**out**" or use the option to monitor temperature and humidity from DHT sensors. 
- the controller has the option to set a webhook, which is activated when the value of the GPIO pin changes and calls the specified url address where it sells the current value of the pin. E.g.: webhook can be called to nodered and subsequent use of logic for automation directly in nodered...

# Run
node app.js

or

pm2 start pm2.GpioPI-Controller.js

# WEB

A simple option to configure and monitor the GPIO status using the web interface at the url address http:\\your_ip_address:8080

# API

API specification can be found at this url address: https://api.irool.cz/?api=GPIO-CONTROLLER
