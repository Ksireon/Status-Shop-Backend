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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const roles_decorator_1 = require("../../common/auth/roles.decorator");
const roles_guard_1 = require("../../common/auth/roles.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const order_filter_dto_1 = require("./dto/order-filter.dto");
const update_order_payment_dto_1 = require("./dto/update-order-payment.dto");
const update_order_status_dto_1 = require("./dto/update-order-status.dto");
const orders_service_1 = require("./orders.service");
let OrdersAdminController = class OrdersAdminController {
    orders;
    constructor(orders) {
        this.orders = orders;
    }
    async list(filter) {
        return this.orders.adminList(filter);
    }
    async get(id) {
        return this.orders.adminGet(id);
    }
    async updateStatus(id, dto) {
        return this.orders.adminUpdateStatus(id, dto.status, dto.adminNotes);
    }
    async updatePayment(id, dto) {
        return this.orders.adminUpdatePaymentStatus(id, dto.paymentStatus, dto.adminNotes);
    }
    async cancel(id) {
        return this.orders.adminUpdateStatus(id, client_1.OrderStatus.CANCELLED, 'Cancelled by admin');
    }
};
exports.OrdersAdminController = OrdersAdminController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_filter_dto_1.OrderFilterDto]),
    __metadata("design:returntype", Promise)
], OrdersAdminController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersAdminController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_status_dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], OrdersAdminController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/payment'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_payment_dto_1.UpdateOrderPaymentDto]),
    __metadata("design:returntype", Promise)
], OrdersAdminController.prototype, "updatePayment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersAdminController.prototype, "cancel", null);
exports.OrdersAdminController = OrdersAdminController = __decorate([
    (0, swagger_1.ApiTags)('admin/orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin/orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.SUPPORT),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersAdminController);
//# sourceMappingURL=orders.admin.controller.js.map