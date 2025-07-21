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
exports.Dispute = void 0;
const typeorm_1 = require("typeorm");
const Escrow_1 = require("./Escrow");
const User_1 = require("./User");
const DisputeMessage_1 = require("./DisputeMessage");
let Dispute = class Dispute {
};
exports.Dispute = Dispute;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Dispute.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Escrow_1.Escrow, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "escrow_id" }),
    __metadata("design:type", Escrow_1.Escrow)
], Dispute.prototype, "escrow", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "raised_by" }),
    __metadata("design:type", User_1.User)
], Dispute.prototype, "raisedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Dispute.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Dispute.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Dispute.prototype, "evidence_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    __metadata("design:type", String)
], Dispute.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Dispute.prototype, "admin_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Dispute.prototype, "contract_dispute_raised_tx", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Dispute.prototype, "contract_dispute_resolved_tx", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DisputeMessage_1.DisputeMessage, message => message.dispute),
    __metadata("design:type", Array)
], Dispute.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Dispute.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Dispute.prototype, "updated_at", void 0);
exports.Dispute = Dispute = __decorate([
    (0, typeorm_1.Entity)()
], Dispute);
