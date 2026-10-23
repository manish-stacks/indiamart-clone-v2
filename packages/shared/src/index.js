"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketPriority = exports.TicketStatus = exports.PaymentStatus = exports.OrderStatus = exports.QuotationStatus = exports.RequirementStatus = exports.LeadPriority = exports.LeadStage = exports.UnitOfMeasure = exports.ProductStatus = exports.VerificationStatus = exports.BusinessType = exports.BusinessMemberRole = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["BUYER"] = "BUYER";
    UserRole["SELLER"] = "SELLER";
    UserRole["SUPPORT"] = "SUPPORT";
    UserRole["MODERATOR"] = "MODERATOR";
    UserRole["FINANCE"] = "FINANCE";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var BusinessMemberRole;
(function (BusinessMemberRole) {
    BusinessMemberRole["OWNER"] = "OWNER";
    BusinessMemberRole["MANAGER"] = "MANAGER";
    BusinessMemberRole["STAFF"] = "STAFF";
})(BusinessMemberRole || (exports.BusinessMemberRole = BusinessMemberRole = {}));
var BusinessType;
(function (BusinessType) {
    BusinessType["MANUFACTURER"] = "MANUFACTURER";
    BusinessType["WHOLESALER"] = "WHOLESALER";
    BusinessType["DISTRIBUTOR"] = "DISTRIBUTOR";
    BusinessType["EXPORTER"] = "EXPORTER";
    BusinessType["IMPORTER"] = "IMPORTER";
    BusinessType["SERVICE_PROVIDER"] = "SERVICE_PROVIDER";
    BusinessType["RETAILER"] = "RETAILER";
})(BusinessType || (exports.BusinessType = BusinessType = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    VerificationStatus["VERIFIED"] = "VERIFIED";
    VerificationStatus["REJECTED"] = "REJECTED";
    VerificationStatus["SUSPENDED"] = "SUSPENDED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["DRAFT"] = "DRAFT";
    ProductStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    ProductStatus["PUBLISHED"] = "PUBLISHED";
    ProductStatus["ARCHIVED"] = "ARCHIVED";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
var UnitOfMeasure;
(function (UnitOfMeasure) {
    UnitOfMeasure["PIECE"] = "PIECE";
    UnitOfMeasure["BOX"] = "BOX";
    UnitOfMeasure["CARTON"] = "CARTON";
    UnitOfMeasure["TON"] = "TON";
    UnitOfMeasure["KG"] = "KG";
    UnitOfMeasure["GRAM"] = "GRAM";
    UnitOfMeasure["METER"] = "METER";
    UnitOfMeasure["SQUARE_METER"] = "SQUARE_METER";
    UnitOfMeasure["LITRE"] = "LITRE";
    UnitOfMeasure["SET"] = "SET";
    UnitOfMeasure["PACK"] = "PACK";
    UnitOfMeasure["HOUR"] = "HOUR";
})(UnitOfMeasure || (exports.UnitOfMeasure = UnitOfMeasure = {}));
var LeadStage;
(function (LeadStage) {
    LeadStage["NEW"] = "NEW";
    LeadStage["CONTACTED"] = "CONTACTED";
    LeadStage["QUALIFIED"] = "QUALIFIED";
    LeadStage["QUOTATION_SENT"] = "QUOTATION_SENT";
    LeadStage["NEGOTIATION"] = "NEGOTIATION";
    LeadStage["WON"] = "WON";
    LeadStage["LOST"] = "LOST";
})(LeadStage || (exports.LeadStage = LeadStage = {}));
var LeadPriority;
(function (LeadPriority) {
    LeadPriority["LOW"] = "LOW";
    LeadPriority["MEDIUM"] = "MEDIUM";
    LeadPriority["HIGH"] = "HIGH";
    LeadPriority["URGENT"] = "URGENT";
})(LeadPriority || (exports.LeadPriority = LeadPriority = {}));
var RequirementStatus;
(function (RequirementStatus) {
    RequirementStatus["OPEN"] = "OPEN";
    RequirementStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    RequirementStatus["QUOTES_RECEIVED"] = "QUOTES_RECEIVED";
    RequirementStatus["MATCHED"] = "MATCHED";
    RequirementStatus["CLOSED"] = "CLOSED";
    RequirementStatus["EXPIRED"] = "EXPIRED";
})(RequirementStatus || (exports.RequirementStatus = RequirementStatus = {}));
var QuotationStatus;
(function (QuotationStatus) {
    QuotationStatus["DRAFT"] = "DRAFT";
    QuotationStatus["SENT"] = "SENT";
    QuotationStatus["VIEWED"] = "VIEWED";
    QuotationStatus["ACCEPTED"] = "ACCEPTED";
    QuotationStatus["REJECTED"] = "REJECTED";
    QuotationStatus["REVISED"] = "REVISED";
    QuotationStatus["EXPIRED"] = "EXPIRED";
})(QuotationStatus || (exports.QuotationStatus = QuotationStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING_PAYMENT"] = "PENDING_PAYMENT";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["RETURN_REQUESTED"] = "RETURN_REQUESTED";
    OrderStatus["RETURNED"] = "RETURNED";
    OrderStatus["REFUND_PENDING"] = "REFUND_PENDING";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["INITIATED"] = "INITIATED";
    PaymentStatus["AUTHORIZED"] = "AUTHORIZED";
    PaymentStatus["CAPTURED"] = "CAPTURED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["PARTIALLY_REFUNDED"] = "PARTIALLY_REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["OPEN"] = "OPEN";
    TicketStatus["ASSIGNED"] = "ASSIGNED";
    TicketStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TicketStatus["WAITING_FOR_USER"] = "WAITING_FOR_USER";
    TicketStatus["ESCALATED"] = "ESCALATED";
    TicketStatus["RESOLVED"] = "RESOLVED";
    TicketStatus["CLOSED"] = "CLOSED";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
var TicketPriority;
(function (TicketPriority) {
    TicketPriority["LOW"] = "LOW";
    TicketPriority["MEDIUM"] = "MEDIUM";
    TicketPriority["HIGH"] = "HIGH";
    TicketPriority["URGENT"] = "URGENT";
})(TicketPriority || (exports.TicketPriority = TicketPriority = {}));
//# sourceMappingURL=index.js.map