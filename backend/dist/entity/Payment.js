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
exports.Payment = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Escrow_1 = require("./Escrow");
const JunoTransaction_1 = require("./JunoTransaction");
const MultisigApprovalRequest_1 = require("./MultisigApprovalRequest");
let Payment = class Payment {
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Payment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    __metadata("design:type", User_1.User)
], Payment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "seller_id" }),
    __metadata("design:type", User_1.User)
], Payment.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Payment.prototype, "recipient_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], Payment.prototype, "payer_email", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'MXN' }),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "transaction_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => JunoTransaction_1.JunoTransaction, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "juno_transaction_id" }),
    __metadata("design:type", JunoTransaction_1.JunoTransaction)
], Payment.prototype, "junoTransaction", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "blockchain_tx_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "bitso_tracking_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "travel_rule_data", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, length: 18 }),
    __metadata("design:type", String)
], Payment.prototype, "deposit_clabe", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, length: 18 }),
    __metadata("design:type", String)
], Payment.prototype, "payout_clabe", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, length: 36 }),
    __metadata("design:type", String)
], Payment.prototype, "payout_juno_bank_account_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], Payment.prototype, "juno_payment_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "decimal", precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "commission_percent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "decimal", precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "commission_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "platform_commission_percent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "platform_commission_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "platform_commission_beneficiary_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "total_amount_to_pay", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], Payment.prototype, "commission_beneficiary_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], Payment.prototype, "commission_beneficiary_email", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, length: 18 }),
    __metadata("design:type", String)
], Payment.prototype, "commission_beneficiary_clabe", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, length: 36 }),
    __metadata("design:type", String)
], Payment.prototype, "commission_beneficiary_juno_bank_account_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, length: 18 }),
    __metadata("design:type", String)
], Payment.prototype, "payer_clabe", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'traditional', length: 50 }),
    __metadata("design:type", String)
], Payment.prototype, "payment_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], Payment.prototype, "payer_approval", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], Payment.prototype, "payee_approval", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "timestamp" }),
    __metadata("design:type", Date)
], Payment.prototype, "payer_approval_timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "timestamp" }),
    __metadata("design:type", Date)
], Payment.prototype, "payee_approval_timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "text" }),
    __metadata("design:type", String)
], Payment.prototype, "release_conditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "vertical_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 50 }),
    __metadata("design:type", String)
], Payment.prototype, "operation_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 20, default: 'payer' }),
    __metadata("design:type", String)
], Payment.prototype, "initiator_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "text" }),
    __metadata("design:type", String)
], Payment.prototype, "transaction_subtype", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "vehicle_brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "vehicle_model", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "vehicle_year", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 17 }),
    __metadata("design:type", String)
], Payment.prototype, "vehicle_vin", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "vehicle_mileage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 50 }),
    __metadata("design:type", String)
], Payment.prototype, "vehicle_condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "electronics_brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "electronics_model", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 50 }),
    __metadata("design:type", String)
], Payment.prototype, "electronics_condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "electronics_warranty", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "electronics_serial", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "appliance_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "appliance_brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "appliance_years_use", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 50 }),
    __metadata("design:type", String)
], Payment.prototype, "appliance_efficiency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 50 }),
    __metadata("design:type", String)
], Payment.prototype, "appliance_condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "appliance_serial", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "furniture_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "furniture_material", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "furniture_dimensions", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 50 }),
    __metadata("design:type", String)
], Payment.prototype, "furniture_condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], Payment.prototype, "broker_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], Payment.prototype, "seller_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "decimal", precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payment.prototype, "total_commission_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "decimal", precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Payment.prototype, "total_commission_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "decimal", precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "net_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Payment.prototype, "multisig_required", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 50 }),
    __metadata("design:type", String)
], Payment.prototype, "multisig_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Payment.prototype, "multisig_approval_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MultisigApprovalRequest_1.MultisigApprovalRequest, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'multisig_approval_id' }),
    __metadata("design:type", MultisigApprovalRequest_1.MultisigApprovalRequest)
], Payment.prototype, "multisigApproval", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Escrow_1.Escrow, escrow => escrow.payment),
    (0, typeorm_1.JoinColumn)({ name: "escrow_id" }),
    __metadata("design:type", Escrow_1.Escrow)
], Payment.prototype, "escrow", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Payment.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Payment.prototype, "updated_at", void 0);
exports.Payment = Payment = __decorate([
    (0, typeorm_1.Entity)()
], Payment);
