"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = exports.UploadedFileResponse = exports.FileType = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Post_1 = require("./Post");
let FileType = class FileType {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FileType.prototype, "filename", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FileType.prototype, "mimetype", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FileType.prototype, "encoding", void 0);
FileType = __decorate([
    type_graphql_1.InputType()
], FileType);
exports.FileType = FileType;
let UploadedFileResponse = class UploadedFileResponse {
};
UploadedFileResponse = __decorate([
    type_graphql_1.ObjectType()
], UploadedFileResponse);
exports.UploadedFileResponse = UploadedFileResponse;
let File = class File extends typeorm_1.BaseEntity {
};
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], File.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int),
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", Number)
], File.prototype, "postId", void 0);
__decorate([
    type_graphql_1.Field(() => Post_1.Post),
    typeorm_1.ManyToOne(() => Post_1.Post, post => post.files, {
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", Post_1.Post)
], File.prototype, "post", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], File.prototype, "url", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], File.prototype, "filename", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], File.prototype, "mimetype", void 0);
__decorate([
    type_graphql_1.Field(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], File.prototype, "encoding", void 0);
File = __decorate([
    type_graphql_1.ObjectType(),
    typeorm_1.Entity()
], File);
exports.File = File;
//# sourceMappingURL=File.js.map