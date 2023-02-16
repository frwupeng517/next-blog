import type { NextPage } from 'next';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import { ChangeEvent, useState, useEffect } from 'react';
import { Input, Button, message, Select } from 'antd';
import { useRouter } from 'next/router';
import {useStore} from 'store/index';
import {ITag} from '../api/index';
import request from "service/fetch";
import styles from './index.module.scss';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const NewBlogPage: NextPage = () => {
  const [content, setContent] = useState('**Hello world!!!**');
  const [title, setTitle] = useState('');
  const [allTags, setAllTags] = useState<ITag[]>([]);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const {push} = useRouter()
  const store = useStore();
  const {id:userId} = store.user.userInfo;

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
    request.post('/api/article/publish', {
      title,
      tagIds,
      content
    }).then((res:any) => {
      if (res?.code === 0) {
        push(userId ? `/user/${userId}` : '/');
        message.success('发布成功！');
      } else {
        message.error(res?.msg || '发布失败')
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

(NewBlogPage as any).layout = null;
export default NewBlogPage;
