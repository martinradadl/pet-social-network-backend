import { afterEach, describe, expect, it, vi } from "vitest";
import { initializeReqResMocks, mockedCatchError } from "./utils";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as nodemailer from "nodemailer";
import * as fs from "fs";
import { fakeToken, fakeUser, fakeUser2 } from "./fake-data/auth";
import { tokenVerification } from "../middleware/auth";
import {
  changePassword,
  checkPassword,
  deleteUser,
  edit,
  forgotPassword,
  login,
  maxAge,
  register,
  resetPassword,
  verifyAccount,
} from "../controllers/auth";
import { User } from "../models/user";
import {
  generateSuccessfulResetPasswordTemplate,
  generateUserVerificationTemplate,
} from "../templates/auth-templates";
import { Story } from "../models/story";
import { SharedPost } from "../models/shared-post";
import { SavedPost } from "../models/saved-post";
import { Post } from "../models/post";
import { LikedPost } from "../models/liked-post";
import { LikedComment } from "../models/liked-comment";
import { Follow } from "../models/follow";
import { Comment } from "../models/comment";

vi.mock("jsonwebtoken");
vi.mock("bcryptjs");
vi.mock("nodemailer");
vi.mock("fs");
vi.mock("../models/user");
vi.mock("../models/story");
vi.mock("../models/shared-post");
vi.mock("../models/saved-post");
vi.mock("../models/post");
vi.mock("../models/liked-post");
vi.mock("../models/liked-comment");
vi.mock("../models/follow");
vi.mock("../models/comment");

describe("Auth Middleware", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockedNext = vi.fn().mockImplementation(() => {});

  it("should tokenVerification return 401 if token is nullish", async () => {
    const { req, res } = initializeReqResMocks();
    tokenVerification(req, res, mockedNext);
    expect(res.statusCode).toBe(401);
  });

  it("should tokenVerification return 401 if token is not nullish", async () => {
    const { req, res } = initializeReqResMocks();
    req.cookies.jwt = "token";
    tokenVerification(req, res, mockedNext);
    expect(res.statusCode).toBe(401);
    expect(mockedNext).not.toHaveBeenCalled();
  });

  it("should tokenVerification invoke next if token is verified", () => {
    const { req, res } = initializeReqResMocks();
    vi.mocked(jwt, true).verify.mockImplementation(() => mockedNext());
    req.headers.authorization = `Bearer ${fakeToken}`;
    tokenVerification(req, res, mockedNext);
    expect(mockedNext).toHaveBeenCalled();
  });
});

