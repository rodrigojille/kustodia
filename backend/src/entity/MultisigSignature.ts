import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { MultisigApprovalRequest } from './MultisigApprovalRequest';

@Entity('multisig_signatures')
@Unique(['approval_request_id', 'signer_address'])
export class MultisigSignature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  approval_request_id: number;

  @ManyToOne(() => MultisigApprovalRequest, request => request.signatures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'approval_request_id' })
  approvalRequest: MultisigApprovalRequest;

  @Column({ type: 'varchar', length: 42 })
  signer_address: string;

  @Column({ type: 'text' })
  signature: string;

  @Column({ type: 'varchar', length: 50, default: 'eth_sign' })
  signature_type: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  signed_at: Date;
}
