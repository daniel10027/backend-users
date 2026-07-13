import { Request, Response, NextFunction } from "express";
import { generateFakeUsers } from "../services/faker.service";
import { importUsers, findUserByUsername, toPublicProfile } from "../services/user.service";
import { HttpError } from "../middlewares/errorHandler";

const MAX_GENERATED_USERS = 1000;

export async function generateUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawCount = req.query.count;
    const count = parseInt(typeof rawCount === "string" ? rawCount : "10", 10);

    if (!Number.isFinite(count) || count <= 0) {
      throw new HttpError(400, "Le parametre 'count' doit etre un entier strictement positif");
    }
    if (count > MAX_GENERATED_USERS) {
      throw new HttpError(400, `Le parametre 'count' ne peut pas depasser ${MAX_GENERATED_USERS}`);
    }

    const users = generateFakeUsers(count);
    const fileContent = JSON.stringify(users, null, 2);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="users-${count}.json"`);
    res.status(200).send(fileContent);
  } catch (error) {
    next(error);
  }
}

export async function batchImportUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw new HttpError(400, "Aucun fichier fourni. Le champ multipart attendu est 'file'.");
    }

    let parsedContent: unknown;
    try {
      parsedContent = JSON.parse(req.file.buffer.toString("utf-8"));
    } catch {
      throw new HttpError(400, "Le fichier fourni n'est pas un JSON valide");
    }

    if (!Array.isArray(parsedContent)) {
      throw new HttpError(400, "Le fichier JSON doit contenir un tableau d'utilisateurs");
    }

    const summary = await importUsers(parsedContent);
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
}

export async function getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new HttpError(401, "Authentification requise");
    }
    const user = await findUserByUsername(req.user.username);
    if (!user) {
      throw new HttpError(404, "Utilisateur non trouve");
    }
    res.status(200).json(toPublicProfile(user));
  } catch (error) {
    next(error);
  }
}

export async function getUserByUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username } = req.params;
    if (!req.user) {
      throw new HttpError(401, "Authentification requise");
    }

    const isSelf = req.user.username.toLowerCase() === username.toLowerCase();
    const isAdmin = req.user.role === "admin";

    if (!isSelf && !isAdmin) {
      throw new HttpError(403, "Vous n'etes pas autorise a consulter ce profil");
    }

    const user = await findUserByUsername(username);
    if (!user) {
      throw new HttpError(404, "Utilisateur non trouve");
    }

    res.status(200).json(toPublicProfile(user));
  } catch (error) {
    next(error);
  }
}
