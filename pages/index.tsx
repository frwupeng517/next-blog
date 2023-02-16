import { Divider } from 'antd';
import { prepareConnection } from 'db';
import { Article } from 'db/entity';
import { IArticle } from 'pages/api/index';
import ListItem from 'components/ListItem';

interface IProps {
  articles: IArticle[];
}

export async function getServerSideProps() {
  const db = await prepareConnection();
  const articles = await db.getRepository(Article).find({
    relations: ['user'],
    order: { create_time: 'DESC' },
  });
  console.log('articles', articles);
  return {
    props: {
      articles: JSON.parse(JSON.stringify(articles || [])),
    },
  };
}

const Home = (props: IProps) => {
  const { articles } = props;
  return (
    <div className="container-layout">
      {articles?.map((article) => (
        <>
          <ListItem article={article} key={article.id} />
          <Divider />
        </>
      ))}
    </div>
  );
};

export default Home;
