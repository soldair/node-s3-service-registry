var test = require('tape');
var reg = require('../');



test("can foos",function(t){

  var b = "bm-service-dev";
  var cfg = reg.s3cfg();

  r = reg(cfg.default.access_key,cfg.default.secret_key,b)

  r.register('hi','127.0.0.1','1337',function(err){
    t.ok(!err,'should not have error regeistering service');
    r.list(function(err,list){
      console.log(err,list);
      t.ok(list,'should have service file list');
      t.end();
    });
  });

});
