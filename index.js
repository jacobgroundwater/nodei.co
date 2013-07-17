const path        = require('path')
    , fs          = require('fs')
    , splinksmvc  = require('splink-smvc')
    , redirector  = require('./lib/redirector')
    , isDev       = (/^dev/i).test(process.env.NODE_ENV)

    , defaultHost = 'nodei.co'
    , port        = process.env.PORT || 3000
    , sslKeyFile  = path.join(__dirname, 'keys/nodeico.key')
    , sslCertFile = path.join(__dirname, 'keys/nodei.co.crt')

var ssl

// does messy prototype extension, need to load it before we load restify
// plugins in our filters
require('restify-request')

// init swig with 'root' param, this isn't done by `consolidate` but required by
// swig if you want to reference templates from within templates
require('swig').init({ root: path.join(__dirname, 'views'), cache: !isDev })

if (fs.existsSync(sslKeyFile) && fs.existsSync(sslCertFile)) {
  ssl = {
      key  : fs.readFileSync(sslKeyFile)
    , cert : fs.readFileSync(sslCertFile)
  }
} // else won't start with https, will just start an http

splinksmvc({
    port     : port
  , ssl      : ssl
  , scan     : [
        path.join(__dirname, './lib/controllers/')
      , path.join(__dirname, './lib/filters/')
    ]
  , 'static' : {
        path       : path.join(__dirname, './public')
      , url        : '/'
      , cache      : isDev ? false : {}
    }
  , 'views'  : {
        path       : path.join(__dirname, './views')
      , suffix     : 'html'
      , processor  : 'swig'
    }
}).start()

if (process.env.REDIRECT_PORT) {
  console.log('Starting redirector on port', process.env.REDIRECT_PORT)
  redirector(defaultHost, process.env.REDIRECT_PORT, port)
} else
  console.log('Not starting redirector, $REDIRECT_PORT')