import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Avatar, Button, Dropdown, Menu, message } from 'antd';
import { HomeOutlined, LoginOutlined } from '@ant-design/icons';
import { useStore } from 'store/index';
import styles from './index.module.scss';
import Login from '../Login';
import request from 'service/fetch';
import { navs } from './config';

const Navbar: NextPage = observer(() => {
  const { pathname, push } = useRouter();
  const store = useStore();
  const [isShowLogin, setIsShowLogin] = useState(false);
  const { id, avatar } = store.user.userInfo;
  const handleGotoEditorPage = () => {
    if (!id) {
      message.error('请先登录');
      return;
    }
    push('/editor/new');
  };
  const handleLogin = () => {
    setIsShowLogin(true);
  };
  const handleClose = () => {
    setIsShowLogin(false);
  };
  const handleLogout = () => {
    request.post('/api/user/logout').then((res: any) => {
      if (res?.code === 0) {
        store.user.setUserInfo({});
      }
    });
  };
  const handleGotoPersonalPage = () => {
    push(`user/${id}`);
  };
  const renderDropDownMenu = () => {
    return (
      <Menu>
        <Menu.Item key="personal" onClick={handleGotoPersonalPage}>
          <HomeOutlined style={{ marginRight: 5 }} />
          个人主页
        </Menu.Item>
        <Menu.Item key="logout" onClick={handleLogout}>
          <LoginOutlined style={{ marginRight: 5 }} />
          退出系统
        </Menu.Item>
      </Menu>
    );
  };
  return (
    <div className={styles.navbar}>
      <section className={styles.logArea}>Blog-c</section>
      <section className={styles.linkArea}>
        {navs?.map((nav) => (
          <Link key={nav?.value} href={nav?.value}>
            <a className={pathname === nav?.value ? styles.active : ''}>
              {nav?.label}
            </a>
          </Link>
        ))}
      </section>
      <section className={styles.operationArea}>
        <Button onClick={handleGotoEditorPage}>写文章</Button>
        {id ? (
          <Dropdown overlay={renderDropDownMenu()}>
            <Avatar src={avatar} size={32} />
          </Dropdown>
        ) : (
          <Button type="primary" onClick={handleLogin}>
            登录
          </Button>
        )}
      </section>
      <Login isShow={isShowLogin} onClose={handleClose} />
    </div>
  );
});

export default Navbar;
// observer 用于提供响应式数据，否则，数据变更后，页面不会更新
