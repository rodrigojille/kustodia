import "reflect-metadata";
import ormconfig from "../backend/src/ormconfig";
import { Escrow } from "../backend/src/entity/Escrow";
import { Dispute } from "../backend/src/entity/Dispute";
import { releaseEscrowAndPayout } from "../backend/src/services/payoutService";

async function main() {
  await ormconfig.initialize();

  const escrowRepo = ormconfig.getRepository(Escrow);
  const disputeRepo = ormconfig.getRepository(Dispute);

  const escrow = await escrowRepo.findOne({ where: { id: 59 }, relations: ["dispute", "payment"] });
  if (!escrow) throw new Error("Escrow 59 not found");

  if (!escrow.dispute) throw new Error("Escrow 59 has no dispute");

  // Approve dispute and release escrow
  escrow.dispute_status = "resolved";
  escrow.status = "released";
  escrow.dispute.status = "resolved";
  escrow.dispute.admin_notes = "Manual script release after API/JWT issues";
  escrow.dispute.contract_dispute_resolved_tx = "manual-script";
  escrow.dispute.updated_at = new Date();

  await disputeRepo.save(escrow.dispute);
  await escrowRepo.save(escrow);

  // Trigger payout automation
  await releaseEscrowAndPayout(escrow.id);

  console.log("Escrow 59 released and payout triggered!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
