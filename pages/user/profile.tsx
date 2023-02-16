import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Input, Button, message, Form } from 'antd';
import request from 'service/fetch';
import styles from './index.module.scss';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 4 },
};

const UserProfile = () => {
  const [form] = Form.useForm();

  useEffect(() => {
    request.get('/api/user/detail').then((res: any) => {
      if (res?.code === 0) {
        console.log('userInfo', res?.data?.userInfo);
        form.setFieldsValue(res?.data?.userInfo);
      }
    });
  }, [form]);

  const handleSubmit = (values: any) => {
    console.log('values', values);
    request.post('/api/user/update', { ...values }).then((res: any) => {
      if (res?.code === 0) {
        message.success(res?.msg);
      } else {
        message.error(res?.msg);
      }
    });
  };

  return (
    <div className="container-layout">
      <div className={styles.userProfile}>
        <h2>个人资料</h2>
        <Form
          {...layout}
          form={form}
          className={styles.form}
          onFinish={handleSubmit}
        >
          <Form.Item label="用户名" name="nickname">
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="职位" name="job">
            <Input placeholder="请输入职位" />
          </Form.Item>
          <Form.Item label="个人介绍" name="introduce">
            <Input.TextArea></Input.TextArea>
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default observer(UserProfile);
