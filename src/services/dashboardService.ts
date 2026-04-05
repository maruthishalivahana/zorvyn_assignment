import { Types } from "mongoose";
import constants from "../config/constants";
import { Record, type IRecord } from "../models/Record";

export type DashboardPeriodType = "monthly" | "weekly";
export type DashboardCategoryType = "income" | "expense" | "all";

export interface DashboardScope {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface DashboardSummaryResult {
    summary: {
        totalIncome: number;
        totalExpenses: number;
        netBalance: number;
        transactionCount: {
            income: number;
            expense: number;
        };
        averageTransaction: {
            income: number;
            expense: number;
        };
    };
    period: {
        startDate: string;
        endDate: string;
    };
}

export interface DashboardCategoryBreakdownResult {
    categories: Array<{
        category: string;
        type: "income" | "expense";
        total: number;
        count: number;
        percentage: number;
    }>;
    totals: {
        income: number;
        expense: number;
    };
}

export interface DashboardTrendResult {
    trends: Array<{
        period: string;
        label: string;
        income: number;
        expense: number;
        balance: number;
        transactionCount: number;
    }>;
}

export interface DashboardRecentActivityResult {
    recentRecords: Array<{
        id: string;
        title: string;
        amount: number;
        type: string;
        category: string;
        date: Date;
        description: string | null;
        createdAt: Date;
    }>;
}

type MatchFilter = {
    [key: string]: unknown;
};

const createObjectId = (id: string): Types.ObjectId => new Types.ObjectId(id);

const formatDateRange = (startDate: Date, endDate: Date): { startDate: string; endDate: string } => ({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
});

const buildMatch = (scope: DashboardScope): MatchFilter => {
    const match: MatchFilter = {
        isDeleted: false
    };

    if (scope.userId) {
        match.userId = createObjectId(scope.userId);
    }

    if (scope.startDate || scope.endDate) {
        const dateFilter: MatchFilter = {};

        if (scope.startDate) {
            dateFilter.$gte = scope.startDate;
        }

        if (scope.endDate) {
            dateFilter.$lte = scope.endDate;
        }

        match.date = dateFilter;
    }

    return match;
};

const getMonthStart = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);

const getMonthEnd = (date: Date): Date => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

const normalizeMonthRange = (startDate?: Date, endDate?: Date): { startDate?: Date; endDate?: Date } => {
    // If no dates provided, return undefined to query ALL records (no date filtering)
    if (!startDate && !endDate) {
        return {};
    }

    if (startDate && endDate) {
        return { startDate, endDate };
    }

    if (startDate) {
        return {
            startDate,
            endDate: getMonthEnd(startDate)
        };
    }

    return {
        startDate: getMonthStart(endDate as Date),
        endDate: endDate as Date
    };
};

const getMonthKey = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getMonthLabel = (date: Date): string =>
    date.toLocaleString("en-US", {
        month: "long",
        year: "numeric"
    });

const getIsoWeekInfo = (date: Date): { year: number; week: number } => {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - day);

    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

    return {
        year: target.getUTCFullYear(),
        week
    };
};

const getWeekStart = (date: Date): Date => {
    const copy = new Date(date);
    const day = copy.getDay() || 7;
    copy.setDate(copy.getDate() - day + 1);
    copy.setHours(0, 0, 0, 0);
    return copy;
};

const getWeekKey = (date: Date): string => {
    const weekInfo = getIsoWeekInfo(date);
    return `${weekInfo.year}-W${String(weekInfo.week).padStart(2, "0")}`;
};

const getWeekLabel = (date: Date): string => {
    const weekInfo = getIsoWeekInfo(date);
    return `Week ${weekInfo.week}, ${weekInfo.year}`;
};

const resolveScopeMatch = (scope: DashboardScope): MatchFilter => buildMatch(scope);

export const getDashboardSummary = async (scope: DashboardScope): Promise<DashboardSummaryResult> => {
    const normalized = normalizeMonthRange(scope.startDate, scope.endDate);
    const startDate = normalized.startDate || scope.startDate;
    const endDate = normalized.endDate || scope.endDate;
    const match = resolveScopeMatch({ ...scope, startDate, endDate });

    const [result] = await Record.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalIncome: {
                    $sum: {
                        $cond: [{ $eq: ["$type", constants.RECORD_TYPES.INCOME] }, "$amount", 0]
                    }
                },
                totalExpenses: {
                    $sum: {
                        $cond: [{ $eq: ["$type", constants.RECORD_TYPES.EXPENSE] }, "$amount", 0]
                    }
                },
                incomeCount: {
                    $sum: {
                        $cond: [{ $eq: ["$type", constants.RECORD_TYPES.INCOME] }, 1, 0]
                    }
                },
                expenseCount: {
                    $sum: {
                        $cond: [{ $eq: ["$type", constants.RECORD_TYPES.EXPENSE] }, 1, 0]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalIncome: 1,
                totalExpenses: 1,
                netBalance: { $subtract: ["$totalIncome", "$totalExpenses"] },
                transactionCount: {
                    income: "$incomeCount",
                    expense: "$expenseCount"
                },
                averageTransaction: {
                    income: {
                        $cond: [
                            { $gt: ["$incomeCount", 0] },
                            { $divide: ["$totalIncome", "$incomeCount"] },
                            0
                        ]
                    },
                    expense: {
                        $cond: [
                            { $gt: ["$expenseCount", 0] },
                            { $divide: ["$totalExpenses", "$expenseCount"] },
                            0
                        ]
                    }
                }
            }
        }
    ]);

    const summary = result ?? {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        transactionCount: { income: 0, expense: 0 },
        averageTransaction: { income: 0, expense: 0 }
    };

    return {
        summary,
        period: startDate && endDate ? formatDateRange(startDate, endDate) : { startDate: "all", endDate: "all" }
    };
};

