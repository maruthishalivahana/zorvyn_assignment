import { Schema, model, type Document, type Types } from "mongoose";
import bcrypt from "bcryptjs";

interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
    toPublicJSON(): {
        id: Types.ObjectId;
        email: string;
        name: string;
        role: string;
        status: string;
        createdAt: Date;
        lastLoginAt: Date | null;
    };
}

export interface IUser extends Document, IUserMethods {
    email: string;
    password: string;
    name: string;
    role: string;
    status: string;
    lastLoginAt: Date | null;
    createdBy: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"]
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [100, "Name cannot exceed 100 characters"]
        },
        role: {
            type: String,
            enum: ["viewer", "analyst", "admin"],
            default: "viewer"
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
        lastLoginAt: {
            type: Date,
            default: null
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


userSchema.index({ status: 1 });
userSchema.index({ role: 1, status: 1 });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        email: this.email,
        name: this.name,
        role: this.role,
        status: this.status,
        createdAt: this.createdAt,
        lastLoginAt: this.lastLoginAt
    };
};

userSchema.virtual("records", {
    ref: "Record",
    localField: "_id",
    foreignField: "userId"
});

userSchema.virtual("deletedRecords", {
    ref: "Record",
    localField: "_id",
    foreignField: "deletedBy"
});

export const User = model<IUser>("User", userSchema);
