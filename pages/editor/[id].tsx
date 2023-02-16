import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import { prepareConnection } from 'db';
import { ChangeEvent, useState, useEffect } from 'react';
import { Input, Button, message, Select } from 'antd';
import { useRouter } from 'next/router';
import {ITag} from '../api/index';
import request from "service/fetch";
import { Article } from 'db/entity';
import { IArticle } from 'pages/api/index';
import styles from './index.module.scss';

interface IProps {
  article: IArticle;
}

export async function getServerSideProps({ params }:any) {
  // params { id: '1' }
  const articleId = params?.id;
  const db = await prepareConnection();
  const articleRepo = db.getRepository(Article);
  const article = await articleRepo.findOne({
    where: {
      id: articleId,
    },
    relations: ['user'],
  });
  return {
    props: {
      article: JSON.parse(JSON.stringify(article)),
    },
  };
}

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const ModifyEditor = ({article}: IProps) => {
  console.log('article', article);
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [allTags, setAllTags] = useState<ITag[]>([]);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const {push, query} = useRouter()
  const articleId = Number(query?.id);

  useEffect(() => {
    request('/api/tag/get').then((res:any) => {
      if (res?.code === 0) {
        const {allTags} = res?.data || [];
        setAllTags(allTags);
      }
    })
  }, [])

  const handlePublish = () => {
    if (!title) {
      message.error('请输入文章标题');
      return;
    }
    request.post('/api/article/update', {
      id: articleId,
      title,
      tagIds,
      content
    }).then((res:any) => {
      if (res?.code === 0) {
        push(articleId ? `/article/${articleId}` : '/');
        message.success('更新成功！');
      } else {
        message.error(res?.msg || '更新失败')
      }
    })
  };
  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event?.target?.value);
  };
  const handleContentChange = (content: any) => {
    setContent(content);
  }
  const handleSelectChange = (tagIds: []) => {
    setTagIds(tagIds);
  }
  return (
    <div className={styles.container}>
      <div className={styles.operation}>
        <Input className={styles.title} placeholder="请输入文章标题" value={title} onChange={handleTitleChange} />
        <Select
          className={styles.tag}
          mode="multiple"
          allowClear
          placeholder="请选择标签"
          onChange={handleSelectChange}
        >
          {allTags?.map((tag) => <Select.Option key={tag?.id} value={tag?.id}>{tag?.title}</Select.Option>)}
        </Select>
        <Button type="primary" onClick={handlePublish} className={styles.btn}>
          发布
        </Button>
      </div>
      <MDEditor height={1080} value={content} onChange={handleContentChange} />
    </div>
  );
};

(ModifyEditor as any).layout = null;
export default ModifyEditor;
