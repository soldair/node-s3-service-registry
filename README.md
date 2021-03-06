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

### register(service,host,port,data,cb)
  - service
    - the name of the service
  - host
    - the host name which can be accessed by people looking for the service
  - port
    - the service port
  - data (optional)
    - an object of custom data you would like to store in the service file
  - cb
    - callback

### online(service,check,cb)
list online services or search online services by service name prefix

  - service (optional)
    - prefix serce in bucket for service
  - check(info,cb) (optional)
    - run this check instead of the default tcpCheck
  - cb
    - callback


### offline(service,check,cb)
list offline services or search offline services by service name prefix

  - service (optional)
    - prefix serce in bucket for service
  - check(info,cb) (optional)
    - run this check instead of the default tcpCheck
  - cb
    - callback


### status(service,check,cb)
list services or search services by service name prefix. gathers status for all services.

  - service (optional)
    - prefix service in bucket for service
  - check(info,cb) (optional)
    - run this check instead of the default tcpCheck
  - cb
    - callback


### get(key,cb)
get the services data
  - key
    the s3 name of the file. the value of Key in list objects


### list(service,cb)
list services with no checks
  - service (optional)
    prefix serce in bucket for service

### clean(keys,cb)
  delete registered services by Key.

