import { findUserByUsernameOrEmail } from "./user.service";
import { comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { RoleType } from "../types";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Identifiants invalides");
    this.name = "InvalidCredentialsError";
  }
}

/**
 * Authentifie un utilisateur a partir de son username OU de son email,
 * et retourne un token JWT contenant l'email de l'utilisateur.
 */
export async function authenticate(usernameOrEmail: string, password: string): Promise<string> {
  const user = await findUserByUsernameOrEmail(usernameOrEmail);
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await comparePassword(password, user.password);
  if (!passwordMatches) {
    throw new InvalidCredentialsError();
  }

  return signToken({
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role as RoleType,
  });
}
