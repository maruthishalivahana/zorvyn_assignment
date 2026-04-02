import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../utils/logger";

interface InviteEmailPayload {
    email: string;
    role: string;
    token: string;
    expiresAt: Date;
    customMessage?: string | null;
}

export const sendInviteEmail = async (
    payload: InviteEmailPayload
): Promise<{ sent: boolean; providerId?: string }> => {
    if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
        logger.warn("SMTP is not fully configured. Invite email was skipped.");
        return { sent: false };
    }

    const transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpSecure,
        auth: {
            user: env.smtpUser,
            pass: env.smtpPass
        }
    });

    const fromAddress = `${env.emailFromName} <${env.emailFrom}>`;

    const acceptanceHelp = [
        "Use Postman to complete onboarding:",
        "1) Validate invite token:",
        `GET ${env.apiBaseUrl}/api/invites/validate/${payload.token}`,
        "2) Accept invite:",
        `POST ${env.apiBaseUrl}/api/invites/accept`,
        `Body: { \"token\": \"${payload.token}\", \"name\": \"Your Name\", \"password\": \"StrongPass123\" }`
    ].join("\n");

    const email = await transporter.sendMail({
        from: fromAddress,
        to: payload.email,
        subject: "You have been invited to join Zorvyn",
        html: `
            <p>You have been invited to join Zorvyn as <strong>${payload.role}</strong>.</p>
            ${payload.customMessage ? `<p>Message from admin: ${payload.customMessage}</p>` : ""}
            <p>Your invite token:</p>
            <pre>${payload.token}</pre>
            <p>Expires at: ${payload.expiresAt.toISOString()}</p>
            <p>Use Postman to complete onboarding.</p>
        `,
        text: `You have been invited to join Zorvyn as ${payload.role}.\n\n${payload.customMessage ? `Message from admin: ${payload.customMessage}\n\n` : ""}Token: ${payload.token}\nExpires at: ${payload.expiresAt.toISOString()}\n\n${acceptanceHelp}`,
        headers: {
            "X-Idempotency-Key": `invite-send/${payload.token}`
        }
    });

    logger.info(`Invite email sent: ${email.messageId ?? "unknown-id"}`);
    return { sent: true, providerId: email.messageId };
};
