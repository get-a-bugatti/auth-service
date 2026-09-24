import "./config/env.js";
import { connectDb } from "./config/db.js";
import { app } from "./app.js";
import mongoose from "mongoose";
import http from "http";
// import "./seeders/addUsersToDb.js";

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected! Attempting to reconnect...");
});

mongoose.connection.on("error", (err) => {
  console.error(`❌ MongoDB connection error: ${err}`);
});

let httpServer = null;

const startServer = () => {
  connectDb()
    .then((db) => {
      console.log(
        "✅ MongoDB connected! Connection Host : ",
        db.connection.host
      );

      httpServer = http.createServer(app);
      const port = process.env.PORT || 3000;

      httpServer.listen(port, () => {
        console.log("✅ Server started on port", port);
      });

      httpServer.on("error", (err) => {
        console.error(`❌ Server error: ${err}`);

        process.exit(1);
      });
    })
    .catch((err) => {
      console.error(`❌ MongoDB Startup Error: ${err}`);

      process.exit(1);
    });
};

const gracefulShutdown = async () => {
  try {
    httpServer.close(() => {
      console.log("✅ HTTP Server closed.");
    });

    try {
      await mongoose.connection.close(false);
    } catch (mongooseError) {
      console.error("Error closing mongoose connection.");
    }
  } catch (error) {
    console.error("Error during graceful shutdown", error.message);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

startServer();
