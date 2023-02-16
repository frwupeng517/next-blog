import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { Cookie } from 'next-cookie';
import { setCookie } from 'utils';
import { ironOptions } from 'config';
import { prepareConnection } from 'db';
import { User, UserAuth } from 'db/entity';
import { ISession } from '../index';

export default withIronSessionApiRoute(login, ironOptions);

async function login(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  console.log('login session', req.session);
  const cookies = Cookie.fromApiRoute(req, res);
  const { phone = '', verify = '', identity_type = 'phone' } = req.body;
  console.log('==========  db is connection success =========');
  const db = await prepareConnection();
  const userAuthRepo = db.getRepository(UserAuth);
  if (String(session.verifyCode) === String(verify)) {
    // 验证码正确，在 user_auths 表中查找 identity_type 是否有记录
    const userAuth = await userAuthRepo.findOne({
      where: {
        identity_type,
        identifier: phone,
      },
      relations: ['user'],
    });
    if (userAuth) {
      // 已存在的用户
      const {
        user: { id, nickname, avatar },
      } = userAuth;
      session.userId = id;
      session.nickname = nickname;
      session.avatar = avatar;
      await session.save();
      setCookie(cookies, { userId: id, nickname, avatar });
      res?.status(200).json({
        code: 0,
        msg: '登录成功',
        data: {
          id,
          nickname,
          avatar,
        },
      });
    } else {
      // 新用户，自动注册
      const user = new User();
      user.nickname = `用户_${Math.floor(Math.random() * 10000)}`;
      user.avatar = '/images/avatar.png';
      user.job = '暂无';
      user.introduce = '暂无';

      const userAuth = new UserAuth();
      userAuth.identifier = phone;
      userAuth.identity_type = identity_type;
      userAuth.credential = session.verifyCode;
      userAuth.user = user;

      const resUserAuth = await userAuthRepo.save(userAuth);
      const {
        user: { id, nickname, avatar },
      } = resUserAuth;
      session.userId = id;
      session.nickname = nickname;
      session.avatar = avatar;
      await session.save();
      setCookie(cookies, { userId: id, nickname, avatar });
      res?.status(200).json({
        code: 0,
        msg: '登录成功',
        data: {
          id,
          nickname,
          avatar,
        },
      });
    }
  } else {
    res?.status(200).json({ code: -1, msg: '验证码错误' });
  }
}
