/*
 *  File: index.js
 *  Author: Antoine Dray
 *  Description: Streaming multer storage engine for OVH Object Storage.
 */

const path = require('path');
const request = require('request');

function collect(storage, req, file, cb) {
  cb.call(storage, null, {
    version: storage.version,
    username: storage.username,
    password: storage.password,
    authURL: storage.authURL,
    tenantId: storage.tenantId,
    region: storage.region,
    container: storage.container
  });
}

function OVHObjectStorage(opts) {
  switch (typeof opts.version) {
    case 'number':
    case 'undefined':
      this.version = opts.version || 2;
      break;
    default: throw new TypeError('Expected opts.version to be number')
  }

  switch (typeof opts.username) {
    case 'string': this.username = opts.username; break
    default: throw new TypeError('Expected opts.username to be string')
  }

  switch (typeof opts.password) {
    case 'string': this.password = opts.password; break
    default: throw new TypeError('Expected opts.password to be string')
  }

  switch (typeof opts.authURL) {
    case 'string': this.authURL = opts.authURL; break
    default: throw new TypeError('Expected opts.authURL to be string')
  }

  switch (typeof opts.tenantId) {
    case 'string': this.tenantId = opts.tenantId; break
    default: throw new TypeError('Expected opts.tenantId to be string')
  }

  switch (typeof opts.region) {
    case 'string': this.region = opts.region; break
    default: throw new TypeError('Expected opts.region to be string')
  }

  switch (typeof opts.container) {
    case 'string': this.container = opts.container; break
    default: throw new TypeError('Expected opts.container to be string')
  }
}

function connect(opts) {
  var json = {};
  if (otps.version === 3) {
    json = {
      auth: {
        identity: {
          methods: [
            "password"
          ],
          password: {
            user: {
              name: opts.username,
              domain: {
                name: "Default"
              },
              password: opts.password
            }
          },
          tenantId: opts.tenantId
        }
      }
    };
  }
  else {
    json = {
      auth: {
        passwordCredentials: {
          username: opts.username,
          password: opts.password
        },
        tenantName: opts.tenantId,
        tenantId: opts.tenantId
      }
    };
  }

  return new Promise((resolve, reject) => {
    var tokenEndpoint = '/tokens';
    if (opts.version === 3) {
      var tokenEndpoint = '/auth' + tokenEndpoint;
    }
    request({
      method: 'POST',
      uri: opts.authURL + tokenEndpoint,
      json: json,
      headers: { 'Accept': 'application/json' }
    }, function(err, res, body) {
      if (err)
        return reject(err);
      if (body.error)
        return reject(new Error(body.error.message));
      if (!body.access)
        return reject(new Error('Connection response incomplete'));

      if (otps.version === 3) {
        const token = res.headers['x-subject-token'];
        const catalog = body.token.catalog.find(c => c.type === 'object-store');
        const endpoint = catalog.endpoints.find(e => e.region === opts.region);
      } else {
        const token = body.access.token;
        const catalog = body.access.serviceCatalog
                            .find(c => c.type === 'object-store');
        const endpoint = catalog.endpoints
                            .find(e => e.region === opts.region);
      }

      resolve({ token, endpoint });
    });
  });
}

function formatTargetURL(publicURL, container, filename) {
  const baseURL = publicURL + '/' + container + '/';
  return baseURL + filename;
}

function createFilename(filename) {
  const extention = path.extname(filename);
  const random = (Math.random() + 1).toString(36).substring(7);
  return random + '-' + Date.now() + extention;
}

OVHObjectStorage.prototype._handleFile = function(req, file, cb) {
  collect(this, req, file, function (err, opts) {
    if (err) return cb(err)

    connect(opts).then((res) => {

      const publicURL = (opts.version === 3)
                          ? res.endpoint.url
                          : res.endpoint.publicURL;
      const filename = createFilename(file.originalname);
      const params = {
        targetURL: formatTargetURL(publicURL, opts.container, filename),
        headers: {
          "X-Auth-Token": res.token.id,
          "Accept": "application/json"
        }
      }

      file.stream.pipe(
        request({
          method: 'PUT',
          uri: params.targetURL,
          headers: params.headers
        }, function (error, response, body) {
          if (error)
            return cb(err);
          cb(null, {
            filename: filename,
            url: params.targetURL
          });
        })
      );

    }).catch(err => { return cb(err) });
  })
}

module.exports = function(opts) {
  return new OVHObjectStorage(opts)
}
