import { Record, type IRecord } from "../models/Record";
import { Types } from "mongoose";
import constants from "../config/constants";

interface CreateRecordPayload {
    title: string;
    type: "income" | "expense";
    category: string;
    amount: number;
    description?: string | null;
    date?: Date;
    userId: string;
}

interface UpdateRecordPayload {
    title?: string;
    type?: "income" | "expense";
    category?: string;
    amount?: number;
    description?: string | null;
    date?: Date;
}

interface ListRecordsFilter {
    userId?: string;
    type?: "income" | "expense";
    category?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

interface RecordSummary {
    totalIncome: number;
    totalExpense: number;
    net: number;
    recordCount: number;
    byType: {
        income: number;
        expense: number;
    };
    byCategory: Record<string, number>;
}

/**
 * Create a new record for a user
 */
export const createRecord = async (payload: CreateRecordPayload): Promise<IRecord> => {
    const record = await Record.create({
        title: payload.title,
        type: payload.type,
        category: payload.category,
        amount: payload.amount,
        description: payload.description || null,
        date: payload.date || new Date(),
        userId: new Types.ObjectId(payload.userId)
    });
    return record;
};

/**
 * Get all records with pagination and filtering
 * Analysts and admins can see all records; viewers see only their own
 */
export const listRecords = async (filter: ListRecordsFilter): Promise<PaginatedResponse<IRecord>> => {
    const page = filter.page || constants.PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(filter.limit || constants.PAGINATION.DEFAULT_LIMIT, constants.PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    // Apply user filter if provided (for viewers)
    if (filter.userId) {
        query.userId = new Types.ObjectId(filter.userId);
    }

    // Apply type filter
    if (filter.type) {
        query.type = filter.type;
    }

    // Apply category filter
    if (filter.category) {
        query.category = filter.category.toLowerCase();
    }

    // Apply date range filter
    if (filter.startDate || filter.endDate) {
        query.date = {};
        if (filter.startDate) {
            (query.date as Record<string, unknown>).$gte = filter.startDate;
        }
        if (filter.endDate) {
            const endDate = new Date(filter.endDate);
            endDate.setHours(23, 59, 59, 999);
            (query.date as Record<string, unknown>).$lte = endDate;
        }
    }

    // Count total records matching the filter
    const total = await Record.countDocuments(query);

    // Fetch paginated records
    const data = await Record.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    return {
        data: data as unknown as IRecord[],
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get a single record by ID
 */
export const getRecordById = async (recordId: string): Promise<IRecord | null> => {
    return Record.findById(recordId).lean() as Promise<IRecord | null>;
};

/**
 * Update a record
 */
export const updateRecord = async (recordId: string, payload: UpdateRecordPayload): Promise<IRecord | null> => {
    const updateData: Record<string, unknown> = {};

    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.type !== undefined) updateData.type = payload.type;
    if (payload.category !== undefined) updateData.category = payload.category;
    if (payload.amount !== undefined) updateData.amount = payload.amount;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.date !== undefined) updateData.date = payload.date;

    return Record.findByIdAndUpdate(recordId, updateData, { new: true, runValidators: true }).lean() as Promise<IRecord | null>;
};

/**
 * Soft delete a record (admin only)
 * Marks the record as deleted and records who deleted it
 */
export const deleteRecord = async (recordId: string, deletedBy: string): Promise<IRecord | null> => {
    return Record.findByIdAndUpdate(
        recordId,
        {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: new Types.ObjectId(deletedBy)
        },
        { new: true, runValidators: true }
    ).lean() as Promise<IRecord | null>;
};

/**
 * Get user records (convenience function for getting records by user ID)
 */
export const getUserRecords = async (userId: string): Promise<IRecord[]> => {
    const records = await Record.find({ userId: new Types.ObjectId(userId) })
        .sort({ date: -1 })
        .lean();
    return records as unknown as IRecord[];
};

/**
 * Get summary statistics for records (for analysts and admins)
 * Used for dashboard summaries
 */
export const getRecordsSummary = async (filter?: { userId?: string; startDate?: Date; endDate?: Date }): Promise<RecordSummary> => {
    const query: Record<string, unknown> = {};

    if (filter?.userId) {
        query.userId = new Types.ObjectId(filter.userId);
    }

    if (filter?.startDate || filter?.endDate) {
        query.date = {};
        if (filter.startDate) {
            (query.date as Record<string, unknown>).$gte = filter.startDate;
        }
        if (filter.endDate) {
            const endDate = new Date(filter.endDate);
            endDate.setHours(23, 59, 59, 999);
            (query.date as Record<string, unknown>).$lte = endDate;
        }
    }

    const records = await Record.find(query).lean();

    let totalIncome = 0;
    let totalExpense = 0;
    const byCategoryMap: Record<string, number> = {};

    records.forEach((record) => {
        if (record.type === constants.RECORD_TYPES.INCOME) {
            totalIncome += record.amount;
        } else {
            totalExpense += record.amount;
        }

        const categoryKey = (record.category as string).toLowerCase();
        byCategoryMap[categoryKey] = (byCategoryMap[categoryKey] || 0) + record.amount;
    });

    return {
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
        recordCount: records.length,
        byType: {
            income: records.filter((r) => r.type === constants.RECORD_TYPES.INCOME).length,
            expense: records.filter((r) => r.type === constants.RECORD_TYPES.EXPENSE).length
        },
        byCategory: byCategoryMap
    };
};
