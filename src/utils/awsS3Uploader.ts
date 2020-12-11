import AWS from 'aws-sdk';
import { File, FileType, UploadedFileResponse } from 'src/entities/File';
import { IUploader } from 'src/types';
import stream from 'stream';
import { FileUpload } from 'graphql-upload';
import { v4 } from 'uuid';
import { extname } from 'path';
type S3UploadConfig = {
    accessKeyId: string;
    secretAccessKey: string;
    destinationBucketName: string;
    region?: string;
};

type S3UploadStream = {
    writeStream: stream.PassThrough;
    promise: Promise<AWS.S3.ManagedUpload.SendData>;
};

export class AWSS3Uploader implements IUploader {
    private s3: AWS.S3;
    public config: S3UploadConfig;

    constructor(config: S3UploadConfig) {
        AWS.config = new AWS.Config();
        AWS.config.update({
            region: config.region || 'us-east-2',
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey
        });
        this.s3 = new AWS.S3();
        this.config = config;
    }
    private createDestinationFilePath(fileName: string): string {
        return fileName;
    }

    private createUploadStream(key: string): S3UploadStream {
        const pass = new stream.PassThrough();
        return {
            writeStream: pass,
            promise: this.s3
                .upload({
                    Bucket: this.config.destinationBucketName,
                    Key: key,
                    Body: pass
                })
                .promise()
        };
    }

    async singleFileUpload(
        file: FileUpload
    ): Promise<UploadedFileResponse | null> {
        console.log(file)
        const { createReadStream, filename, mimetype, encoding } = await file;
        console.log(createReadStream, filename, mimetype, encoding);
        // console.log(this.s3)
        const stream = createReadStream();
        // console.log(this.config)
        const { Location } = await this.s3
            .upload({
                // (C)
                Body: stream,
                Key: `${v4()}${extname(filename)}`,
                ContentType: mimetype,
                Bucket: this.config.destinationBucketName
            })
            .promise();

        return {
            filename,
            mimetype,
            encoding,
            url: Location // (D)
        };
        // const { stream, filename, mimetype, encoding } = await file;
        // console.log(stream, filename, mimetype, encoding)
        // if (!stream) {
        //     return null;
        // }
        // // Create the destination file path
        // const filePath = this.createDestinationFilePath(
        //     filename
        // );

        // // Create an upload stream that goes to S3
        // const uploadStream = this.createUploadStream(filePath);

        // // Pipe the file data into the upload stream
        // stream.pipe(uploadStream.writeStream);

        // // Start the stream
        // const result = await uploadStream.promise;
        // const link = result.Location;

        // // (optional) save it to our database

        // return { filename, mimetype, encoding, url: link };
    }
}