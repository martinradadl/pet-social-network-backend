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
import { API_URL, JWT_SECRET } from "../helpers/global";
import * as fs from "fs";
import * as nodemailer from "nodemailer";
import {
  generateResetPasswordTemplate,
  generateSuccessfulResetPasswordTemplate,
  generateUserVerificationTemplate,
} from "../templates/auth-templates";

const emailSender = {
  email: process.env.SENDER_EMAIL,
  password: process.env.SENDER_PASSWORD,
};

export const maxAge = 3 * 60 * 60; // 3hrs in sec

export const register = async (req: Request, res: Response) => {
  const { email, username, password, name } = req.body;
  let token = "";

  if (password.length < 6) {
    res
      .status(400)
      .json({ message: "Password must have more than 6 characters" });
    return;
  }

  try {
    token = jwt.sign({ email }, JWT_SECRET, {
      expiresIn: maxAge,
    });

    const hash = await bcrypt.hash(password, 10);
    await userModel.User.create({
      email,
      username,
      password: hash,
      name,
      isPrivate: false,
      isVerified: false,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
      return;
    }
  }

  const link = `${API_URL}/auth/verify-account/?xt=${token}`;

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

  const mailOptions = {
    from: emailSender.email,
    to: email,
    subject: "Activate your Petgram account",
    html: /*HTML*/ `<h1>Activate your account</h1>
    <p>
      Hi ${name}, Your registration is almost finished, just click on this button to
      activate your account
    </p>
    <a href="${link}"><button>Activate</button></a>`,
  };

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
        res.status(400).json({ message: "Email could not be sent" });
      } else {
        console.log("Email sent: ", info.response);
        res.status(200).json({
          message: `Email has been sent to ${email}`,
        });
      }
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const token = req.query.xt;
    let error = "";
    let email = "";

    if (token) {
      jwt.verify(token.toString(), JWT_SECRET, (err, decoded) => {
        if (err) {
          error =
            "Something unexpected happened, please try again or contact support";
        } else {
          email = decoded?.toString() || "";
        }
      });
    } else {
      // token not available error
      error = "Not Authorized";
    }
    if (email) {
      await userModel.User.findOneAndUpdate(
        { email },
        { $set: { isVerified: true } },
        { new: true }
      );
    }
    const template = generateUserVerificationTemplate(email, error);
    res.send(template);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (!(email || username) || !password) {
    res.status(400).json({
      message: "Email or Password not present",
    });
    return;
  }
  try {
    const user = await userModel.User.findOne(email ? { email } : { username });
    if (!user) {
      res.status(401).json({
        message: "Your credentials are incorrect",
        error: "Login not successful",
      });
    } else {
      if (user.password && (await bcrypt.compare(password, user.password))) {
        if (!user.isVerified) {
          res.status(401).json({
            message: "User not verified",
            error: "Login not successful",
          });
        }
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
      return;
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
    return;
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
        return;
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
      return;
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
      return;
    } else {
      const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: maxAge,
      });

      const link = `${API_URL}/auth/reset-password/?xt=${token}`;

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
          html: /*HTML*/ `<h1>Reset Password</h1>
          <p>
            Hi ${user.name}, you have forgotten your password. Don't worry, just click on
            this button
          </p>
          <a href="${link}"><button>Reset Password</button></a>`,
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

export const resetPasswordForm = async (req: Request, res: Response) => {
  const token = req.query.xt?.toString();
  if (token) {
    const template = generateResetPasswordTemplate(token);
    res.send(template);
  } else {
    res.status(401).json({
      message: "Not Authorized",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { new_password, confirm_password } = req.body;
  const token = req.query.xt;
  let id = "";
  let error = "";

  if (!(new_password && confirm_password)) {
    res.status(400).json({ message: "There are empty fields" });
    return;
  }
  if (new_password !== confirm_password) {
    res
      .status(400)
      .json({ message: "New Password and Confirm Password doesn't match" });
    return;
  }
  if (new_password && new_password.toString().length < 6) {
    res
      .status(400)
      .json({ message: "Password must have more than 6 characters" });
    return;
  }
  try {
    if (token) {
      jwt.verify(token.toString(), JWT_SECRET, async (err, decoded) => {
        if (err) {
          error =
            "Something unexpected happened, please try again or contact support";
        } else {
          //@ts-expect-error decoded type
          id = decoded?.id;
        }
      });
      const hash = await bcrypt.hash(new_password.toString(), 10);
      if (id) {
        const user = await userModel.User.findByIdAndUpdate(
          id || "",
          { $set: { password: hash } },
          { new: true }
        );
        if (!user) {
          error = "Password change not successful";
        }
      } else {
        error = "Not Authorized";
      }

      if (error) {
        res.status(401).json({
          message: error,
        });
        return;
      }
      const template = generateSuccessfulResetPasswordTemplate();
      res.send(template);
    } else {
      error = "Not Authorized";
      res.status(401).json({
        message: error,
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};
