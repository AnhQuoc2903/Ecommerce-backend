const UserService = require("../services/UserService");
const JwtService = require("../services/JwtService");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");

const nodeCrypto = require("crypto");

const token = nodeCrypto.randomBytes(20).toString("hex");

const nodemailer = require("nodemailer");

const client = new OAuth2Client(process.env.GG_CLIENT_ID);

const createUser = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isCheckEmail = reg.test(email);
    if (!email || !password || !confirmPassword) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is email",
      });
    } else if (password !== confirmPassword) {
      return res.status(200).json({
        status: "ERR",
        message: "The password is equal confirmPassword.",
      });
    }
    const response = await UserService.createUser(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isCheckEmail = reg.test(email);
    if (!email || !password) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is email",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "ERR",
        message: "User not found",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        status: "ERR",
        message: "Tài khoản của bạn đã bị khóa!",
      });
    }

    const response = await UserService.loginUser(req.body);
    const { refresh_token, ...newResponse } = response;
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      samesite: "strict",
    });
    return res.status(200).json(newResponse);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "The userId is required",
      });
    }

    if (data.phone) {
      data.phone = String(data.phone);

      const phoneRegex = /^0\d{9}$/;

      if (!/^\d*$/.test(data.phone)) {
        return res.status(400).json({
          status: "ERR",
          message: "Số điện thoại chỉ được chứa số!",
        });
      }

      if (data.phone.length !== 10) {
        return res.status(400).json({
          status: "ERR",
          message: "Số điện thoại phải có đúng 10 số!",
        });
      }

      if (!phoneRegex.test(data.phone)) {
        return res.status(400).json({
          status: "ERR",
          message: "Số điện thoại phải bắt đầu bằng số 0!",
        });
      }
    }

    const response = await UserService.updateUser(userId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: "Internal Server Error",
      error: e.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    const response = await UserService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const deleteManyUser = async (req, res) => {
  try {
    const ids = req.body.ids;
    if (!ids) {
      return res.status(200).json({
        status: "ERR",
        message: "The ids is required",
      });
    }
    const response = await UserService.deleteManyUser(ids);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    const response = await UserService.getDetailsUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req?.cookies?.refresh_token;

    if (!token) {
      return res.status(200).json({
        status: "ERR",
        message: "The token is required",
      });
    }

    const response = await JwtService.refreshTokenJwtService(token);

    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      status: "ERR",
      message: e.message || "An unexpected error occurred.",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({
      status: "OK",
      message: "Logout successfully",
    });
  } catch (e) {
    return res.status(404).json({
      status: "ERR",
      message: e.message || "An unexpected error occurred.",
    });
  }
};

const verifyToken = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GG_CLIENT_ID,
  });
  return ticket.getPayload();
};

const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Token is required" });
    }

    const payload = await verifyToken(token);
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, avatar: picture });
    }

    const accessToken = JwtService.generateAccessToken({ id: user._id });
    const refreshToken = JwtService.generateRefreshToken({ id: user._id });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({ status: "OK", accessToken, user });
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: "Google Authentication failed",
      error: e.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "ERR", message: "User not found" });
    }

    const token = nodeCrypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset Request",
      text: `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu của mình.
Vui lòng nhấp vào liên kết sau hoặc dán nó vào trình duyệt của bạn để hoàn tất quá trình:
http://localhost:3000/reset-password/${token}

Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ status: "ERR", message: "Failed to send email" });
      }
      res
        .status(200)
        .json({ status: "OK", message: "Password reset email sent" });
    });
  } catch (e) {
    res.status(500).json({ status: "ERR", message: e.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Password is required" });
    }
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Passwords do not match" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ status: "ERR", message: "Invalid or expired token" });
    }

    user.password = bcrypt.hashSync(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ status: "OK", message: "Password has been reset" });
  } catch (e) {
    res.status(500).json({ status: "ERR", message: e.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.params.id; // Lấy từ URL thay vì req.user.id
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "ERR",
        message: "Mật khẩu mới không trùng khớp",
      });
    }

    const response = await UserService.changePassword(
      userId,
      oldPassword,
      newPassword
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

const blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isBlocked } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "User ID is required",
      });
    }

    const response = await UserService.blockUser(userId, isBlocked);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  refreshToken,
  logoutUser,
  deleteManyUser,
  googleAuth,
  forgotPassword,
  resetPassword,
  changePassword,
  blockUser,
};
