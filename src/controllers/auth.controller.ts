import { Request, Response, NextFunction } from "express";
import { AuthRequestSchema } from "../types";
import { authenticate, InvalidCredentialsError } from "../services/auth.service";
import { HttpError } from "../middlewares/errorHandler";

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = AuthRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues.map((issue) => issue.message).join("; "));
    }

    const { username, password } = parsed.data;

    try {
      const accessToken = await authenticate(username, password);
      res.status(200).json({ accessToken });
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new HttpError(401, "Identifiants invalides");
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
}
