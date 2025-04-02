const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/UserModel");

dotenv.config();

const authMiddleWare = async (req, res, next) => {
  try {
    const token = req.headers.token?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "ERROR",
        message: "No token provided",
      });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decodedUser) => {
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

      const user = await User.findById(decodedUser.id);
      if (!user) {
        return res.status(404).json({
          status: "ERROR",
          message: "User not found",
        });
      }

      if (user.isBlocked) {
        return res.status(403).json({
          status: "ERROR",
          message: "Tài khoản của bạn đã bị khóa!",
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
  if (!token) {
    return res.status(401).json({
      status: "ERROR",
      message: "Access token is required",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    if (err) {
      return res.status(404).json({
        status: "ERROR",
        message: "The authentication failed",
      });
    }

    req.user = user;
    next();

    // const userId = req.params.id;

    // if (user.isAdmin || String(user.id) === String(userId)) {
    //   req.user = user;
    //   next();
    // } else {
    //   return res.status(403).json({
    //     status: "ERROR",
    //     message: "Unauthorized access",
    //   });
    // }
  });
};

module.exports = { authMiddleWare, authUserMiddleWare };
