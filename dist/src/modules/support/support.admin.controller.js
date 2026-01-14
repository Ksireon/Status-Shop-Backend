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
exports.SupportAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const current_user_decorator_1 = require("../../common/auth/current-user.decorator");
const roles_decorator_1 = require("../../common/auth/roles.decorator");
const roles_guard_1 = require("../../common/auth/roles.guard");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_message_dto_1 = require("./dto/create-message.dto");
const support_chat_filter_dto_1 = require("./dto/support-chat-filter.dto");
const update_support_chat_dto_1 = require("./dto/update-support-chat.dto");
const support_service_1 = require("./support.service");
let SupportAdminController = class SupportAdminController {
    support;
    constructor(support) {
        this.support = support;
    }
    async listChats(filter) {
        return this.support.adminListChats(filter);
    }
    async listMessages(chatId) {
        return this.support.adminListMessages(chatId);
    }
    async sendMessage(current, chatId, dto) {
        return this.support.adminSendSupportMessage(current.sub, chatId, dto.text);
    }
    async updateChat(chatId, dto) {
        const status = dto.status;
        return this.support.adminUpdateChat(chatId, {
            status,
            assignedTo: dto.assignedTo,
        });
    }
    async closeChat(chatId) {
        return this.support.adminUpdateChat(chatId, {
            status: client_1.SupportChatStatus.CLOSED,
        });
    }
};
exports.SupportAdminController = SupportAdminController;
__decorate([
    (0, common_1.Get)('chats'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_chat_filter_dto_1.SupportChatFilterDto]),
    __metadata("design:returntype", Promise)
], SupportAdminController.prototype, "listChats", null);
__decorate([
    (0, common_1.Get)('chats/:chatId/messages'),
    __param(0, (0, common_1.Param)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupportAdminController.prototype, "listMessages", null);
__decorate([
    (0, common_1.Post)('chats/:chatId/messages'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPPORT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_message_dto_1.CreateSupportMessageDto]),
    __metadata("design:returntype", Promise)
], SupportAdminController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Patch)('chats/:chatId'),
    __param(0, (0, common_1.Param)('chatId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_support_chat_dto_1.UpdateSupportChatDto]),
    __metadata("design:returntype", Promise)
], SupportAdminController.prototype, "updateChat", null);
__decorate([
    (0, common_1.Delete)('chats/:chatId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.SUPPORT),
    __param(0, (0, common_1.Param)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupportAdminController.prototype, "closeChat", null);
exports.SupportAdminController = SupportAdminController = __decorate([
    (0, swagger_1.ApiTags)('admin/support'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('support/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.MANAGER, client_1.UserRole.SUPPORT),
    __metadata("design:paramtypes", [support_service_1.SupportService])
], SupportAdminController);
//# sourceMappingURL=support.admin.controller.js.map