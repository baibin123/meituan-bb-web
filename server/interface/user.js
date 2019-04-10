import Router from 'koa-router';
import Redis from 'koa-redis';
import nodeMailer from 'nodemailer';
import User from '../dbs/models/user'
import Passport from './utils/passport'
import Email from '../dbs/config';
import axios from './utils/axios'

const router = new Router({
  prefix:'/users'
});

let Store = new Redis().client;

router.post('/signup',async (ctx) => {
  const { username, password, email, code } = ctx.request.body;
  if (code) {
    const saveCode = await Store.hget(`nodeMail${username}`,'code');
    const saveExpire = await Store.hget(`nodeMail${username}`,'expire');
    if (code === saveCode) {
      if (new date().getTime() - saveExpire > 0) {
        ctx.body = {
          code: -1,
          msg: '验证码已过期，请重新尝试'
        }
        return false
      }
    } else {
      ctx.body = {
        code: -1,
        msg: '请填写正确的验证码'
      }
      return false
    }
  } else {
    ctx.body = {
      code: -1,
      msg: '请填写验证码'
    }
    return false
  }

  const user = User.find({
    where: {
      username: username
    }
  });
  if (user) {
    ctx.body = {
      code: -1,
      msg: '已被注册'
    }
    return false;
  }

  const nuser = User.create({
    username,
    password,
    email
  });

  if (nuser) {
    const response = await axios.post('/users/login',{username, password});
    if (response && response.data.code === 0) {
      ctx.body = {
        code: 0,
        msg: '注册成功'
      }
    } else {
      ctx.body = {
        code: 0,
        msg: response.data.msg
      }
    }
  } else {
    ctx.body = {
      code: -1,
      msg: '注册失败'
    }
    return false;
  }
});

router.post('/signin', async (ctx, next) => {
  return Passport.authenticate('local', function (err, user, info, status) {
    if (err) {
      ctx.body = {
        code: -1,
        msg: err
      }
    } else {
      if (user) {
        ctx.body = {
          code: 0,
          msg: '登录成功',
          user
        }
        return ctx.login(user);
      } else {
        ctx.body = {
          code: -1,
          msg: info
        }
      }
    }
  })(ctx, next);
});

router.post('/verify', async(ctx, next) => {
  const username = ctx.request.body.username;
  const saveExpire = await Store.hget(`nodemail:${username}`, 'expire');
  if (saveExpire && new Date().getTime() - saveExpire < 0) {
    ctx.body = {
      code: -1,
      msg: '验证码请求过于频繁'
    }
    return false
  }
  const transporter = nodeMailer.createTransport({
    host: Email.smtp.host,
    port: 587,
    secure: false,
    auth: {
      user: Email.smtp.user,
      pass: Email.smtp.pass
    }
  });
  const ko = {
    code: Email.smtp.code(),
    expire: Email.smtp.expire(),
    email: ctx.request.body.email,
    user: ctx.request.body.username
  }
  const mailOptions = {
    from: `认证邮件 <${Email.smtp.user}>`,
    to: ko.email,
    subject:'注册码',
    html:`您的邀请码是${ko.code}`
  }
  await transporter.sendMail(mailOptions,(error, info) => {
    if (error) {
      return console.log(`邮件发送失败：${error}`);
    } else {
      Store.hmset(`nodemail:${ko.user}`,'code', ko.code);
      Store.hmset(`nodemail:${ko.user}`,'expire', ko.expire );
    }
    ctx.body = {
      code: 0,
      msg: '验证码已发送'
    }
  })
});

router.get('/exit', async(ctx, next) => {
  await ctx.logout();
  if (!ctx.isAuthenticated()) {
    ctx.body = {
      code: -1,
      msg: '退出失败'
    }
  } else {
    ctx.body = {
      code: 0
    }
  }
});

router.get('/getUser', async(ctx) => {
  if (ctx.isAuthenticated()) {
    const {username, email} = ctx.session.passport.user;
    ctx.body = {
      code: 0,
      username,
      email
    }
  } else {
    ctx.body = {
      code: -1,
      username: '',
      email: '',
      msg: '您未登录'
    }
  }
});

export default router
