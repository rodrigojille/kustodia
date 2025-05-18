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
exports.Escrow = void 0;
const typeorm_1 = require("typeorm");
const Payment_1 = require("./Payment");
let Escrow = class Escrow {
};
exports.Escrow = Escrow;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Escrow.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Payment_1.Payment),
    (0, typeorm_1.JoinColumn)({ name: "payment_id" }),
    __metadata("design:type", Payment_1.Payment)
], Escrow.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Escrow.prototype, "smart_contract_escrow_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Escrow.prototype, "blockchain_tx_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Escrow.prototype, "release_tx_hash", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], Escrow.prototype, "custody_percent", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], Escrow.prototype, "custody_amount", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], Escrow.prototype, "release_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'active' }),
    __metadata("design:type", String)
], Escrow.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'none' }),
    __metadata("design:type", String)
], Escrow.prototype, "dispute_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Escrow.prototype, "dispute_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Escrow.prototype, "dispute_details", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Escrow.prototype, "dispute_evidence", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Escrow.prototype, "dispute_history", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Escrow.prototype, "custody_end", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Escrow.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Escrow.prototype, "updated_at", void 0);
exports.Escrow = Escrow = __decorate([
    (0, typeorm_1.Entity)()
], Escrow);