describe("Authentication Controllers", () => {
  describe("Register Controller", async () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 400 when password is less than 6 characters ", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = { ...fakeUser, password: "12345" };
      await register(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "Password must have more than 6 characters",
      });
    });

    it("should return 500 when an error is thrown when hashing the password", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeUser;
      vi.mocked(bcrypt, true).hash.mockImplementation(() => {
        throw mockedCatchError;
      });
      await register(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: mockedCatchError.message,
      });
    });

    it("should return 500 when an error is thrown when creating a user", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeUser;
      vi.mocked(User.create, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      await register(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: mockedCatchError.message,
      });
    });

    it("should return 400 when an error is thrown when sending a mail", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeUser;

      User.create = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve(fakeUser));

      jwt.sign = vi.fn().mockImplementationOnce(() => fakeToken);

      //@ts-expect-error create transport function mocked
      vi.mocked(nodemailer, true).createTransport.mockReturnValue({
        sendMail: vi.fn().mockImplementation((_mailOptions, callback) => {
          callback(true, null);
        }),
      });

      await register(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "Email could not be sent",
      });
    });

    it("should return 200 when email is sent successfully", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeUser;

      User.create = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve(fakeUser));

      jwt.sign = vi.fn().mockImplementationOnce(() => fakeToken);

      //@ts-expect-error mocking transporter
      vi.mocked(nodemailer, true).createTransport.mockReturnValue({
        sendMail: vi.fn().mockImplementation((_mailOptions, callback) => {
          callback(null, true);
        }),
      });

      await register(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: `Email has been sent to ${fakeUser.email}`,
      });
    });
  });

  describe("Verify Account Controller", async () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when an error is thrown verifying the token", async () => {
      const { req, res } = initializeReqResMocks();
      req.query.xt = "fakeToken";
      vi.mocked(jwt, true).verify.mockImplementation(() => {
        throw mockedCatchError;
      });

      await verifyAccount(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: mockedCatchError.message,
      });
    });

    it("should return 200 when an error appears on the callback of jwt.verify", async () => {
      const { req, res } = initializeReqResMocks();
      req.query.xt = "fakeToken";
      vi.mocked(jwt, true).verify.mockImplementation(
        (_token, _JWT_SECRET, callback) => {
          //@ts-expect-error on callback
          callback(true, null);
        }
      );
      const error =
        "Something unexpected happened, please try again or contact support";
      await verifyAccount(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(
        generateUserVerificationTemplate("", error)
      );
    });

    it("should return 200 when email is successfully decoded", async () => {
      const { req, res } = initializeReqResMocks();
      req.query.xt = "fakeToken";
      vi.mocked(jwt, true).verify.mockImplementation(
        (_token, _JWT_SECRET, callback) => {
          //@ts-expect-error on callback
          callback(null, { toString: () => "fakeEmail" });
        }
      );

      await verifyAccount(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(
        generateUserVerificationTemplate("fakeEmail", "")
      );
    });

    it("should return 200 when token is not available", async () => {
      const { req, res } = initializeReqResMocks();
      req.query.xt = "";
      const error = "Not Authorized";

      await verifyAccount(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(
        generateUserVerificationTemplate("", error)
      );
    });
  });

  describe("Login Controller", async () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 400 when Email or Password are not present", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = { email: "fakeEmail", password: "" };
      const error = "Email or Password not present";
      await login(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: error,
      });
    });

    it("should return 401 when user is not found", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = { email: "fakeEmail", password: "fakePassword" };
      vi.mocked(User.findOne, true).mockResolvedValue(null);

      await login(req, res);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Login not successful",
        error: "User not found",
      });
    });

    it("should return 500 when an error is thrown comparing password hash", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = { email: "fakeEmail", password: "fakePassword" };
      vi.mocked(User.findOne, true).mockResolvedValue(fakeUser);
      vi.mocked(bcrypt, true).compare.mockImplementation(() => {
        throw mockedCatchError;
      });

      await login(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: mockedCatchError.message,
      });
    });

    it("should return 400 when password doesn't match", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = { email: "fakeEmail", password: "fakePassword" };
      vi.mocked(User.findOne, true).mockResolvedValue(fakeUser);
      bcrypt.compare = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve(false));

      await login(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "Login not successful",
      });
    });

    it("should return 200 when successfully logged in", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = { email: "fakeEmail", password: "fakePassword" };
      vi.mocked(User.findOne, true).mockResolvedValue(fakeUser);
      bcrypt.compare = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve(true));
      jwt.sign = vi.fn().mockImplementationOnce(() => fakeToken);

      await login(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: "Login successful",
        user: fakeUser,
        token: fakeToken,
        expiration: maxAge,
      });
    });
  });

  describe("Edit User Controller", async () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when an error is thrown when updating the user", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeUser2;
      vi.mocked(User.findByIdAndUpdate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      edit(req, res);
      expect(res._getJSONData()).toEqual({
        message: mockedCatchError.message,
      });
    });

    it("should return 401 when user is not found", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeUser;
      vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(null);

      await edit(req, res);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Edit not successful",
        error: "User not found",
      });
    });

    it("should return 200 when user is successfully edited", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = fakeUser2;
      vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(fakeUser2);

      await edit(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeUser2);
    });

    it("should return error when removing profile pic", async () => {
      const { req, res } = initializeReqResMocks();
      req.body = { ...fakeUser2, profilePic: "" };
      vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(fakeUser2);

      vi.mocked(fs, true).unlink.mockImplementation((_filePath, callback) => {
        callback(new Error("Error removing file"));
      });

      await edit(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeUser2);
    });
  });

  describe("Change Password Controller", async () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 400 when password is less than 6 characters ", async () => {
      const { req, res } = initializeReqResMocks();
      req.headers.newpassword = "12345";
      await changePassword(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "Password must have more than 6 characters",
      });
    });

    it("should return 500 when error is thrown", async () => {
      vi.mocked(User.findByIdAndUpdate, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      req.headers.newpassword = "newPassword";
      await changePassword(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should not find userId", async () => {
      vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(null);
      const { req, res } = initializeReqResMocks();
      req.headers.newpassword = "newPassword";
      await changePassword(req, res);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Edit not successful",
        error: "User not found",
      });
    });

    it("Should update password", async () => {
      const { req, res } = initializeReqResMocks();
      req.headers.newpassword = "newPassword";
      vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(fakeUser);
      await changePassword(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeUser);
    });
  });

  describe("Check Password Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is thrown", async () => {
      vi.mocked(User.findById, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      req.params.id = fakeUser._id;
      await checkPassword(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 401 when user is not found", async () => {
      vi.mocked(User.findById, true).mockResolvedValue(null);
      const { req, res } = initializeReqResMocks();
      req.params.id = fakeUser._id;
      await checkPassword(req, res);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Could not check password",
        error: "User not found",
      });
    });

    it("Should return true", async () => {
      vi.mocked(User.findById, true).mockResolvedValue(fakeUser);
      vi.mocked(bcrypt, true).compare.mockImplementation(() =>
        Promise.resolve(true)
      );
      const { req, res } = initializeReqResMocks();
      req.params.id = fakeUser._id;
      req.headers.password = "newFakePassword";
      await checkPassword(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toBeTruthy();
    });
  });

  describe("Delete User Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 500 when error is thrown", async () => {
      vi.mocked(User.findByIdAndDelete, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await deleteUser(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 401 when userId is not found", async () => {
      const { req, res } = initializeReqResMocks();
      await deleteUser(req, res);
      vi.mocked(User.findByIdAndDelete, true).mockResolvedValue(null);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Delete not successful",
        error: "User not found",
      });
    });

    it("Should delete User", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(User.findByIdAndDelete, true).mockResolvedValue(fakeUser);

      Story.deleteMany = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve());
      SharedPost.deleteMany = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve());
      SavedPost.deleteMany = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve());
      Post.deleteMany = vi.fn().mockImplementationOnce(() => Promise.resolve());
      LikedPost.deleteMany = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve());
      LikedComment.deleteMany = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve());
      Follow.deleteMany = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve());
      Comment.deleteMany = vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve());

      await deleteUser(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(fakeUser);
    });
  });

  describe("Forgot Password Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    const mockedSendEmail = vi.fn();

    it("should return 500 when error is thrown", async () => {
      vi.mocked(User.findOne, true).mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      await forgotPassword(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it("should return 200 when user is not found", async () => {
      vi.mocked(User.findOne, true).mockResolvedValue(null);
      const { req, res } = initializeReqResMocks();
      req.params.email = fakeUser.email;
      await forgotPassword(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: `Email has been sent to ${fakeUser.email}`,
      });
    });

    it("Should send email to user with reset password link", async () => {
      vi.mocked(User.findOne, true).mockResolvedValue(fakeUser);
      const { req, res } = initializeReqResMocks();
      req.params.email = fakeUser.email;
      //@ts-expect-error types of mock doesn't match with real function
      vi.mocked(jwt, true).sign.mockReturnValue(fakeToken);
      //@ts-expect-error types of mock doesn't match with real function
      vi.mocked(nodemailer, true).createTransport.mockImplementationOnce(() => {
        return { sendMail: mockedSendEmail };
      });
      await forgotPassword(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: `Email has been sent to ${fakeUser.email}`,
      });
    });
  });

  describe("Reset Password Controller", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 400 when there are empty fields on the form", async () => {
      const { req, res } = initializeReqResMocks();
      req.body.new_password = "12346";
      req.body.confirm_password = "";
      await resetPassword(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "There are empty fields",
      });
    });

    it("should return 400 when password confirmation doesn't match", async () => {
      const { req, res } = initializeReqResMocks();
      req.body.new_password = "12346";
      req.body.confirm_password = "1234567";
      await resetPassword(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "New Password and Confirm Password doesn't match",
      });
    });

    it("should return 400 when password is less than 6 characters ", async () => {
      const { req, res } = initializeReqResMocks();
      req.body.new_password = "12345";
      req.body.confirm_password = "12345";
      await resetPassword(req, res);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: "Password must have more than 6 characters",
      });
    });

    it("should return 500 when error is thrown", async () => {
      vi.mocked(jwt, true).verify.mockImplementation(() => {
        throw mockedCatchError;
      });
      const { req, res } = initializeReqResMocks();
      req.body.new_password = "newFakePassword";
      req.body.confirm_password = "newFakePassword";
      req.query.xt = "fakeToken";
      await resetPassword(req, res);
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: mockedCatchError.message });
    });

    it.skip("should not find user", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(jwt, true).verify.mockImplementation(
        (_token, _JWT_SECRET, callback) => {
          //@ts-expect-error on callback
          callback(null, { id: () => "fakeId" });
          vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(null);
        }
      );

      req.body.new_password = "newFakePassword";
      req.body.confirm_password = "newFakePassword";
      req.query.xt = "fakeToken";
      await resetPassword(req, res);
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({
        message: "Password change not successful",
        error: "User not found",
      });
    });

    it.skip("Should reset password", async () => {
      const { req, res } = initializeReqResMocks();

      vi.mocked(jwt, true).verify.mockImplementation(
        (_token, _JWT_SECRET, callback) => {
          //@ts-expect-error on callback
          callback(null, { id: () => "fakeId" });
          vi.mocked(User.findByIdAndUpdate, true).mockResolvedValue(fakeUser);
        }
      );
      req.body.new_password = "newFakePassword";
      req.body.confirm_password = "newFakePassword";
      req.query.xt = "fakeToken";
      await resetPassword(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(generateSuccessfulResetPasswordTemplate());
    });
  });
});
