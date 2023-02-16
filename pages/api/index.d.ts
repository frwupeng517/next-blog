import { IronSession } from 'iron-session';
import { IUserInfo } from 'store/userStore';

export type ISession = IronSession & Record<string, any>;

export type IComment = {
  id: number,
  content: string,
  create_time: Date,
  update_time: Date,
};

export type IArticle = {
  id: number,
  title: string,
  content: string,
  views: number,
  create_time: Date,
  update_time: Date,
  user: IUserInfo,
  comments: IComment[],
};

export type IUser = {
  id: number,
  avatar: string,
  nickname: string,
};

export type ITag = {
  id: number,
  title: string,
  icon: string,
  follow_count: number,
  article_count: number,
  users: IUser[],
};
