import prisma from "../db/prisma";
import { hashPassword } from "../utils/password";
import { ImportSummary, RawUser, RawUserSchema } from "../types";
import { Prisma } from "@prisma/client";

/**
 * Importe une liste d'utilisateurs bruts (issus d'un fichier JSON) en base
 * de donnees. Chaque enregistrement est valide individuellement afin qu'une
 * erreur sur une ligne n'interrompe pas le traitement des autres.
 *
 * Regles de gestion des doublons :
 *  - un email ou un username deja present en base est rejete
 *  - un email ou un username duplique au sein du fichier importe n'est
 *    accepte qu'une seule fois (la premiere occurrence)
 */
export async function importUsers(rawRecords: unknown[]): Promise<ImportSummary> {
  const summary: ImportSummary = {
    total: rawRecords.length,
    imported: 0,
    failed: 0,
    errors: [],
  };

  const seenEmails = new Set<string>();
  const seenUsernames = new Set<string>();

  for (let index = 0; index < rawRecords.length; index++) {
    const record = rawRecords[index];
    const identifier =
      typeof record === "object" && record !== null && "email" in record
        ? String((record as Record<string, unknown>).email)
        : `enregistrement #${index}`;

    const parsed = RawUserSchema.safeParse(record);
    if (!parsed.success) {
      summary.failed += 1;
      summary.errors.push({
        index,
        identifier,
        reason: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "),
      });
      continue;
    }

    const user: RawUser = parsed.data;
    const emailKey = user.email.toLowerCase();
    const usernameKey = user.username.toLowerCase();

    if (seenEmails.has(emailKey) || seenUsernames.has(usernameKey)) {
      summary.failed += 1;
      summary.errors.push({ index, identifier, reason: "Doublon au sein du fichier importe (email ou username)" });
      continue;
    }

    try {
      const existing = await prisma.user.findFirst({
        where: { OR: [{ email: emailKey }, { username: usernameKey }] },
      });
      if (existing) {
        summary.failed += 1;
        summary.errors.push({ index, identifier, reason: "Email ou username deja existant en base de donnees" });
        continue;
      }

      const hashedPassword = await hashPassword(user.password);

      await prisma.user.create({
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          birthDate: new Date(user.birthDate),
          city: user.city,
          country: user.country.toUpperCase(),
          avatar: user.avatar,
          company: user.company,
          jobPosition: user.jobPosition,
          mobile: user.mobile,
          username: usernameKey,
          email: emailKey,
          password: hashedPassword,
          role: user.role,
        },
      });

      seenEmails.add(emailKey);
      seenUsernames.add(usernameKey);
      summary.imported += 1;
    } catch (error) {
      summary.failed += 1;
      const reason =
        error instanceof Prisma.PrismaClientKnownRequestError
          ? "Contrainte d'unicite violee (email ou username)"
          : "Erreur inattendue lors de l'insertion en base de donnees";
      summary.errors.push({ index, identifier, reason });
    }
  }

  return summary;
}

export async function findUserByUsernameOrEmail(usernameOrEmail: string) {
  const value = usernameOrEmail.toLowerCase();
  return prisma.user.findFirst({
    where: { OR: [{ username: value }, { email: value }] },
  });
}

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username: username.toLowerCase() } });
}

export function toPublicProfile(user: {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  city: string;
  country: string;
  avatar: string;
  company: string;
  jobPosition: string;
  mobile: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
}) {
  // Le mot de passe (meme hache) n'est jamais renvoye au client.
  const { id, firstName, lastName, birthDate, city, country, avatar, company, jobPosition, mobile, username, email, role, createdAt } = user;
  return { id, firstName, lastName, birthDate, city, country, avatar, company, jobPosition, mobile, username, email, role, createdAt };
}
