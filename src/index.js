//const express = require('express');

import express from 'express';
import cors from 'cors';
import "dotenv/config";
import Job from './lib/cron.js';

import authrouter from "./Routes/authRoutes.js";
import bookrouter from "./Routes/bookRoutes.js";
import { connectDB } from './lib/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

Job.start();
app.use(express.json());
app.use(cors());

app.use("/api/auth",authrouter);
app.use("/api/books", bookrouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB()
});
