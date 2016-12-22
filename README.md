# PushBullet SMS
A library to use the [PushBullet's](https://docs.pushbullet.com/) SMS functionalities.
IMPORTANT : This uses undocumented APIs, so PushBullet has no obligation to
continue having those APIs. Develop something with those APIs at your own risks.
It supports receiving and sending SMS. It can also use
 [e2e](https://docs.pushbullet.com/#end-to-end-encryption) to communicate with your cellphone.

All the stream functionalities come from the awesome library
 https://github.com/alexwhitman/node-pushbullet-api.

## What is missing
- OAuth
- Creating a device to stop impersonating
- Extracting API requests left
- Limiting. Ex. request 25 devices.

## Usage

This is a code example to send a SMS from a given Android phone connected to
your PushBullet account.

```javascript
let PushBullet = require("pushbullet-sms");
let push = PushBullet("Your api key");

// If you want to enable e2e encryption
push.setupEncryption("Your e2e key")
.then(() => {
  console.log("Your communication will be encrypted");

  // Fetches the list of device connected to this account
  return push.devices();
}).then((devices) => {
  // Finds your device able to send SMS
  let device = _.find(r.devices, (d) => {
    return d.has_sms;
  });
  // Finds some device to impersonate when using SMS functionalities.
  // It doesn't have to be chrome.
  let chrome = _.find(r.devices, (d) => {
    return d.nickname === "Chrome";
  });

  // Impersonate chrome to send SMS.
  push.impersonate(chrome);

  return push.sendSMS(device.iden, "Receiver phone number", "Awesome first SMS");
}).then((result) => {
  console.log(result);
}).catch((error) => {
  console.error(error);
});
```

## API

### PushBullet(API_KEY)

Construct a PushBullet object with your API key.

```javascript
let push = new require("pushbullet-sms")(API_KEY);
```

### PushBullet.setupEncryption(E2E_PASSWORD)

Sets your e2e password. After this, your communication with your cellphone
should be encrypted.

```javascript
push.setupEncryption("Some password")
.then(() => {
  consle.log("Well done");
})
```

### PushBullet.impersonate(device)

Lets you impersonate a device to send SMS. When you send a SMS you are required
to indicate a source. Currently (1.0.0), this library doesn't support creating
a new device, so you will need to impersonate another device like a browser
using their [plugin](https://www.pushbullet.com/apps).

```javascript
push.devices()
.then(devices) => {
  // Finds some device to impersonate when using SMS functionalities.
  // It doesn't have to be chrome.
  let chrome = _.find(r.devices, (d) => {
    return d.nickname === "Chrome";
  });

  // Impersonate chrome to send SMS.
  push.impersonate(chrome);
});
```

### PushBullet.me()

Gets the user information.

```javascript
push.me()
.then((information) => {
  console.log(information);
});
```

### PushBullet.devices()

Fetches your list of devices.

```javascript
push.devices()
.then((devices) => {
  console.log(devices);
});
```

### PushBullet.conversations(deviceID)

Fetches a list of conversation on a specific device.

```javascript
push.conversations(device.iden)
.then((conversations) => {
  console.log(conversations);
})
```

### PushBullet.stream()

Those functionalities come from https://github.com/alexwhitman/node-pushbullet-api.

Returns a new stream listener which will emit events from the stream.

```javascript
var stream = pusher.stream();
```

#### connect()

Connects to the stream.

```javascript
stream.connect();
```

#### close()

Disconnects from the stream.

```javascript
stream.close();
```

#### Events

##### connect

Emitted when the stream has connected.

```javascript
stream.on('connect', function() {
  // stream has connected
});
```

##### close

Emitted when the stream has disconnected.

```javascript
stream.on('close', function() {
  // stream has disconnected
});
```

##### error

Emitted when there is a connection or streaming error.

```javascript
stream.on('error', function(error) {
  // stream error
});
```

##### message

Emitted when a message is received from the stream.  `message` will be emitted for all messages
but you can listen for specific messages with `nop`, `tickle` and `push`.

```javascript
stream.on('message', function(message) {
  // message received
});
```

##### nop

Emitted when the keep-alive 'no-operation' message is received.

```javascript
stream.on('nop', function() {
  // nop message received
});
```

##### tickle

Emitted when the `tickle` message is received.

```javascript
stream.on('tickle', function(type) {
  // tickle message received
});
```

##### push

Emited when the `push` message is received.

```javascript
stream.on('push', function(push) {
  // push message received
});
```
