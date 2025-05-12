"use strict";
// Utility for validating payment references for banking compliance
// Only allows alphanumeric and spaces (no special characters)
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidReference = isValidReference;
exports.sanitizeReference = sanitizeReference;
function isValidReference(reference) {
    // Allows letters, numbers, and spaces only
    return /^[A-Za-z0-9 ]+$/.test(reference);
}
function sanitizeReference(reference) {
    // Remove all non-alphanumeric and non-space characters
    return reference.replace(/[^A-Za-z0-9 ]/g, '');
}
