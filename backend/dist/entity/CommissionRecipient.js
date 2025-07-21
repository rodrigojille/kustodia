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
exports.CommissionRecipient = void 0;
const typeorm_1 = require("typeorm");
const Payment_1 = require("./Payment");
let CommissionRecipient = class CommissionRecipient {
};
exports.CommissionRecipient = CommissionRecipient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CommissionRecipient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], CommissionRecipient.prototype, "payment_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], CommissionRecipient.prototype, "broker_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], CommissionRecipient.prototype, "broker_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], CommissionRecipient.prototype, "broker_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], CommissionRecipient.prototype, "broker_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CommissionRecipient.prototype, "paid", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], CommissionRecipient.prototype, "paid_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], CommissionRecipient.prototype, "payment_transaction_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CommissionRecipient.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CommissionRecipient.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Payment_1.Payment, payment => payment.id, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'payment_id' }),
    __metadata("design:type", Payment_1.Payment)
], CommissionRecipient.prototype, "payment", void 0);
exports.CommissionRecipient = CommissionRecipient = __decorate([
    (0, typeorm_1.Entity)('commission_recipients'),
    (0, typeorm_1.Index)(['payment_id'])
], CommissionRecipient);
