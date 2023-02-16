import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { ironOptions } from 'config';
import { prepareConnection } from 'db';
import { User } from 'db/entity';
import { ISession } from '../index';
import { EXCEPTION_USER } from 'pages/api/config/codes';

export default withIronSessionApiRoute(update, ironOptions);

async function update(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const { userId } = session;
  const { nickname = '', job = '', introduce = '' } = req?.body || {};

  const db = await prepareConnection();
  const userRepo = db.getRepository(User);
  const user = await userRepo.findOne({
    where: {
      id: Number(userId),
    },
  });

  if (user) {
    user.nickname = nickname;
    user.job = job;
    user.introduce = introduce;
    const resUser = await userRepo.save(user);
    if (resUser) {
      res?.status(200).json({
        code: 0,
        msg: '修改成功',
        data: resUser,
      });
    } else {
      res?.status(200).json({
        code: 500,
        msg: '修改失败',
        data: resUser,
      });
    }
  } else {
    res.status(200).json({ ...EXCEPTION_USER.NOT_FOUND });
  }
}
