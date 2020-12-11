"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWSS3Uploader = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const stream_1 = __importDefault(require("stream"));
const uuid_1 = require("uuid");
const path_1 = require("path");
class AWSS3Uploader {
    constructor(config) {
        aws_sdk_1.default.config = new aws_sdk_1.default.Config();
        aws_sdk_1.default.config.update({
            region: config.region || 'us-east-2',
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey
        });
        this.s3 = new aws_sdk_1.default.S3();
        this.config = config;
    }
    createDestinationFilePath(fileName) {
        return fileName;
    }
    createUploadStream(key) {
        const pass = new stream_1.default.PassThrough();
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
    singleFileUpload(file) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(file);
            const { createReadStream, filename, mimetype, encoding } = yield file;
            console.log(createReadStream, filename, mimetype, encoding);
            const stream = createReadStream();
            const { Location } = yield this.s3
                .upload({
                Body: stream,
                Key: `${uuid_1.v4()}${path_1.extname(filename)}`,
                ContentType: mimetype,
                Bucket: this.config.destinationBucketName
            })
                .promise();
            return {
                filename,
                mimetype,
                encoding,
                url: Location
            };
        });
    }
}
exports.AWSS3Uploader = AWSS3Uploader;
//# sourceMappingURL=awsS3Uploader.js.map