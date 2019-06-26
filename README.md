# Multer OVH Object Storage

Streaming multer storage engine for OVH Object Storage.

## Installation

```sh
npm install --save multer-ovh-objectstorage
```

## Usage

```javascript
const express = require('express');
const multer = require('multer');
const OVHObjectStorage = require('multer-ovh-objectstorage');

var app = express();

var upload = multer({
    storage: OVHObjectStorage({
        username: '******',
        password: '******',
        authURL:  'https://auth.cloud.ovh.net/v2.0',
        tenantId: '******',
        region:   'UK1',
        container: '******'
    })
});

app.post('/upload', upload.single('file'), function(req, res, next) {
  res.send('Successfully uploaded ' + req.file.filename);
})
```