import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export const connectDatabase = async (): Promise<void> => {
    await mongoose.connect(env.mongodbUri);
    logger.info("MongoDB connected successfully");
};
