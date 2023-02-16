import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import {User} from 'db/entity/user';
import {Article} from 'db/entity/article';

@Entity({ database: 'next_blog', name: 'tags' })
export class Tag extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!:number;

  @Column()
  title!: string;

  @Column()
  icon!: string;

  @Column()
  follow_count!: Number;

  @Column()
  article_count!: Number;

  @ManyToMany(() => User, {
    cascade: true
  })
  @JoinTable({
    name: 'tags_users_rel',
    joinColumn: {
      name: 'tag_id'
    },
    inverseJoinColumn: {
      name: 'user_id'
    }
  })
  users!: User[]

  @ManyToMany(() => Article, (article) => article.tags)
  @JoinTable({
    name: 'tags_articles_rel',
    joinColumn: {
      name: 'tag_id'
    },
    inverseJoinColumn: {
      name: 'article_id'
    }
  })
  article!: Article[];
}
