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
exports.DisputeMessage = exports.MessageType = void 0;
const typeorm_1 = require("typeorm");
const Dispute_1 = require("./Dispute");
const User_1 = require("./User");
var MessageType;
(function (MessageType) {
    MessageType["INITIAL"] = "initial";
    MessageType["USER_MESSAGE"] = "user_message";
    MessageType["ADMIN_MESSAGE"] = "admin_message";
    MessageType["EVIDENCE"] = "evidence";
    MessageType["SYSTEM"] = "system";
})(MessageType || (exports.MessageType = MessageType = {}));
let DisputeMessage = class DisputeMessage {
};
exports.DisputeMessage = DisputeMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DisputeMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], DisputeMessage.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MessageType,
        default: MessageType.USER_MESSAGE,
    }),
    __metadata("design:type", String)
], DisputeMessage.prototype, "message_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DisputeMessage.prototype, "attachment_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DisputeMessage.prototype, "attachment_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DisputeMessage.prototype, "attachment_type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DisputeMessage.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DisputeMessage.prototype, "dispute_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Dispute_1.Dispute, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'dispute_id' }),
    __metadata("design:type", Dispute_1.Dispute)
], DisputeMessage.prototype, "dispute", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DisputeMessage.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], DisputeMessage.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], DisputeMessage.prototype, "is_admin", void 0);
exports.DisputeMessage = DisputeMessage = __decorate([
    (0, typeorm_1.Entity)('dispute_messages')
], DisputeMessage);
