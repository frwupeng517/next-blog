import { message } from 'antd';
import { ChangeEvent, useState } from 'react';
import { observer } from 'mobx-react-lite';
import request from 'service/fetch';
import { useStore } from 'store/index';
import CountDown from '../CountDown';
import styles from './index.module.scss';

interface IProps {
  isShow: boolean;
  onClose: Function;
}

const Login = observer((props: IProps) => {
  const { isShow = false, onClose } = props;
  const [isShowVerifyCode, setIsShowVerifyCode] = useState(false);
  const [form, setForm] = useState({
    phone: '',
    verify: '',
  });
  const store = useStore();
  console.log('store', store);
  const handleClose = () => {
    onClose && onClose();
  };
  const handleGetVerifyCode = () => {
    if (!form?.phone) {
      message.warning('请输入手机号');
      return;
    }
    request
      .post('/api/user/sendVerifyCode', {
        to: form?.phone,
        templateId: 1, // 测试模板id是1
      })
      .then((res: any) => {
        console.log('res', res);
        if (res?.code === 0) {
          setIsShowVerifyCode(true);
        } else {
          message.error(res?.msg || '未知错误');
        }
      });
  };
  const handleLogin = () => {
    request
      .post('/api/user/login', { ...form, identity_type: 'phone' })
      .then((res: any) => {
        if (res?.code === 0) {
          // 登录成功
          store.user.setUserInfo(res?.data);
          console.log('000', store);
          handleClose();
        } else {
          message.error(res?.msg || '未知错误');
        }
      });
  };
  const handleOAuthGithub = () => {
    const githubClientId = '9768524c233d5329a4e8';
    const redirectUri = 'http://localhost:3000/api/oauth/redirect';
    window.open(
      `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}`
    );
  };
  const handleFormChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evt.target;
    setForm({
      ...form,
      [name]: value,
    });
  };
  const handleCountDownEnd = () => {
    setIsShowVerifyCode(false);
  };

  return isShow ? (
    <div className={styles.loginArea}>
      <div className={styles.loginBox}>
        <div className={styles.loginTitle}>
          <div>手机号登录</div>
          <div className={styles.close} onClick={handleClose}>
            x
          </div>
        </div>
        <input
          name="phone"
          type="text"
          placeholder="请输入手机号"
          value={form.phone}
          onChange={handleFormChange}
        />
        <div className={styles.verifyCodeArea}>
          <input
            name="verify"
            type="text"
            placeholder="请输入验证码"
            value={form.verify}
            onChange={handleFormChange}
          />
          <span className={styles.verifyCode} onClick={handleGetVerifyCode}>
            {isShowVerifyCode ? (
              <CountDown time={10} onEnd={handleCountDownEnd} />
            ) : (
              '获取验证码'
            )}
          </span>
        </div>
        <div className={styles.loginBtn} onClick={handleLogin}>
          登录
        </div>
        <div className={styles.otherLogin} onClick={handleOAuthGithub}>
          使用 Github 登录
        </div>
        <div className={styles.loginPrivacy}>
          注册登录即表示同意
          <a
            href="https://www.imooc.com/help/detail/222"
            rel="noreferrer"
            target="_blank"
          >
            隐私政策
          </a>
        </div>
      </div>
    </div>
  ) : null;
});

export default Login;
