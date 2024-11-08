const userRouter = require("./user.route");
const pageRouter = require("./page.route");
const messageRouter = require("./message.route");

module.exports = async (app) => {
    app.use("/api/user", userRouter);
    app.use("/api/page", pageRouter);
    app.use("/api/message", messageRouter);
};