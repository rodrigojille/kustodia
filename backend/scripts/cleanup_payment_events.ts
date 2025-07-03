import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { In } from "typeorm";
import AppDataSource from "../src/ormconfig";
import { PaymentEvent } from "../src/entity/PaymentEvent";

const PAYMENT_ID_TO_CLEAN = 84;
const EVENT_TYPE_TO_CLEAN = 'escrow_released_onchain_simulated';
const NEW_DESCRIPTION = 'Liberación de fondos simulada.';

async function cleanupPaymentEvents() {
  console.log(`--- 🧹 Starting cleanup for Payment ID: ${PAYMENT_ID_TO_CLEAN} ---`);

  try {
    await AppDataSource.initialize();
    console.log("✅ Database connection initialized.");

    const paymentEventRepo = AppDataSource.getRepository(PaymentEvent);

    // Find all simulated release events for the payment
    const eventsToClean = await paymentEventRepo.find({
      where: {
        paymentId: PAYMENT_ID_TO_CLEAN,
        type: EVENT_TYPE_TO_CLEAN,
      },
      order: {
        created_at: 'ASC', // Get them in chronological order
      },
    });

    if (eventsToClean.length === 0) {
      console.log(`No events of type '${EVENT_TYPE_TO_CLEAN}' found for Payment ID ${PAYMENT_ID_TO_CLEAN}. Nothing to do.`);
      return;
    }

    console.log(`Found ${eventsToClean.length} events of type '${EVENT_TYPE_TO_CLEAN}'.`);

    // Keep the first event, mark the rest for deletion
    const eventToKeep = eventsToClean[0];
    const eventsToDelete = eventsToClean.slice(1);

    // 1. Delete the extra events
    if (eventsToDelete.length > 0) {
      const idsToDelete = eventsToDelete.map(e => e.id);
      console.log(`Deleting ${eventsToDelete.length} extra event(s) with IDs: ${idsToDelete.join(', ')}`);
      await paymentEventRepo.delete({ id: In(idsToDelete) });
      console.log("✅ Extra events deleted.");
    } else {
        console.log("No extra events to delete.");
    }

    // 2. Update the description of the event we are keeping
    console.log(`Updating description for event ID ${eventToKeep.id}...`);
    eventToKeep.description = NEW_DESCRIPTION;
    await paymentEventRepo.save(eventToKeep);
    console.log(`✅ Event description updated to: "${NEW_DESCRIPTION}"`);

  } catch (error) {
    console.error("--- ❌ ERROR during cleanup ---");
    console.error(error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("✅ Database connection closed.");
    }
    console.log("--- 🏁 Cleanup Finished ---");
  }
}

cleanupPaymentEvents();
