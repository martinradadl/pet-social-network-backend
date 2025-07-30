import { NextFunction, Request, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { JWT_SECRET } from "../helpers/global";

export const tokenVerification = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    jwt.verify(token.toString(), JWT_SECRET, (err: VerifyErrors | null) => {
      if (err) {
        res.status(401).json({ message: "Not authorized" });
        return;
      }
    });
  } else {
    res.status(401).json({ message: "Not authorized, token not available" });
    return;
  }
  next();
};
