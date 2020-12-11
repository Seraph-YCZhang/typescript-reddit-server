import { ReadStream } from 'fs';
import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './Post';

@InputType()
export class FileType {
    @Field()
    filename: string;
    @Field()
    mimetype: string;
    @Field()
    encoding: string;
    stream?: ReadStream;
}

@ObjectType()
export class UploadedFileResponse {
    filename: string;
    mimetype: string;
    encoding: string;
    url: string;
}

@ObjectType()
@Entity()
export class File extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => Int)
    @PrimaryColumn()
    postId: number;

    @Field(() => Post)
    @ManyToOne(() => Post, post => post.files, {
        onDelete: 'CASCADE'
    })
    post: Post;

    @Field()
    @Column()
    url: string;

    @Field()
    @Column()
    filename: string;

    @Field()
    @Column()
    mimetype: string;

    @Field()
    @Column()
    encoding: string;
}
