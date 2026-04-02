const constants = {
    ROLES: {
        VIEWER: "viewer",
        ANALYST: "analyst",
        ADMIN: "admin"
    },

    USER_STATUS: {
        ACTIVE: "active",
        INACTIVE: "inactive"
    },

    RECORD_TYPES: {
        INCOME: "income",
        EXPENSE: "expense"
    },

    INVITE_STATUS: {
        PENDING: "pending",
        ACCEPTED: "accepted",
        EXPIRED: "expired",
        REVOKED: "revoked"
    },

    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    },

    INVITE_EXPIRY_DAYS: 7
} as const;

export default constants;