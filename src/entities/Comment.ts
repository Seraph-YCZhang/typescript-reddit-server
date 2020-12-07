import { Field, Int, ObjectType } from 'type-graphql';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Post } from './Post';
import { Updoot } from './Updoot';
import { User } from './User';

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    title: string;

    @Field()
    @Column()
    text!: string;

    @Field()
    @Column({ type: 'int', default: 0 })
    points!: number;

    @Field(() => Int, { nullable: true })
    voteStatus: number | null;

    @Field()
    @Column()
    creatorId: number;

    @Field()
    @ManyToOne(() => User, user => user.comments)
    creator: User;

    @Field(() => Int, { nullable: true })
    @Column({ nullable: true })
    targetUserId: number;

    @Field()
    @ManyToOne(() => User)
    targetUser: User;

    @Field(() => Int)
    @Column()
    postId: number;

    @ManyToOne(() => Post, post => post.comments)
    post: Post;

    @OneToMany(() => Updoot, updoot => updoot.comment)
    updoots: Updoot[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}
