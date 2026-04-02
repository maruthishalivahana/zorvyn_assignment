import { Schema, model, type Document, type Types } from "mongoose";
import constants from "../config/constants";

interface IInviteMethods {
    isExpired(): boolean;
    isValid(): boolean;
}

export interface IInvite extends Document, IInviteMethods {
    email: string;
    token: string;
    role: (typeof constants.ROLES)[keyof typeof constants.ROLES];
    status: (typeof constants.INVITE_STATUS)[keyof typeof constants.INVITE_STATUS];
    invitedBy: Types.ObjectId;
    expiresAt: Date;
    acceptedAt: Date | null;
    customMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const inviteSchema = new Schema<IInvite>(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        role: {
            type: String,
            required: true,
            enum: Object.values(constants.ROLES)
        },
        status: {
            type: String,
            enum: Object.values(constants.INVITE_STATUS),
            default: constants.INVITE_STATUS.PENDING,
            index: true
        },
        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true
        },
        acceptedAt: {
            type: Date,
            default: null
        },
        customMessage: {
            type: String,
            maxlength: 500,
            default: null
        }
    },
    {
        timestamps: true
    }
);

inviteSchema.index({ email: 1, status: 1 });

inviteSchema.methods.isExpired = function (this: IInvite): boolean {
    return new Date() > this.expiresAt;
};

inviteSchema.methods.isValid = function (this: IInvite): boolean {
    return this.status === constants.INVITE_STATUS.PENDING && !this.isExpired();
};

export const Invite = model<IInvite>("Invite", inviteSchema);
