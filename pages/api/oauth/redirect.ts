import { setCookie } from 'utils/index';
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { Cookie } from 'next-cookie';
import { ironOptions } from 'config';
import { prepareConnection } from 'db';
import { User, UserAuth } from 'db/entity';
import { ISession } from '../index';
import request from 'service/fetch';

export default withIronSessionApiRoute(redirect, ironOptions);

async function redirect(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;

  const { code } = req?.query || {};
  console.log('code', code);

  const githubClientId = '9768524c233d5329a4e8';
  const githubClientSecrets = '64447877613b9391c299f52fae72986337da8f74';
  const url = `https://github.com/login/oauth/access_token?client_id=${githubClientId}&client_secret=${githubClientSecrets}&code=${code}`;

  const result = await request.post(
    url,
    {},
    {
      headers: {
        accept: 'application/json',
      },
    }
  );

  console.log('result', result);
  const { access_token } = result as any;

  const githubUserInfo = await request.get('https://api.github.com/user', {
    headers: {
      accept: 'application/json',
      Authorization: `token ${access_token}`,
    },
  });
  console.log('githubUserInfo', githubUserInfo);

  const cookies = Cookie.fromApiRoute(req, res);
  
  const db = await prepareConnection();
  const userAuth = await db.getRepository(UserAuth).findOne({
    identity_type: 'github',
    identifier: githubClientId
  }, {
    relations: ['user']
  });
  console.log('userAuth', userAuth);
  if (userAuth) {
    // 之前登录过的用户，直接从 user 里面获取用户信息，并且更新 credentials
    const {user: {id,nickname,avatar}} = userAuth;
    userAuth.credential = access_token;

    session.userId = id;
    session.nickname = nickname;
    session.avatar = avatar;

    await session.save();

    setCookie(cookies, {userId: id, nickname, avatar})

    // res.writeHead(302, {Location: '/'})
    res.redirect(302, '/')
  } else {
    // 创建一个新用户，包括 user 和 user_auth
    const {login='', avatar_url=''} = githubUserInfo as any;
    const user = new User();
    user.nickname = login;
    user.avatar = avatar_url;

    const userAuth = new UserAuth();
    userAuth.identity_type = 'github';
    userAuth.identifier = githubClientId;
    userAuth.credential = access_token;
    userAuth.user = user;

    const userAuthRepo = db.getRepository(UserAuth);
    const saveUserAuth = await userAuthRepo.save(userAuth);
    console.log('saveUserAuth', saveUserAuth);

    const {id, nickname, avatar} = saveUserAuth?.user || {};
    session.userId = id;
    session.nickname = nickname;
    session.avatar = avatar;

    await session.save();

    setCookie(cookies, {userId: id, nickname, avatar})
    console.log('***********', );
    // res.writeHead(302, {Location: '/'})
    res.redirect(302, '/')
  }
}
