// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { mock } from 'mockjs';

type Data = {
  name: string,
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // res.status(200).json({ name: 'John Doe' })
  res.status(200).json(
    mock({
      number: '1-20.3',
    })
  );
}
