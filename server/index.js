// const Koa = require('koa')
import Koa from 'koa';
const { Nuxt, Builder } = require('nuxt')
const consola = require('consola')

import mongoose from 'mongoose';
import bodyParser from 'koa-bodyparser'
import session from 'koa-generic-session'
import Redis from 'koa-redis';
import json from 'koa-json';
import dbConfig from './dbs/config'
import passport from './interface/utils/passport'
import users from './interface/user'
import Router from 'koa-router';

const router = new Router();



const app = new Koa()
app.keys = ['mt', 'keys'];
app.proxy = true;
app.use(session({
  key: 'mt',
  prefix: 'mt:uid',
  store: new Redis()
}));

//post请求获取参数，美化json
app.use(bodyParser({
  extendTypes: ['json','form', 'text']
}));
app.use(json());

mongoose.connect(dbConfig.dbs,{
  useNewUrlParser: true
}, function (error) {
  if(error){
    console.log('connect mongodb error', error);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(app.env === 'production')

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000
  } = nuxt.options.server

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  router.get('/list', (ctx, next) => {
      ctx.body = 'Hello World!';
    });

  app.use(users.routes()).use(users.allowedMethods());
  app.use(router.routes()).use(router.allowedMethods());

  app.use(ctx => {
    ctx.status = 200
    ctx.respond = false // Bypass Koa's built-in response handling
    ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
    nuxt.render(ctx.req, ctx.res)
  })

  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start()
