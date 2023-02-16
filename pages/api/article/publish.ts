import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import { ironOptions } from 'config';
import { prepareConnection } from 'db';
import { Article, User, Tag } from 'db/entity';
import { ISession } from '../index';
import { EXCEPTION_ARTICLE } from 'pages/api/config/codes';

export default withIronSessionApiRoute(publish, ironOptions);

async function publish(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const { title = '', content = '', tagIds = [] } = req.body;

  const db = await prepareConnection();
  const tagRepo = db.getRepository(Tag);
  const userRepo = db.getRepository(User);
  const articleRepo = db.getRepository(Article);

  const tags = await tagRepo.find({
    where: tagIds?.map((tagId: number) => ({ id: tagId })),
  });
  console.log('tags', tags);
  const user = await userRepo.findOne({
    id: session.userId,
  });

  const article = new Article();
  article.title = title;
  article.content = content;
  article.create_time = new Date();
  article.update_time = new Date();
  article.is_delete = 0;
  article.views = 0;

  if (user) {
    article.user = user;
  }

  if (tags) {
    const newTags = tags?.map((tag) => {
      tag.article_count = Number(tag?.article_count) + 1;
      return tag;
    });
    article.tags = newTags;
  }

  const resArticle = await articleRepo.save(article);

  if (resArticle) {
    res.status(200).json({
      code: 0,
      msg: '发布成功',
      data: resArticle,
    });
  } else {
    res.status(200).json({ ...EXCEPTION_ARTICLE.PUBLISH_FAILED });
  }
}
