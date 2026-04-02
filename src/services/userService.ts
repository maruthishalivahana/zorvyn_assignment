import { User, type IUser } from "../models/User";
import constants from "../config/constants";

export const getAllUsers = async (): Promise<IUser[]> => User.find().select("-password");

export const getUserById = async (id: string): Promise<IUser | null> =>
    User.findById(id).select("-password");

export const updateUserStatus = async (id: string, status: string): Promise<IUser | null> => {
    if (!Object.values(constants.USER_STATUS).includes(status as (typeof constants.USER_STATUS)[keyof typeof constants.USER_STATUS])) {
        throw new Error("Invalid status value");
    }

    return User.findByIdAndUpdate(
        id,
        {
            status
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password");
};
