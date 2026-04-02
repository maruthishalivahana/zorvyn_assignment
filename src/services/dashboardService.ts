import { Record } from "../models/Record";
import { User } from "../models/User";

export const getDashboardStats = async (): Promise<{
    totalUsers: number;
    totalRecords: number;
    totalAmount: number;
}> => {
    const [totalUsers, totalRecords, amountAggregate] = await Promise.all([
        User.countDocuments(),
        Record.countDocuments(),
        Record.aggregate([{ $group: { _id: null, totalAmount: { $sum: "$amount" } } }])
    ]);

    return {
        totalUsers,
        totalRecords,
        totalAmount: amountAggregate[0]?.totalAmount || 0
    };
};
