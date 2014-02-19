
s3-service-registry
===================

use s3 to publish the hosts and ports of running services

```js
var s3reg = require('s3-service-registry')

var reg = s3reg(s3key,s3secret,bucket);

reg.online(function(err,list){
  console.log('online services',list)

});

```

lists returned will be arrays of objects like. by default a tcp check is run on the host and port but you can pass in a custom check.

```js
 [ { Key: 'hi-1797733be60f08e46ee2c6a0bb41d67d5295607d-127.0.0.1-1337',
    LastModified: Tue Feb 18 2014 16:45:29 GMT-0800 (PST),
    ETag: '"4891f51750205e2380566db567bcd7d7"',
    Size: 71,
    Owner: 
     { ID: '--------',
       DisplayName: '---------' },
    StorageClass: 'STANDARD',
    service: 'hi',
    id: '-------',
    host: '127.0.0.1',
    port: '1337',
    listening: false,
    offline: true } ]

```


##API

### default export

```js
ctor = require('s3-service-registry')
instance = ctor(s3key,s3secret,bucket)
```
## instance methods

register(service)

### online(service,check,cb)
  - service (optional)
    prefix serce in bucket for service
  - check(info,cb) (optional)
    run this check instead of the default tcpCheck
  - cb
    callback


### offline(service,check,cb)
  - service (optional)
    prefix serce in bucket for service
  - check(info,cb) (optional)
    run this check instead of the default tcpCheck
  - cb
    callback


### status(service,check,cb)
  - service (optional)
    prefix serce in bucket for service
  - check(info,cb) (optional)
    run this check instead of the default tcpCheck
  - cb
    callback


### get(key,cb)
  - key
    the s3 name of the file. the value of Key in list objects


### list(service,cb)
  - service (optional)
    prefix serce in bucket for service

### clean(keys,cb)
  delete registered services by name.

