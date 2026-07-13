import { z } from "zod";

export const RoleEnum = z.enum(["admin", "user"]);
export type RoleType = z.infer<typeof RoleEnum>;

// Schema d'un utilisateur tel qu'il apparait dans un fichier d'import ou
// dans la reponse de generation. Le mot de passe est ici en clair, il sera
// hache au moment de l'import en base de donnees.
export const RawUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string().min(1),
  city: z.string().min(1),
  country: z.string().length(2),
  avatar: z.string().url(),
  company: z.string().min(1),
  jobPosition: z.string().min(1),
  mobile: z.string().min(1),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6).max(10),
  role: RoleEnum,
});
export type RawUser = z.infer<typeof RawUserSchema>;

export const AuthRequestSchema = z.object({
  username: z.string().min(1, "Le champ username (ou email) est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});
export type AuthRequest = z.infer<typeof AuthRequestSchema>;

export interface JwtPayload {
  sub: string; // id utilisateur
  email: string;
  username: string;
  role: RoleType;
}

export interface ImportSummary {
  total: number;
  imported: number;
  failed: number;
  errors: Array<{ index: number; identifier: string; reason: string }>;
}
