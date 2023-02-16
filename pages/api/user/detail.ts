import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { ironOptions } from 'config';
import { prepareConnection } from 'db';
import { User } from 'db/entity';
import { ISession } from '../index';
import { EXCEPTION_USER } from 'pages/api/config/codes';

export default withIronSessionApiRoute(detail, ironOptions);

async function detail(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const { userId } = session;

  const db = await prepareConnection();
  const userRepo = db.getRepository(User);
  const user = await userRepo.findOne({
    where: {
      id: Number(userId),
    },
  });

  if (user) {
    res?.status(200).json({
      code: 0,
      msg: '',
      data: {
        userInfo: user,
      },
    });
  } else {
    res.status(200).json({ ...EXCEPTION_USER.NOT_FOUND });
  }
}
