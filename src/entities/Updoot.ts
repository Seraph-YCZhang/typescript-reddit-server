import { Field, Int, ObjectType } from 'type-graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Comment } from './Comment';
import { Post } from './Post';
import { User } from './User';

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
    @Field()
    @Column({ type: 'int' })
    value: number;

    @Field()
    @PrimaryColumn()
    userId: number;

    @Field(() => User)
    @ManyToOne(() => User, user => user.updoots, {
        onDelete: 'CASCADE'
    })
    user: User;

    @Field()
    @PrimaryColumn()
    postId: number;

    @Field(() => Post)
    @ManyToOne(() => Post, post => post.updoots, {
        onDelete: 'CASCADE'
    })
    post: Post;

    @Field(() => Comment)
    @ManyToOne(() => Comment, comment => comment.updoots, {
        onDelete:'CASCADE'
    })
    comment: Comment;
}
