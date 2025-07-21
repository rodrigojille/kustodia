"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LeadController_1 = require("../controllers/LeadController");
const router = (0, express_1.Router)();
router.post('/', LeadController_1.createLead);
router.post('/:id/invite', LeadController_1.inviteLead);
exports.default = router;
