const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
require("dotenv").config();
const http = require("http");
const path = require("path");
const app = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);
const { mysqlConnect } = require("../config/index");
const router = require("./api/v1/routes/index");
const corsHelper = require("./helper/cors");
const initSocket = require("./middlewares/socket");
const io = initSocket(server);
const corsOptions = {
  origin: corsHelper.options,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
};

mysqlConnect();
app.use(morgan("combined"));
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(methodOverride("_method"));
app.set("socketio", io);

router(app);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
