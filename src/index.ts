import 'reflect-metadata';
import { COOKIE_NAME, __prod__ } from './constants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import { Updoot } from './entities/Updoot';
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createUpdootLoader';
import { Comment } from './entities/Comment';
import { CommentResolver } from './resolvers/comment';
import { File } from './entities/File';
import { graphqlUploadExpress } from 'graphql-upload';
import dotenv from 'dotenv';
//re
const main = async () => {
    dotenv.config();
    const conn = await createConnection({
        type: 'postgres',
        database: 'reddit2',
        username: 'postgres',
        password: 'postgrespwd',
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [Post, User, Updoot, Comment, File]
    });
    await conn.runMigrations();
    // await Post.delete({})
    const app = express();
    
    const RedisStore = connectRedis(session);
    const redis = new Redis();
    app.use(
        cors({
            origin: 'http://localhost:3000',
            credentials: true
        })
    );
    
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ client: redis, disableTouch: true }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: 'lax', // csrf
                secure: __prod__ // https only
            },
            secret: 'sevencat',
            resave: false,
            saveUninitialized: false
        })
    );
    
    const apolloServer = new ApolloServer({
        typeDefs: /* GraphQL */ `
            scalar Upload
        `,
        schema: await buildSchema({
            resolvers: [
                HelloResolver,
                PostResolver,
                UserResolver,
                CommentResolver
            ],
            validate: false
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            userLoader: createUserLoader(),
            updootLoader: createUpdootLoader()
        }),
        introspection:true,
        uploads: false
    });
    app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    app.listen(4000, () => {
        console.log('server started on localhost:4000');
    });
};
main().catch(err => console.log(err));
