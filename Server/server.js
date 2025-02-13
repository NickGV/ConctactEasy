require("dotenv").config();
const express = require("express");
const http = require("http");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const contactRoutes = require("./routes/contactRoutes");
const connectDB = require("./config/db");
const configureSocket = require("./config/socketConfig");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();
const server = http.createServer(app);
const io = configureSocket(server);

app.set("io", io);

app.use(express.json());
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contacts", contactRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
