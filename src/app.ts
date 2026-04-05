import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import recordRoutes from "./routes/recordRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import inviteRoutes from "./routes/inviteRoutes";

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: true,
        credentials: true
    })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
    res.status(200).json({ success: true, message: "API is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/invites", inviteRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
    await connectDatabase();
    app.listen(env.port, () => {
        console.log(`Server running on port ${env.port}`);
    });
};

void startServer();

export default app;
