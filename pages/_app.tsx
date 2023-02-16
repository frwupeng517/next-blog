import '../styles/globals.css';
import { StoreProvider } from 'store/index';
import Layout from '../components/Layout';
import { NextPage } from 'next';

interface IProps {
  initialValue: Record<any, any>;
  Component: NextPage;
  pageProps: any;
}

function MyApp({ initialValue, Component, pageProps }: IProps) {
  const renderLayout = () => {
    if ((Component as any).layout === null) {
      return <Component {...pageProps} />
    }
    return <Layout>
    <Component {...pageProps} />
  </Layout>
  }
  return (
    <StoreProvider initialValue={initialValue}>
      {renderLayout()}
    </StoreProvider>
  );
}

MyApp.getInitialProps = async ({ ctx }: { ctx: any }) => {
  const { userId, nickname, avatar } = ctx?.req?.cookies || {};

  return {
    initialValue: {
      user: {
        userInfo: {
          id: userId,
          nickname,
          avatar,
        },
      },
    },
  };
};

export default MyApp;
