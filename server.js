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

// Vercel serverless DB connection middleware
app.use(async (req, res, next) => {
  if (process.env.VERCEL) {
    if (mongoose.connection.readyState !== 1) {
      if (process.env.MONGO_URI) {
        try {
          await mongoose.connect(process.env.MONGO_URI);
        } catch (err) {
          console.error("Vercel MongoDB connection error:", err);
        }
      } else {
        console.warn("WARNING: MONGO_URI environment variable is not set on Vercel.");
      }
    }
  }
  next();
});

// Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" });
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
  try {
    let uri = process.env.MONGO_URI;

    if (uri) {
      // Connect to Permanent MongoDB
      await mongoose.connect(uri);
      console.log(`Connected to Permanent MongoDB Atlas / Local`);

      // Always run seed check to ensure missing default users are created
      await seedDatabase();
    } else {
      // Fallback to In-Memory MongoDB for development
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log(`Connected to In-Memory MongoDB: ${uri}`);

      // Always seed in-memory
      await seedDatabase();
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

// Start standalone server unless executed within Vercel serverless functions
if (!process.env.VERCEL) {
  startServer();
}

export default app;
