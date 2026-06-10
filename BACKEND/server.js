require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 8000;

// Create uploads directory if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(bodyParser.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadDir));

// MongoDB Connection (updated without deprecated options)
const URL = process.env.MONGODB_URL;
mongoose.connect(URL)
  .then(() => console.log("Mongodb connection success!"))
  .catch(err => console.error("Connection error:", err));

// Import Routes
const feedbackRouter = require("./routes/feedbacks");
const userRouter = require("./routes/users");
const cloudinaryRouter = require("./routes/cloudinaryRoutes");

// Use Routes
app.use("/feedback", feedbackRouter);
app.use("/user", userRouter);
app.use("/api/auth", authRoutes);
app.use("/api/cloudinary", cloudinaryRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port number: ${PORT}`);
});