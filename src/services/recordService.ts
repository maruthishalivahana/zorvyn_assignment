import { Record, type IRecord } from "../models/Record";

interface CreateRecordPayload {
    userId: string;
    title: string;
    description?: string;
    amount: number;
}

export const createRecord = async (payload: CreateRecordPayload): Promise<IRecord> =>
    Record.create(payload);

export const getUserRecords = async (userId: string): Promise<IRecord[]> =>
    Record.find({ userId }).sort({ createdAt: -1 });
