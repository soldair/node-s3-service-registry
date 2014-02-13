
var udid = require('udid');
var knox = require('knox');
var through = require('through');
var ini = require('ini');
var fs = require('fs');
var net = require('net');
var concats = require('concat-stream');
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
    get:function(key,cb){
      client.getFile(key,function(err,res){
        if(err) return cb(err);
        res.pipe(concats(function(data){
          cb(false,json(data),data);
        }));
      });
    },
    list:function(service,cb){
      opts = {};
      if(typeof service == "function"){
        cb = service;
        service = undef;
      }

      if(service) opts.prefix = service;
      client.list(opts,function(err,data){

        if(err) return cb(err);
        if(data.Code){
          var e = new Error(data.Message);
          e.data = data;
          e.code = data.Code;
          return cb(e);
        }

        var out = [];
        if(data.Contents) {
          data.Contents.forEach(function(o){
            var parts = o.Key.split('-');
            o.service = parts[0];
            o.id = parts[1];
            o.host = parts[2];
            o.port = parts[3];
            out.push(o);
          });
        }

        // todo list data.
        cb(err,out);
        
      });
    },
    checkLimit:10,
    staleTimeout:120000,
    check:function(list,check,cb){
      if(arguments.length === 2){
        cb = check;
        check = module.exports.tcpCheck; 
      }
      // list and delete service id files where services have not checked in in a while and or fail the check.
      var z = this;
      z.list(function(err,list){

        if(err) return cb(err);

        var c = z.checkLimit;
        var timeout = z.staleTimeout;

        var todo = [];
        list.forEach(function(o){
          var mtime = +o.LastModified;
          if(Date.now()-mtime > timeout){
            o.stale = true;
            o.offline = true;
          } else {
            // make sure its listening on the port.
            todo.push(o);
          }
        });

        var active = 0, started = 0
        , job = function fn(o){
          ++started;
          check(o,function(err, success){
            o.listening = success;
            o.offline = !success;
            if(todo.length) fn(todo.shift());
          });
        };

        if(!todo.length){
          return cb(false,list);
        }

        while(active < c && todo.length) {
          ++active;
          job(todo.shift());
        }

      });
    },
    clean:function(keys,cb){
      client.deleteMultiple(keys,function(err,res){
        if(err) return cb(err);
        res.pipe(concats(function(data){
          cb(false,data+'');
        }))
      });
    }
  };

  return o;
}

module.exports.timeout = 5000;

module.exports.tcpCheck = function(info,cb){
  var called = false;
  var s = net.connect({host:info.host,port:info.port},function(){
    if(!called) {
      called = true;
      cb(false,true);
      s.destroy();
    }
  });
  s.on('error',function(e){
    if(!called) {
      called = true;
      cb(err);
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

function json(b){
  try{
    return JSON.parse(b);
  } catch(e){}
}
