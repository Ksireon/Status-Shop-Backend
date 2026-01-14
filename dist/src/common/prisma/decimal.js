"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decimalToNumber = decimalToNumber;
function decimalToNumber(value) {
    if (typeof value === 'number')
        return value;
    if (typeof value === 'string')
        return Number(value);
    return value.toNumber();
}
//# sourceMappingURL=decimal.js.map