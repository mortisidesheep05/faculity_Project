import path from "path";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import morgan from "morgan";

import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import { seedDatabase } from "./seed.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Static folder for uploads
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Database connection helper with connection pooling and cached promise for serverless/Vercel
let cachedPromise = null;

export const connectDB = async () => {
  // If already connected, reuse connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGO_URI environment variable is not defined.");
  }

  // If a connection is already in progress, wait for it
  if (!cachedPromise) {
    const opts = {
      serverSelectionTimeoutMS: 5000, // Fail fast after 5s instead of hanging
    };
    cachedPromise = mongoose.connect(uri, opts).catch((err) => {
      cachedPromise = null;
      throw err;
    });
  }

  try {
    await cachedPromise;
    return mongoose.connection;
  } catch (err) {
    cachedPromise = null;
    throw err;
  }
};

// Database connection middleware for API routes
app.use(async (req, res, next) => {
  // Skip database connection check for non-API routes and health check
  if (!req.path.startsWith("/api") || req.path === "/api/health") {
    return next();
  }

  // If already connected, proceed immediately
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    return res.status(500).json({
      message: `Database connection error: ${err.message}`,
    });
  }
});

// Routes
app.get("/api/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbStatus = states[mongoose.connection.readyState] || "unknown";
  res.status(200).json({
    status: "ok",
    message: "API is running",
    database: dbStatus,
  });
});

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/uploads", uploadRoutes);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("join", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.set("io", io);

// Serve frontend build in production when not on Vercel (e.g. self-hosted / Render / Docker)
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5001;

let mongoServer;
const startServer = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (uri) {
    try {
      // Connect to Permanent MongoDB
      await connectDB();
      console.log(`Connected to Permanent MongoDB Atlas / Local`);

      // Always run seed check to ensure missing default users are created
      await seedDatabase();
    } catch (err) {
      console.error("MongoDB connection error at startup:", err.message);
    }
  } else {
    try {
      // Fallback to In-Memory MongoDB for development
      mongoServer = await MongoMemoryServer.create();
      const memUri = mongoServer.getUri();
      await mongoose.connect(memUri);
      console.log(`Connected to In-Memory MongoDB: ${memUri}`);

      // Always seed in-memory
      await seedDatabase();
    } catch (err) {
      console.error("In-Memory MongoDB startup error:", err.message);
    }
  }

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

// Start standalone server unless executed within Vercel serverless functions
if (!process.env.VERCEL) {
  startServer();
}

export default app;
