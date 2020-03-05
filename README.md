# Multer OVH Object Storage

Streaming multer storage engine for OVH Object Storage.

## Installation

```sh
npm install --save multer-ovh-objectstorage
```

## Usage

### For API v2

```javascript
const express = require('express');
const multer = require('multer');
const OVHObjectStorage = require('multer-ovh-objectstorage');

var app = express();

var upload = multer({
    storage: OVHObjectStorage({
        version:    2, // Optional (default is already 2)
        username:   '******',
        password:   '******',
        authURL:    'https://auth.cloud.ovh.net/v2.0',
        tenantId:   '******',
        region:     'UK1',
        container:  '******'
    })
});

app.post('/upload', upload.single('file'), function(req, res, next) {
  res.send('Successfully uploaded ' + req.file.filename);
})
```

### For API v3 (beta)

```javascript
const express = require('express');
const multer = require('multer');
const OVHObjectStorage = require('multer-ovh-objectstorage');

var app = express();

var upload = multer({
    storage: OVHObjectStorage({
        version:    3,
        username:   '******',
        password:   '******',
        authURL:    'https://auth.cloud.ovh.net/v3',
        tenantId:   '******',
        region:     'SBG',
        container:  '******'
    })
});

app.post('/upload', upload.single('file'), function(req, res, next) {
  res.send('Successfully uploaded ' + req.file.filename);
})
```

## File information

Each file contains the following informations exposed by `multer-ovh-objectstorage`:

| Key        | Description                                 |
|------------|---------------------------------------------|
| `filename` | The new filename to avoid naming collisions |
| `url`      | The associated targetURL                    |

## License

```
The MIT License (MIT)

Copyright (c) 2018 Antoine Dray "antoinedray"

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```