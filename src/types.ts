import { Request, Response } from 'express';
import { ReadStream } from 'fs';
import { Redis } from 'ioredis';
import { File, FileType, UploadedFileResponse } from './entities/File';
import { createUpdootLoader } from './utils/createUpdootLoader';
import { createUserLoader } from './utils/createUserLoader';

import { FileUpload } from 'graphql-upload';
export type MyContext = {
    req: Request & { session: { userId: number } };
    res: Response;
    redis: Redis;
    userLoader: ReturnType<typeof createUserLoader>;
    updootLoader:ReturnType<typeof createUpdootLoader>;
};

export interface IUploader {
    singleFileUpload: (
        file: FileUpload
    ) => Promise<UploadedFileResponse | null>;
}
