import ormconfig from "../ormconfig";
import { Payment } from "../entity/Payment";
import { PaymentEvent } from "../entity/PaymentEvent";

export async function recordPaymentEvent(payment: Payment, type: string, description?: string) {
  const repo = ormconfig.getRepository(PaymentEvent);
  const event = repo.create({ payment, type, description });
  await repo.save(event);
}
