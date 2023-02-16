import md5 from 'md5';
import { format } from 'date-fns';
import { encode } from 'js-base64';
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { ironOptions } from 'config';
import { ISession } from '../index';
import request from 'service/fetch';

export default withIronSessionApiRoute(sendVerifyCode, ironOptions);

async function sendVerifyCode(req: NextApiRequest, res: NextApiResponse) {
  const { to = '', templateId = 1 } = req.body;
  console.log('verifyCode session', req.session);
  const session: ISession = req.session;
  const AppId = '8aaf0708842397dd01847fa8ec90227a';
  const AccountId = '8aaf0708842397dd01847fa8ebb12273';
  const AuthToken = 'ad5dfa923ac84b7181b94fcab0f6124b';
  const NowDate = format(new Date(), 'yyyyMMddHHmmss');
  const sigParameter = md5(`${AccountId}${AuthToken}${NowDate}`);
  const Authorization = encode(`${AccountId}:${NowDate}`);
  console.log('sigParameter', sigParameter);
  console.log('Authorization', Authorization);
  const verifyCode = Math.floor(Math.random() * (9999 - 100)) + 1000; // 手动生成4位数的验证码
  const expireMinute = 5;
  const url = `https://app.cloopen.com:8883/2013-12-26/Accounts/${AccountId}/SMS/TemplateSMS?sig=${sigParameter}`;
  const response = await request.post(
    url,
    {
      to,
      templateId,
      appId: AppId,
      datas: [verifyCode, expireMinute],
    },
    {
      headers: {
        Authorization,
      },
    }
  );
  console.log('response', response);
  const { statusCode, statusMsg, templateSMS } = response;
  if (statusCode === '000000') {
    session.verifyCode = verifyCode;
    console.log('verifyCode', verifyCode);
    await session.save();
    res.status(200).json({
      code: 0,
      msg: statusMsg,
      data: { templateSMS },
    });
  } else {
    res.status(200).json({
      code: statusCode,
      msg: statusMsg,
    });
  }
}
