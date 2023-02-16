import { useEffect, useState } from 'react';
import { Button, message, Tabs } from 'antd';
import * as ANTD_ICONS from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import request from 'service/fetch';
import { useStore } from 'store/index';
import {ITag} from '../api/index';
import styles from './index.module.scss';

const Tag = () => {
  const store = useStore();
  const { id:userId } = store?.user?.userInfo || {};
  const [followTags, setFollowTags] = useState<ITag[]>([]);
  const [allTags, setAllTags] = useState<ITag[]>([]);
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    request('/api/tag/get').then((res:any) => {
      if (res?.code === 0) {
        const {followTags=[], allTags=[]} = res?.data || {};
        setFollowTags(followTags);
        setAllTags(allTags);
      }
    })
  }, [needRefresh])

  const handleUnFollow = (tagId: number) => {
    request.post('/api/tag/follow', {
      tagId,
      type: 'unfollow'
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('取关成功！');
        setNeedRefresh(!needRefresh)
      } else {
        message.error(res?.msg || '取关失败！');
      }
    })
  }

  const handleFollow = (tagId: number) => {
    request.post('/api/tag/follow', {
      tagId,
      type: 'follow'
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('关注成功！');
        setNeedRefresh(!needRefresh)
      } else {
        message.error(res?.msg || '关注失败！');
      }
    })
  }

  const tabItems = [
    { label: '已关注标签', key: 'follow', children: (
      <div className={styles.tags}>
        {followTags?.map(tag => (
          <div key={tag?.title} className={styles.tagWrapper}>
            <div>{(ANTD_ICONS as any)[tag?.icon].render()}</div>
            <div className={styles.title}>{tag?.title}</div>
            <div>{tag?.follow_count} 关注 {tag?.article_count} 文章</div>
            {
              tag?.users?.find((user) => Number(user?.id) === Number(userId)) ? (
                <Button type="primary" onClick={() => handleUnFollow(tag?.id)}>已关注</Button>
              ) : (
                <Button onClick={() => handleFollow(tag?.id)}>关注</Button>
              )
            }
          </div>
        ))}
      </div>
    ) }, // 务必填写 key
    { label: '全部标签', key: 'all', children: (
      <div className={styles.tags}>
        {allTags?.map(tag => (
          <div key={tag?.title} className={styles.tagWrapper}>
            <div>{(ANTD_ICONS as any)[tag?.icon].render()}</div>
            <div className={styles.title}>{tag?.title}</div>
            <div>{tag?.follow_count} 关注 {tag?.article_count} 文章</div>
            {
              tag?.users?.find((user) => Number(user?.id) === Number(userId)) ? (
                <Button type="primary" onClick={() => handleUnFollow(tag?.id)}>已关注</Button>
              ) : (
                <Button onClick={() => handleFollow(tag?.id)}>关注</Button>
              )
            }
          </div>
        ))}
      </div>
    ) },
  ];
  const onChange = (key: string) => {
    console.log(key);
  };
  return (
    <div className="container-layout">
      <Tabs defaultActiveKey="follow" onChange={onChange} items={tabItems} />
    </div>
  );
};

export default observer(Tag);
