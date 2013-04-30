var express = require('express');
var http = require('http');
var samlp = require('../../lib');
var xtend = require('xtend');
var fs = require('fs');
var path = require('path');

var fakeUser = {
  id: '12345678',
  displayName: 'John Foo',
  name: {
    familyName: 'Foo',
    givenName: 'John'
  },
  emails: [
    {
      type: 'work',
      value: 'jfoo@gmail.com'
    }
  ]
};

var credentials = {
  cert:     fs.readFileSync(path.join(__dirname, 'samlp.test-cert.pem')),
  key:      fs.readFileSync(path.join(__dirname, 'samlp.test-cert.key')),
  pkcs7:    fs.readFileSync(path.join(__dirname, 'samlp.test-cert.pb7'))
};

module.exports.start = function(options, callback){
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var app = express();

  app.configure(function(){
    this.use(function(req,res,next){
      req.user = fakeUser;
      next();
    });
  });

  function getPostURL (wtrealm, wreply, req, callback) {
    callback(null, 'http://office.google.com');
  }

  //configure samlp middleware
  app.get('/samlp', 
      samlp.auth(xtend({}, {
        issuer:             'urn:fixture-test',
        getPostURL:         getPostURL,
        cert:               credentials.cert,
        key:                credentials.key
      }, options)));

  var server = http.createServer(app).listen(5050, callback);
  module.exports.close = server.close.bind(server);
};

module.exports.fakeUser = fakeUser;
module.exports.credentials = credentials;