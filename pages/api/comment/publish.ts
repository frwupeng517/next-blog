import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { ironOptions } from 'config';
import { prepareConnection } from 'db';
import { Article, User, Comment } from 'db/entity';
import { ISession } from '../index';
import { EXCEPTION_COMMENT } from 'pages/api/config/codes';

export default withIronSessionApiRoute(publish, ironOptions);

async function publish(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const { content = '', articleId = 0 } = req.body;

  const db = await prepareConnection();
  const userRepo = db.getRepository(User);
  const articleRepo = db.getRepository(Article);
  const commentRepo = db.getRepository(Comment);
  const user = await userRepo.findOne({
    id: session.userId,
  });
  const article = await articleRepo.findOne({
    id: articleId,
  });
  const comment = new Comment();
  comment.content = content;
  comment.create_time = new Date();
  comment.update_time = new Date();
  if (user) {
    comment.user = user;
  }
  if (article) {
    comment.article = article;
  }

  const resArticle = await commentRepo.save(comment);

  if (resArticle) {
    res.status(200).json({
      code: 0,
      msg: '发布成功',
      data: resArticle,
    });
  } else {
    res.status(200).json({ ...EXCEPTION_COMMENT.PUBLISH_FAILED });
  }
}
