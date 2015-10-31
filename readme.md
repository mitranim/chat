[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com)

```sh
git clone https://github.com/Mitranim/chat.git && cd chat
npm i
npm start
```

This is backed by Firebase; here's the security rules:

```js
"chat": {
  ".read": true,
  "$messageId": {
    // Can post new messages and delete own messages.
    ".write": "(!data.exists() && newData.hasChildren(['userId', 'authorName', 'body', 'timestamp'])) || data.exists() && data.child('userId').val() === auth.uid",
    // Must specify own uid.
    "userId": {".validate": "newData.val() === auth.uid"},
    // Allow an arbitrary name (potentially allows users to impersonate others).
    "authorName": {".validate": "newData.isString() && newData.val().length > 0"},
    // Must have a non-empty body.
    "body": {".validate": "newData.isString() && newData.val().length > 0"},
    // Must be the current time.
    "timestamp": {".validate": "newData.val() === now"}
  }
}
```
