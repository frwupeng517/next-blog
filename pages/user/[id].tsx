import React from 'react';
import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import { Button, Avatar, Divider } from 'antd';
import {
  CodeOutlined,
  FireOutlined,
  FundViewOutlined,
} from '@ant-design/icons';
import ListItem from 'components/ListItem';
import { prepareConnection } from 'db/index';
import { User, Article } from 'db/entity';
import { IArticle } from '../api/index';
import styles from './index.module.scss';
import type { GetStaticPropsContext } from 'next';

/**
 * SSG 和 SSR 的区别
 * 1、SSG 是在打包时就提前把页面渲染好了，常用于内容比较固定的页面。也就是说要更新这些页面内容必须要重新发布代码
 *    如果一个页面包含动态路由（例如：user 目录下的 [id].tsx）且使用了 getStaticProps，就必须通过 getStaticPaths 提前获取所有的id，并且在打包时一次性预生成所有id的HTML文件
 *    在生产环境中可以看到，打包好的 user 目录下包含所有用户id和用户id.fallback 的文件，如 2.fallback, 6.fallback, 2, 6, [id], profile 这样的文件
 *
 * 2、SSR 是在每次发起请求时渲染页面，浏览器收到的是一个包含相应数据的HTML页面，这样不仅可以让浏览器快速加载页面，而且有利于SEO（爬虫可以抓取到相关数据）
 *    在生产环境中可以看到，打包好的 user 目录下只包含[id], profile 两个文件
 */

export async function getStaticPaths() {
  const db = await prepareConnection();
  const users = await db.getRepository(User).find();
  const userIds = users?.map((user) => ({ params: { id: String(user?.id) } }));
  return {
    paths: userIds,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const userId = params?.id;
  const db = await prepareConnection();
  const user = await db.getRepository(User).findOne({
    where: {
      id: Number(userId),
    },
  });
  const articles = await db.getRepository(Article).find({
    where: {
      user: {
        id: Number(userId),
      },
    },
    relations: ['user'],
  });
  return {
    props: {
      userInfo: JSON.parse(JSON.stringify(user)),
      articles: JSON.parse(JSON.stringify(articles)),
    },
  };
}

/*
export async function getServerSideProps({ params }: { params: any }) {
  const userId = params?.id;
  const db = await prepareConnection();
  const user = await db.getRepository(User).findOne({
    where: {
      id: Number(userId),
    },
  });
  const articles = await db.getRepository(Article).find({
    where: {
      user: {
        id: Number(userId),
      },
    },
    relations: ['user'],
  });
  return {
    props: {
      userInfo: JSON.parse(JSON.stringify(user)),
      articles: JSON.parse(JSON.stringify(articles)),
    },
  };
}
*/

const UserDetail = (props: any) => {
  const { userInfo = {}, articles = [] } = props;
  const viewCounts = articles?.reduce(
    (prev: any, next: any) => prev + next?.views,
    0
  );
  return (
    <div className={styles.userDetail}>
      <div className={styles.left}>
        <div className={styles.userInfo}>
          <Avatar className={styles.avatar} src={userInfo?.avatar} size={90} />
          <div>
            <div className={styles.nickname}>{userInfo?.nickname}</div>
            <div className={styles.desc}>
              <CodeOutlined /> {userInfo?.job}
            </div>
            <div className={styles.desc}>
              <FireOutlined /> {userInfo?.introduce}
            </div>
          </div>
          <Link href="/user/profile">
            <Button>编辑个人资料</Button>
          </Link>
        </div>
        <Divider />
        <div className={styles.article}>
          {articles?.map((article: IArticle) => (
            <div key={article?.id}>
              <ListItem article={article} />
              <Divider />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.achievement}>
          <div className={styles.header}>个人成就</div>
          <div className={styles.number}>
            <div className={styles.wrapper}>
              <FundViewOutlined />
              <span>文章被阅读 {viewCounts} 次</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(UserDetail);
