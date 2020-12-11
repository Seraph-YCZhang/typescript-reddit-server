import { Post } from '../entities/Post';
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    InputType,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware
} from 'type-graphql';
import { MyContext } from '../types';
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';
import { Updoot } from '../entities/Updoot';
import { User } from '../entities/User';
import { Comment } from '../entities/Comment';
import { FileType, UploadedFileResponse, File } from '../entities/File';
import { AWSS3Uploader } from '../utils/awsS3Uploader';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];
    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 50);
    }

    @FieldResolver(() => User)
    creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
        return userLoader.load(post.creatorId);
    }

    @FieldResolver(() => [Comment], { nullable: true })
    comments(@Root() post: Post) {
        return Comment.find({ postId: post.id });
    }

    @FieldResolver(() => [File], { nullable: true })
    files(@Root() post: Post) {
        return File.find({ postId: post.id });
    }

    @FieldResolver(() => Int, { nullable: true })
    async voteStatus(
        @Root() post: Post,
        @Ctx() { updootLoader, req }: MyContext
    ) {
        if (!req.session.userId) {
            return null;
        }
        const updoot = await updootLoader.load({
            postId: post.id,
            userId: req.session.userId
        });
        return updoot ? updoot.value : null;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const isUpvote = value !== -1;
        const realValue = isUpvote ? 1 : -1;
        const { userId } = req.session;
        const updoot = await Updoot.findOne({ where: { postId, userId } });
        if (updoot && updoot.value !== realValue) {
            await getConnection().transaction(async tm => {
                await tm.query(
                    `update updoot 
                set value = $1
                where "postId" = $2 and "userId" = $3`,
                    [realValue, postId, userId]
                );
                await tm.query(
                    `update post 
                set points = points + $1
                where id = $2`,
                    [2 * realValue, postId]
                );
            });
        } else if (!updoot) {
            await getConnection().transaction(async tm => {
                await tm.query(
                    `insert into updoot ("userId", "postId", value)
                values ($1, $2, $3)`,
                    [userId, postId, realValue]
                );
                await tm.query(
                    `            update post 
                set points = points + $1
                where id = $2`,
                    [realValue, postId]
                );
            });
        }
        // await Updoot.insert({
        //     userId,
        //     postId,
        //     value: realValue
        // });
        // await getConnection().query(
        //     `start transaction;
        //     insert into updoot ("userId", "postId", value)
        //     values (${userId}, ${postId}, ${realValue});
        //     update post
        //     set points = points + ${realValue}
        //     where id = ${postId};
        //     commit;`
        // );
        return true;
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('filter', () => String, { nullable: true }) filter: string | null,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit) + 1;
        const realLimitPlusOne = realLimit + 1;
        const replacements: any[] = [realLimitPlusOne];
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }
        const posts = await getConnection().query(
            `
            select p.*
            from post p 
            ${cursor ? `where p."createdAt" < $2` : ''}
            ${
                filter
                    ? cursor
                        ? `and (p.title like '%${filter}%' or p.text like '%${filter}%')`
                        : `where p.title like '%${filter}%' or p.text like '%${filter}%'`
                    : ''
            }
            order by p."createdAt" DESC
            limit $1
        `,
            replacements
        );

        // const qb = getConnection()
        //     .getRepository(Post)
        //     .createQueryBuilder('p')
        //     .innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"')
        //     .orderBy('p."createdAt"', 'DESC')
        //     .take(realLimitPlusOne);
        // if (cursor) {
        //     qb.where('p."createdAt" < :cursor', {
        //         cursor: new Date(parseInt(cursor))
        //     });
        // }
        // const posts = await qb.getMany();
        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne
        };
    }

    @Query(() => Post, { nullable: true })
    post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id);
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('text', () => String) text: string,
        @Arg('title', () => String) title: string,
        @Arg('file', () => GraphQLUpload, { nullable: true }) file: FileUpload,
        @Ctx() { req }: MyContext
    ): Promise<(Post & UploadedFileResponse) | Post> {
        let fileRet;
        const post = await Post.create({
            text,
            title,
            creatorId: req.session.userId
        }).save();
        if (file) {
            // console.log(process.env.AWS_ACCESS_KEY_ID);
            const s3Uploader = new AWSS3Uploader({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
                destinationBucketName: process.env.AWS_BUCKET_NAME as string,
                region: 'us-east-2'
            });

            fileRet = await s3Uploader.singleFileUpload.bind(s3Uploader)(file);
            const fileObj = await File.create({
                postId: post.id,
                ...fileRet
            } as Object).save();
            console.log(fileObj);
        }
        const retObject = { ...post, ...fileRet };
        return retObject;
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title') title: string,
        @Arg('text') text: string,
        @Ctx() { req }: MyContext
    ): Promise<Post | null> {
        const result = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title, text })
            .where('id = :id and "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId
            })
            .returning('*')
            .execute();
        return result.raw[0];
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<boolean> {
        // const post = await Post.findOne(id);
        // if(!post){
        //     return false;
        // }
        // if(post.creatorId !== req.session.userId) {
        //     throw new Error('not authorized')
        // }

        await Post.delete({ id, creatorId: req.session.userId });
        return true;
    }
}