export const getDashboardCategoryBreakdown = async (
    scope: DashboardScope & { type?: DashboardCategoryType }
): Promise<DashboardCategoryBreakdownResult> => {
    const match = resolveScopeMatch(scope);

    if (scope.type && scope.type !== "all") {
        match.type = scope.type;
    }

    const [categories, totals] = await Promise.all([
        Record.aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        category: "$category",
                        type: "$type"
                    },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    total: -1,
                    count: -1
                }
            }
        ]),
        Record.aggregate([
            { $match: resolveScopeMatch(scope) },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: "$amount" }
                }
            }
        ])
    ]);

    const totalsByType = {
        income: 0,
        expense: 0
    };

    totals.forEach((entry: { _id: string; total: number }) => {
        if (entry._id === constants.RECORD_TYPES.INCOME) {
            totalsByType.income = entry.total;
        }

        if (entry._id === constants.RECORD_TYPES.EXPENSE) {
            totalsByType.expense = entry.total;
        }
    });

    return {
        categories: categories.map((entry: { _id: { category: string; type: "income" | "expense" }; total: number; count: number }) => {
            const totalForType = entry._id.type === constants.RECORD_TYPES.INCOME ? totalsByType.income : totalsByType.expense;

            return {
                category: entry._id.category,
                type: entry._id.type,
                total: entry.total,
                count: entry.count,
                percentage: totalForType > 0 ? Number(((entry.total / totalForType) * 100).toFixed(2)) : 0
            };
        }),
        totals: totalsByType
    };
};

export const getDashboardTrends = async (
    scope: DashboardScope,
    period: DashboardPeriodType,
    periods = 6
): Promise<DashboardTrendResult> => {
    const now = new Date();
    const windowSize = Math.max(1, Math.min(periods, 12));
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(now);

    if (period === "weekly") {
        startDate.setDate(startDate.getDate() - ((windowSize - 1) * 7));
        startDate.setHours(0, 0, 0, 0);
    } else {
        startDate.setMonth(startDate.getMonth() - (windowSize - 1));
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
    }

    const match = resolveScopeMatch({ ...scope, startDate, endDate });

    if (period === "weekly") {
        const trends = await Record.aggregate([
            { $match: match },
            {
                $group: {
                    _id: {
                        year: { $isoWeekYear: "$date" },
                        week: { $isoWeek: "$date" }
                    },
                    income: {
                        $sum: {
                            $cond: [{ $eq: ["$type", constants.RECORD_TYPES.INCOME] }, "$amount", 0]
                        }
                    },
                    expense: {
                        $sum: {
                            $cond: [{ $eq: ["$type", constants.RECORD_TYPES.EXPENSE] }, "$amount", 0]
                        }
                    },
                    transactionCount: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } }
        ]);

        return {
            trends: trends.map((entry: { _id: { year: number; week: number }; income: number; expense: number; transactionCount: number }) => ({
                period: `${entry._id.year}-W${String(entry._id.week).padStart(2, "0")}`,
                label: `Week ${entry._id.week}, ${entry._id.year}`,
                income: entry.income,
                expense: entry.expense,
                balance: entry.income - entry.expense,
                transactionCount: entry.transactionCount
            }))
        };
    }

    const trends = await Record.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    year: { $year: "$date" },
                    month: { $month: "$date" }
                },
                income: {
                    $sum: {
                        $cond: [{ $eq: ["$type", constants.RECORD_TYPES.INCOME] }, "$amount", 0]
                    }
                },
                expense: {
                    $sum: {
                        $cond: [{ $eq: ["$type", constants.RECORD_TYPES.EXPENSE] }, "$amount", 0]
                    }
                },
                transactionCount: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    return {
        trends: trends.map((entry: { _id: { year: number; month: number }; income: number; expense: number; transactionCount: number }) => {
            const trendDate = new Date(entry._id.year, entry._id.month - 1, 1);

            return {
                period: getMonthKey(trendDate),
                label: getMonthLabel(trendDate),
                income: entry.income,
                expense: entry.expense,
                balance: entry.income - entry.expense,
                transactionCount: entry.transactionCount
            };
        })
    };
};

export const getDashboardRecentActivity = async (
    scope: DashboardScope,
    limit: number
): Promise<DashboardRecentActivityResult> => {
    const safeLimit = Math.max(1, Math.min(limit, 50));
    const records = await Record.find(resolveScopeMatch(scope))
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .select("title amount type category date description createdAt");

    return {
        recentRecords: records.map((record: IRecord) => ({
            id: String(record._id),
            title: record.title,
            amount: record.amount,
            type: record.type,
            category: record.category,
            date: record.date,
            description: record.description,
            createdAt: record.createdAt
        }))
    };
};
