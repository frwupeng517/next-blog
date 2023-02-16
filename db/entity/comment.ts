import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import {User} from 'db/entity/user';
import {Article} from 'db/entity/article';

@Entity({ database: 'next_blog', name: 'comments' })
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!:number;

  @Column()
  content!: string;

  @Column()
  create_time!: Date;

  @Column()
  update_time!: Date;

  @ManyToOne(() => User)
  @JoinColumn({name: 'user_id'})
  user!: User;

  @ManyToOne(() => Article)
  @JoinColumn({name: 'article_id'})
  article!: Article;
}
