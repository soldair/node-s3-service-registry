var test = require('tape');
var net = require('net');
var sreg = require('../index');

test("can check tcp error",function(t){

  sreg.tcpCheck({host:"127.0.0.1",port:0},function(err,data){
    t.ok(err,'should have error connecting to port 0');
    t.end()
  })
   
});

test("can check tcp ok",function(t){

  sreg.tcpCheck({host:"google.com",port:80},function(err,data){
    t.ok(err,'should not have error connecting to google');
    t.end();
  }) 
});

test("can check tcp timeout",function(t){
  sreg.timeout = 100;
  sreg.tcpCheck({host:"google.com",port:7777},function(err,data){
    console.log(err);
    t.equals(err.code,"E_TIMEOUT",'timeout error');
    t.end();
  });
});

