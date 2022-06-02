# How To Get The Backend Running

## Start Mosquitto

First install [Mosquitto](https://mosquitto.org/download/). Make sure that port `1883` (TCP listener) and port `9001` (Websocket listener) are available on your system. In a Terminal, navigate to `path/to/projektgruppe-webtech/Mockup/mqtt-backend/mosquitto` and run `mosquitto -c mosquitto.conf`

## Start the Backend

In another terminal, navigate to `path/to/projektgruppe-webtech/Mockup/mqtt-backend/` and run `npm install`. The backend get's it's configuration (user and password for the broker you just started) from an `.env` file which is not committed to git. To create the `.env` file run

```bash
echo 'DEV_BROKER_USERNAME=mosquitto/nDEV_BROKER_PASSWORD=test/n' > .env
```

Afterwards, the file should be at `path/to/projektgruppe-webtech/Mockup/mqtt-backend/.env` and have the following content:

```text
DEV_BROKER_USERNAME=mosquitto
DEV_BROKER_PASSWORD=test
```

Now run `npm install && npm run dev` to start the backend. You should get the following output:

```text
...
[nodemon] starting `ts-node src/index.ts`
[ { topic: 'request/groups', qos: 2 } ]
[ { topic: 'request/groups/+/devices', qos: 0 } ]
```

Telling you the backend subscribed to the topics `request/groups` and `request/groups/+/devices`.

## Manually Send Messages to the Backend

In another terminal, subscribe to every topic of the broker using

```bash
mosquitto_sub -v -h localhost -p 1883 -u mosquitto -P test -t '#'
```

and manually request the current configuration with:

```bash
# array of groups
mosquitto_pub -h localhost -p 1883 -u mosquitto -P test -t "request/groups" -m 'REQUEST'
# array of devices in group with GROUPID. Try kitchen as GROUPID 😉
mosquitto_pub -h localhost -p 1883 -u mosquitto -P test -t "request/groups/GROUPID/devices" -m 'REQUEST'
```

You should see answers in the `response/groups` and `response/groups/GROUPID/devices` channels respecitvly.
