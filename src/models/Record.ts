import { Schema, model, type Document, type Types, type Query } from "mongoose";
import constants from "../config/constants";

export interface IRecord extends Document {
    title: string;
    amount: number;
    type: (typeof constants.RECORD_TYPES)[keyof typeof constants.RECORD_TYPES];
    category: string;
    date: Date;
    description: string | null;
    userId: Types.ObjectId;
    isDeleted: boolean;
    deletedAt: Date | null;
    deletedBy: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

const recordSchema = new Schema<IRecord>(
    {
        title: {
            type: String,
            required: [true, "title is required"],
            trim: true,
            minlength: [1, "title is required"],
            maxlength: [100, "title cannot exceed 100 characters"],
            index: true
        },
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: [0.01, "Amount must be greater than 0"],
            validate: {
                validator: function (v: number) {
                    return /^\d+(\.\d{1,2})?$/.test(v.toString());
                },
                message: "Amount must have at most 2 decimal places"
            }
        },
        type: {
            type: String,
            required: [true, "Type is required"],
            enum: Object.values(constants.RECORD_TYPES),
            index: true
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            lowercase: true,
            trim: true,
            minlength: [2, "Category must be at least 2 characters"],
            maxlength: [50, "Category cannot exceed 50 characters"],
            index: true
        },
        date: {
            type: Date,
            required: [true, "Date is required"],
            default: Date.now,
            index: true
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
            default: null
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        deletedAt: {
            type: Date,
            default: null
        },
        deletedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

recordSchema.index({ userId: 1, isDeleted: 1, date: -1 });
recordSchema.index({ isDeleted: 1, date: -1 });
recordSchema.index({ type: 1, isDeleted: 1 });
recordSchema.index({ category: 1, isDeleted: 1 });
recordSchema.index({ title: 1, isDeleted: 1 });

recordSchema.pre(/^find/, function (this: Query<unknown, IRecord>, next: (err?: Error) => void) {
    const query = this.getQuery() as { isDeleted?: boolean };
    if (query.isDeleted === undefined) {
        this.where({ isDeleted: false });
    }
    next();
});

export const Record = model<IRecord>("Record", recordSchema);
