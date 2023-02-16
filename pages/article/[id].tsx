import { useState } from 'react';
import Link from 'next/link';
import Markdown from 'markdown-to-jsx';
import { Avatar, Button, Divider, Input, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { useStore } from 'store/index';
import { format } from 'date-fns';
import { prepareConnection } from 'db';
import { Article } from 'db/entity';
import { IArticle } from 'pages/api/index';
import request from 'service/fetch';
import styles from './index.module.scss';

interface IProps {
  article: IArticle;
}

export async function getServerSideProps({ params }: any) {
  // params { id: '1' }
  const articleId = params?.id;
  const db = await prepareConnection();
  const articleRepo = db.getRepository(Article);
  const article = await articleRepo.findOne({
    where: {
      id: articleId,
    },
    relations: ['user', 'comments', 'comments.user'],
  });
  return {
    props: {
      article: JSON.parse(JSON.stringify(article)),
    },
  };
}

const ArticleDetail = observer((props: IProps) => {
  const { article } = props;
  const store = useStore();
  const [inputVal, setInputVal] = useState('');
  const [comments, setComments] = useState(article?.comments || []);
  const {
    title,
    views,
    content,
    update_time,
    id: articleId,
    user: { nickname, avatar, id: userId },
  } = article;
  const loginUserInfo = store?.user?.userInfo;
  const handleComment = () => {
    request
      .post('/api/comment/publish', {
        articleId,
        content: inputVal,
      })
      .then((res: any) => {
        if (res?.code === 0) {
          message.success(res?.msg);
          const newComments = {
            id: Math.random(),
            create_time: new Date(),
            update_time: new Date(),
            content: inputVal,
            user: {
              avatar: loginUserInfo?.avatar,
              nickname: loginUserInfo?.nickname,
            },
          };
          setComments([newComments, ...comments]);
          setInputVal('');
        } else {
          message.error('发布失败');
        }
      });
  };
  return (
    <div>
      <div className="container-layout">
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.user}>
          <Avatar src={avatar} size={50} />
          <div className={styles.info}>
            <div className={styles.name}>{nickname}</div>
            <div className={styles.date}>
              {format(new Date(update_time), 'yyyy-MM-dd hh:mm:ss')}
              <div>阅读 {views}</div>
              {Number(loginUserInfo?.id) === Number(userId) && (
                <Link href={`/editor/${articleId}`}>编辑</Link>
              )}
            </div>
          </div>
        </div>
        <Markdown className={styles.markdown}>{content}</Markdown>
      </div>
      <div className={styles.divider} />
      <div className="container-layout">
        <div className={styles.comment}>
          <h3>评论</h3>
          {loginUserInfo?.id && (
            <div className={styles.enter}>
              <Avatar size={40} src={avatar} />
              <div className={styles.content}>
                <Input.TextArea
                  placeholder="请输入评论"
                  rows={4}
                  value={inputVal}
                  onChange={(event) => setInputVal(event?.target?.value)}
                />
                <Button type="primary" onClick={handleComment}>
                  发表评论
                </Button>
              </div>
            </div>
          )}
          <Divider />
          <div className={styles.display}>
            {comments?.map((comment: any) => (
              <div key={comment.id} className={styles.wrapper}>
                <Avatar size={40} src={comment?.user?.avatar} />
                <div className={styles.info}>
                  <div className={styles.name}>
                    <div>{comment?.user?.nickname}</div>
                    <div className={styles.date}>
                      {format(
                        new Date(comment?.update_time),
                        'yyyy-MM-dd hh:mm:ss'
                      )}
                    </div>
                  </div>
                  <div className={styles.content}>{comment?.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ArticleDetail;
