import { User, type IUser } from "../models/User";

interface ListUsersParams {
    page: number;
    limit: number;
    role?: string;
    status?: string;
}

interface PaginatedUsersResult {
    users: Array<{
        id: string;
        email: string;
        fullName: string;
        role: string;
        status: string;
        createdAt: Date;
        lastLoginAt: Date | null;
    }>;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface UserProfileResult {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
    createdAt: Date;
    lastLoginAt: Date | null;
}

export const getAllUsers = async ({ page, limit, role, status }: ListUsersParams): Promise<PaginatedUsersResult> => {
    const filter: Record<string, unknown> = {};

    if (role) {
        filter.role = role;
    }

    if (status) {
        filter.status = status;
    }

    const [total, users] = await Promise.all([
        User.countDocuments(filter),
        User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
    ]);

    return {
        users: users.map((user: IUser) => ({
            id: String(user._id),
            email: user.email,
            fullName: user.name,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
        })),
        pagination: {
            page,
            limit,
            total,
            pages: Math.max(1, Math.ceil(total / limit))
        }
    };
};

export const getUserById = async (id: string): Promise<IUser | null> =>
    User.findById(id).select("-password");

export const getMyProfile = async (id: string): Promise<UserProfileResult | null> => {
    const user = await User.findById(id)
        .select("email name role status createdAt lastLoginAt")
        .lean();

    if (!user) {
        return null;
    }

    return {
        id: String(user._id),
        email: user.email,
        fullName: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
    };
};

export const updateUserStatus = async (id: string, status: string): Promise<IUser | null> =>
    User.findByIdAndUpdate(
        id,
        {
            status
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");

export const deleteUser = async (id: string): Promise<IUser | null> =>
    User.findByIdAndDelete(id).select("-password");
