import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { Cookie } from 'next-cookie';
import { clearCookie } from 'utils';
import { ironOptions } from 'config';
import { ISession } from '../index';

export default withIronSessionApiRoute(logout, ironOptions);

async function logout(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const cookies = Cookie.fromApiRoute(req, res);

  await session.destroy();
  clearCookie(cookies);

  res.status(200).json({
    code: 0,
    msg: '退出成功',
    data: {},
  });
}
