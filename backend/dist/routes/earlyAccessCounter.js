"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EarlyAccessCounterController_1 = require("../controllers/EarlyAccessCounterController");
const router = (0, express_1.Router)();
router.get('/slots', EarlyAccessCounterController_1.getSlots);
exports.default = router;
