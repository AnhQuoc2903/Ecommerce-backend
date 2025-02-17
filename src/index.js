const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "https://shop-small-henna.vercel.app",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

routes(app);

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("Connect Db success!"))
  .catch((err) => console.error("Database connection failed:", err));

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
