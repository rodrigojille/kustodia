"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrementSlot = exports.getSlots = void 0;
const ormconfig_1 = __importDefault(require("../ormconfig"));
const EarlyAccessCounter_1 = __importDefault(require("../entity/EarlyAccessCounter"));
const getCounterRepo = () => {
    const dataSource = ormconfig_1.default;
    return dataSource.getRepository(EarlyAccessCounter_1.default);
};
const getSlots = async (req, res) => {
    try {
        const repo = getCounterRepo();
        let counter = await repo.findOne({ where: {} });
        if (!counter) {
            console.log('Early access counter not found. Initializing with 100 slots.');
            counter = repo.create({ slots: 100 });
            await repo.save(counter);
        }
        res.status(200).json({ slots: counter.slots });
    }
    catch (err) {
        console.error("Error in getSlots:", err);
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: 'Error fetching slots.', details: message });
    }
};
exports.getSlots = getSlots;
const decrementSlot = async (connection) => {
    const conn = connection || ormconfig_1.default;
    const repo = conn.getRepository(EarlyAccessCounter_1.default);
    return repo.manager.transaction(async (transactionalEntityManager) => {
        let counter = await transactionalEntityManager.findOne(EarlyAccessCounter_1.default, {
            where: {},
            lock: { mode: 'pessimistic_write' }
        });
        if (!counter) {
            console.log('Early access counter not found during decrement. Initializing with 100 slots.');
            counter = transactionalEntityManager.create(EarlyAccessCounter_1.default, { slots: 100 });
            await transactionalEntityManager.save(counter);
        }
        if (counter.slots > 0) {
            counter.slots -= 1;
            await transactionalEntityManager.save(counter);
        }
        return counter.slots;
    });
};
exports.decrementSlot = decrementSlot;
