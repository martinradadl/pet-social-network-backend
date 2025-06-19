import { Request, Response } from "express";
import * as userModel from "../models/user";
import * as postModel from "../models/post";
import * as storyModel from "../models/story";
import * as sharedPostModel from "../models/shared-post";
import * as savedPostModel from "../models/saved-post";
import * as likedPostModel from "../models/liked-post";
import * as likedCommentModel from "../models/liked-comment";
import * as followModel from "../models/follow";
// import * as directMessageModel from "../models/direct-message";
import * as commentModel from "../models/comment";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { APP_URL, JWT_SECRET } from "../helpers/global";
import * as fs from "fs";
import * as nodemailer from "nodemailer";

// env vars not set
const emailSender = {
  email: process.env.SENDER_EMAIL,
  password: process.env.SENDER_PASSWORD,
};

export const maxAge = 3 * 60 * 60; // 3hrs in sec

export const register = async (req: Request, res: Response) => {
  const { email, username, password, name } = req.body;
  if (password.length < 6) {
    res
      .status(400)
      .json({ message: "Password must have more than 6 characters" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.User.create({
      email,
      username,
      password: hash,
      name,
    });
    const token = jwt.sign({ id: user._id, email }, JWT_SECRET, {
      expiresIn: maxAge,
    });

    res.status(200).json({
      message: "User successfully created",
      user,
      token,
      expiration: maxAge,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message: "Email or Password not present",
    });
  }
  try {
    const user = await userModel.User.findOne({ email });
    if (!user) {
      res.status(401).json({
        message: "Login not successful",
        error: "User not found",
      });
    } else {
      if (user.password && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ id: user._id, email }, JWT_SECRET, {
          expiresIn: maxAge, // 3hrs in sec
        });
        res.status(200).json({
          message: "Login successful",
          user,
          token,
          expiration: maxAge,
        });
      } else {
        res.status(400).json({ message: "Login not successful" });
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const edit = async (req: Request, res: Response) => {
  try {
    if (req.file?.path) {
      req.body.profilePic = req.file?.path;
    }
    const { username, name, bio, profilePic, isPrivate } = req.body;

    const user = await userModel.User.findByIdAndUpdate(
      req.params.id,
      { $set: { username, name, bio, profilePic, isPrivate } },
      { new: true }
    );
    if (!user) {
      res.status(401).json({
        message: "Edit not successful",
        error: "User not found",
      });
    }
    // Empty string means profilePic removal was requested
    if (req.body.profilePic === "") {
      const filePath = `uploads/${req.params.id}.jpg`;

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error removing file: ${err}`);
        }
      });
    }
    res.status(200).json(user);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const newPassword = req.headers.newpassword?.toString();
  if (newPassword && newPassword.length < 6) {
    res
      .status(400)
      .json({ message: "Password must have more than 6 characters" });
  }
  try {
    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 10);
      const user = await userModel.User.findByIdAndUpdate(
        req.params.id,
        { $set: { password: hash } },
        { new: true }
      );
      if (!user) {
        res.status(401).json({
          message: "Edit not successful",
          error: "User not found",
        });
      }
      res.status(200).json(user);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const checkPassword = async (req: Request, res: Response) => {
  const password = req.headers.password?.toString();
  try {
    const user = await userModel.User.findById(req.params.id);
    if (!user) {
      res.status(401).json({
        message: "Could not check password",
        error: "User not found",
      });
    } else {
      const isCorrectPassword =
        user.password &&
        password &&
        (await bcrypt.compare(password, user.password));
      res.status(200).json(isCorrectPassword);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deletedUser = await userModel.User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      res.status(401).json({
        message: "Delete not successful",
        error: "User not found",
      });
    }
    await storyModel.Story.deleteMany({ userId: req.params.id });
    await sharedPostModel.SharedPost.deleteMany({ userId: req.params.id });
    await savedPostModel.SavedPost.deleteMany({ userId: req.params.id });
    await postModel.Post.deleteMany({ userId: req.params.id });
    await likedPostModel.LikedPost.deleteMany({ userId: req.params.id });
    await likedCommentModel.LikedComment.deleteMany({ userId: req.params.id });
    await followModel.Follow.deleteMany({
      $or: [{ followerId: req.params.id }, { followedId: req.params.id }],
    });
    await commentModel.Comment.deleteMany({ userId: req.params.id });
    // Direct messages and chats are not deleted

    res.status(200).json(deletedUser);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const user = await userModel.User.findOne({ email });

    if (!user) {
      res.status(200).json({
        message: `Email has been sent to ${email}`,
      });
    } else {
      const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: maxAge,
      });

      const link = `${APP_URL}/reset-password/?userId=${user._id}&token=${token}`;

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 3000,
        secure: true,
        auth: {
          user: emailSender.email,
          pass: emailSender.password,
        },
      });

      if (user.email) {
        const mailOptions = {
          from: emailSender.email,
          to: user.email,
          subject: "Reset Password from Petgram",
          html: `<h1>Reset Password</h1><p>Hi ${user.name}, you have forgotten your password. Don't worry, just click on this button</p><a href="${link}"><button>Reset Password</button></a>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email: ", error);
          } else {
            console.log("Email sent: ", info.response);
          }
        });
      }

      res.status(200).json({
        message: `Email has been sent to ${email}`,
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const newPassword = req.headers.newpassword?.toString();
  if (newPassword && newPassword.length < 6) {
    res
      .status(400)
      .json({ message: "Password must have more than 6 characters" });
  }
  try {
    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 10);
      const user = await userModel.User.findByIdAndUpdate(
        req.params.id,
        { $set: { password: hash } },
        { new: true }
      );
      if (!user) {
        res.status(401).json({
          message: "Password change not successful",
          error: "User not found",
        });
      }
      res.status(200).json(user);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
