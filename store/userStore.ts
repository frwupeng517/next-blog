export type IUserInfo = {
  id?: number | null,
  nickname?: string,
  avatar?: string,
};

export interface IUserStore {
  userInfo: IUserInfo;
  // eslint-disable-next-line no-unused-vars
  setUserInfo: (value: IUserInfo) => void;
}

const userStore = (): IUserStore => {
  return {
    userInfo: {},
    setUserInfo: function (value) {
      console.log('value', value);
      this.userInfo = value;
    },
  };
};

export default userStore;
