
var udid = require('udid');
var knox = require('knox');
var through = require('through');
var ini = require('ini');
var fs = require('fs');
var net = require('net');
var tls = require('tls');
var undef;

module.exports = function(s3key,s3secret,bucket){
  
  var client = knox.createClient({
      key: s3key
    , secret: s3secret
    , bucket: bucket
  });

  var o = {
    id:function(service,host,port){
      return udid(bucket+'!'+service+'!'+host+'!'+port);
    },
    register:function(service,host,port,data,cb){
      if(typeof data === 'function'){
        cb = data;
        data = undef;
      }
      var id = this.id(service,host,port);
      var s = through();
      var buf = new Buffer(JSON.stringify({
        service:service,
        host:host,
        port:port,
        time:Date.now(),
        data:data
      })+"\n");

      var headers = {
        'Content-Length': buf.length
        ,'Content-Type': 'text/plain'
      };

      client.putStream(s,'/'+service+'-'+id+'-'+host+'-'+port,headers,function(err,data){
        cb(err,data);
      });
      s.write(buf);
      s.end();
    },
    list:function(service,cb){
      opts = {};
      if(typeof service == "function"){
        cb = service;
        service = undef;
      }
      if(service) opts.prefix = service;
      client.list(opts,function(err,data){
        
        // todo list data.
        cb(err,data);

      });
    },
    clean:function(check){
      // list and delete service id files where services have not checked in in a while and or fail the check.
    }
  };

  return o;
}

module.exports.timeout = 5000;

module.exports.tcpCheck = function(info,cb){
  var called = false;
  var s = net.connect({host:info.host,port:info.port},function(){
    console.log('connected> ',arguments);
    if(!called) {
      called = true;
      cb(false,true);
      s.destroy();
    }
  });
  s.on('error',function(e){
    console.log('error> ',arguments);
    if(!called) {
      called = true;
      cb(e);
    }
  });

  var t = setTimeout(function(){
    if(!called) {
      called = true;
      var e = new Error('timeout');
      e.code = "E_TIMEOUT";
      cb(e);
      s.destroy();
    }
  },module.exports.timeout);
  t.unref();
};

module.exports.s3cfg = function(){
  var cfg = process.env.HOME+'/.s3cfg';
  if(fs.existsSync(cfg)){
    return ini.parse(fs.readFileSync(cfg).toString());
  }
}
