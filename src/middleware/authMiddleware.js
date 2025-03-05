const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const authMiddleWare = (req, res, next) => {
  try {
    const token = req.headers.token?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        status: "ERROR",
        message: "No token provided",
      });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({
            status: "ERROR",
            message: "Token expired, please login again",
          });
        }
        return res.status(403).json({
          status: "ERROR",
          message: "Invalid token",
        });
      }

      if (!user?.isAdmin) {
        return res.status(403).json({
          status: "ERROR",
          message: "You are not authorized",
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Middleware Error:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Internal server error",
    });
  }
};

const authUserMiddleWare = (req, res, next) => {
  const token = req.headers.token?.split(" ")[1];
  const userId = req.params.id;

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(404).json({
        status: "ERROR",
        message: "The authentication failed",
      });
    }

    if (user?.isAdmin || user?.id === userId) {
      req.user = user;
      next();
    } else {
      return res.status(403).json({
        status: "ERROR",
        message: "Unauthorized access",
      });
    }
  });
};

module.exports = { authMiddleWare, authUserMiddleWare };
