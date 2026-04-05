import dotenv from "dotenv";

dotenv.config();

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
    if (value === undefined) {
        return fallback;
    }

    return value === "true";
};

const parseCookieSameSite = (value: string | undefined): "lax" | "strict" | "none" => {
    const normalized = value?.toLowerCase();

    if (normalized === "strict" || normalized === "none") {
        return normalized;
    }

    return "lax";
};

export const env = {
    port: Number(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/zorvyn",
    jwtSecret: process.env.JWT_SECRET || "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
    emailFrom: process.env.EMAIL_FROM || "noreply@example.com",
    emailFromName: process.env.EMAIL_FROM_NAME || "Zorvyn",
    apiBaseUrl: process.env.API_BASE_URL || "http://localhost:5000",
    smtpHost: process.env.SMTP_HOST || "",
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    smtpSecure: process.env.SMTP_SECURE === "true",
    smtpUser: process.env.SMTP_USER || "",
    smtpPass: process.env.SMTP_PASS || "",
    authCookieName: process.env.AUTH_COOKIE_NAME || "auth_token",
    authCookieSecure: parseBoolean(process.env.AUTH_COOKIE_SECURE, process.env.NODE_ENV === "production"),
    authCookieSameSite: parseCookieSameSite(process.env.AUTH_COOKIE_SAME_SITE),
    authCookieDomain: process.env.AUTH_COOKIE_DOMAIN || "",
    authCookieMaxAgeMs: Number(process.env.AUTH_COOKIE_MAX_AGE_MS) || 24 * 60 * 60 * 1000,
    emailfrom: process.env.EMAIL_FROM || ""
};
