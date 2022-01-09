---
title: X.509 certificates with javascript
permalink: posts/x509-certs-javascript/
date: 2022-01-01
tags: javascript
---

The following javascript module uses [node-forge](https://github.com/digitalbazaar/forge) to generate
X.509 certificates for local development.


## keypair.js

```javascript
/* keypair.js */

const crypto = require('crypto');
const forge = require('node-forge');
const pki = forge.pki;

const DEFAULT_EXPIRY_YEARS = 1;
const DEFAULT_KEY_LENGTH = 2048;

/**
 * Returns a random unique hexidecimal string
 *
 * @param {string=} text - optional namespace
 */
function mkSerialNumber(namespace) {
    const rnd = '.' + new Date() + '.' + Math.floor(Math.random() * 100000);
    const hash = crypto.createHash('sha1').update(namespace + rnd, 'binary');
    // Prepend '00' to prevent negative serial number (https://github.com/digitalbazaar/forge/issues/349)
    return '00' + hash.digest('hex');
}

/**
 * Generate a PKI X.509 certificate and private key signed by the given Certificate Authority key
 *
 * @param {string} caCertPem
 * @param {string} caKeyPem
 * @param {Object[]} subject
 * @param {Object[]} extensions
 * @param {Object=} options
 */
function mkKeyPair(caCertPem, caKeyPem, subject, extensions, options) {

    const opts = {...(options || {})};
    opts.keyLength = opts.keyLength || DEFAULT_KEY_LENGTH;
    opts.expiryYears = opts.expiryYears || DEFAULT_EXPIRY_YEARS;
    opts.serialNumber = opts.serialNumber || mkSerialNumber(JSON.stringify(subject));

    const caCert = pki.certificateFromPem(caCertPem);
    const caKey = pki.privateKeyFromPem(caKeyPem);
    const keys = pki.rsa.generateKeyPair(opts.keyLength);
    const cert = pki.createCertificate();
    const currentYear = new Date().getFullYear();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = opts.serialNumber;
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(currentYear + opts.expiryYears);
    cert.setSubject(subject);
    cert.setIssuer(caCert.subject.attributes);
    cert.setExtensions(extensions);
    cert.sign(caKey, forge.md.sha256.create());

    return {
        privateKeyPem: pki.privateKeyToPem(keys.privateKey),
        certPem: pki.certificateToPem(cert)
    }
}

module.exports = mkKeyPair;

```

## CA Certificate

The required root CA certificate can be generated with openssl commands such as the following:

```bash
$ openssl genrsa -out rootCA.pem.key 2048
$ openssl req -x509 -sha256 -new -nodes -key rootCA.pem.key -days 3650 -out rootCA.pem.crt
```

## Example

There is a command line usage example on [github](https://github.com/averagehuman/js-mk-cert/blob/main/mkcert.js).

```bash
$ node mkcert.js 10.0.1.1
Creating self-signed certificate (CN=10.0.1.1)...
Wrote file: 10.0.1.1.crt
Wrote file: 10.0.1.1.key

```

That script doesn't automatically restrict permission on the key file, so you should do that, eg.:

```bash
$ chmod 400 10.0.1.1.key
```

## See Also

* [github.com/FiloSottile/mkcert](https://github.com/FiloSottile/mkcert) - a more complete solution written in go that installs a CA cert to
  the system trust store of the host OS
