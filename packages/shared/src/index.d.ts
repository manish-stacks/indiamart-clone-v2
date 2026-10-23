export declare enum UserRole {
    BUYER = "BUYER",
    SELLER = "SELLER",
    SUPPORT = "SUPPORT",
    MODERATOR = "MODERATOR",
    FINANCE = "FINANCE",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN"
}
export declare enum BusinessMemberRole {
    OWNER = "OWNER",
    MANAGER = "MANAGER",
    STAFF = "STAFF"
}
export declare enum BusinessType {
    MANUFACTURER = "MANUFACTURER",
    WHOLESALER = "WHOLESALER",
    DISTRIBUTOR = "DISTRIBUTOR",
    EXPORTER = "EXPORTER",
    IMPORTER = "IMPORTER",
    SERVICE_PROVIDER = "SERVICE_PROVIDER",
    RETAILER = "RETAILER"
}
export declare enum VerificationStatus {
    PENDING = "PENDING",
    UNDER_REVIEW = "UNDER_REVIEW",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED",
    SUSPENDED = "SUSPENDED"
}
export declare enum ProductStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}
export declare enum UnitOfMeasure {
    PIECE = "PIECE",
    BOX = "BOX",
    CARTON = "CARTON",
    TON = "TON",
    KG = "KG",
    GRAM = "GRAM",
    METER = "METER",
    SQUARE_METER = "SQUARE_METER",
    LITRE = "LITRE",
    SET = "SET",
    PACK = "PACK",
    HOUR = "HOUR"
}
export declare enum LeadStage {
    NEW = "NEW",
    CONTACTED = "CONTACTED",
    QUALIFIED = "QUALIFIED",
    QUOTATION_SENT = "QUOTATION_SENT",
    NEGOTIATION = "NEGOTIATION",
    WON = "WON",
    LOST = "LOST"
}
export declare enum LeadPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum RequirementStatus {
    OPEN = "OPEN",
    UNDER_REVIEW = "UNDER_REVIEW",
    QUOTES_RECEIVED = "QUOTES_RECEIVED",
    MATCHED = "MATCHED",
    CLOSED = "CLOSED",
    EXPIRED = "EXPIRED"
}
export declare enum QuotationStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    VIEWED = "VIEWED",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    REVISED = "REVISED",
    EXPIRED = "EXPIRED"
}
export declare enum OrderStatus {
    PENDING_PAYMENT = "PENDING_PAYMENT",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    RETURN_REQUESTED = "RETURN_REQUESTED",
    RETURNED = "RETURNED",
    REFUND_PENDING = "REFUND_PENDING",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentStatus {
    INITIATED = "INITIATED",
    AUTHORIZED = "AUTHORIZED",
    CAPTURED = "CAPTURED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED"
}
export declare enum TicketStatus {
    OPEN = "OPEN",
    ASSIGNED = "ASSIGNED",
    IN_PROGRESS = "IN_PROGRESS",
    WAITING_FOR_USER = "WAITING_FOR_USER",
    ESCALATED = "ESCALATED",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED"
}
export declare enum TicketPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export interface UserProfileDto {
    id: string;
    email: string;
    phone?: string | null;
    fullName: string;
    avatarUrl?: string | null;
    roles: UserRole[];
    businessMemberships?: {
        businessId: string;
        businessName: string;
        businessSlug: string;
        role: BusinessMemberRole;
        verificationStatus: VerificationStatus;
    }[];
    createdAt: string;
}
export interface PublicBusinessDto {
    id: string;
    name: string;
    slug: string;
    legalName?: string | null;
    description?: string | null;
    businessType: BusinessType;
    verificationStatus: VerificationStatus;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    yearEstablished?: number | null;
    gstinVerified: boolean;
    memberCount?: number;
    productCount?: number;
}
export interface ProductDto {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    categoryId: string;
    categoryName?: string;
    businessId: string;
    businessName?: string;
    businessSlug?: string;
    businessCity?: string;
    businessState?: string;
    status: ProductStatus;
    minOrderQuantity: number;
    unitOfMeasure: UnitOfMeasure;
    unitPrice: number;
    isB2B: boolean;
    isB2C: boolean;
    images: {
        id: string;
        url: string;
        isPrimary: boolean;
        altText?: string;
    }[];
    priceTiers?: {
        minQuantity: number;
        maxQuantity?: number | null;
        price: number;
    }[];
    specifications?: Record<string, string | number>;
    sku?: string | null;
}
export interface CategoryDto {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    icon?: string | null;
    parentId?: string | null;
    productCount?: number;
    children?: CategoryDto[];
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}
