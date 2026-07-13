import { faker } from "@faker-js/faker";
import { RawUser } from "../types";

/**
 * Genere un mot de passe aleatoire dont la longueur est comprise
 * entre 6 et 10 caracteres, en melangeant lettres majuscules,
 * minuscules et chiffres.
 */
function generateRandomPassword(): string {
  const length = faker.number.int({ min: 6, max: 10 });
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[faker.number.int({ min: 0, max: chars.length - 1 })];
  }
  return password;
}

/**
 * Genere un seul utilisateur fictif avec des donnees realistes.
 * Les valeurs generiques de type "example"/"test" sont evitees en
 * s'appuyant entierement sur les generateurs de Faker (noms, entreprises,
 * postes, villes, pays reels, etc.).
 */
export function generateFakeUser(): RawUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const usernameBase = faker.internet.userName({ firstName, lastName }).toLowerCase();
  const uniqueSuffix = faker.string.alphanumeric(4).toLowerCase();

  return {
    firstName,
    lastName,
    birthDate: faker.date.birthdate({ min: 18, max: 65, mode: "age" }).toISOString(),
    city: faker.location.city(),
    country: faker.location.countryCode("alpha-2"),
    avatar: faker.image.avatar(),
    company: faker.company.name(),
    jobPosition: faker.person.jobTitle(),
    mobile: faker.phone.number(),
    username: `${usernameBase}.${uniqueSuffix}`,
    email: faker.internet.email({ firstName, lastName, provider: "example.com" }).toLowerCase(),
    password: generateRandomPassword(),
    role: faker.helpers.arrayElement(["admin", "user"]),
  };
}

/**
 * Genere une liste de `count` utilisateurs fictifs uniques
 * (email et username distincts au sein du lot genere).
 */
export function generateFakeUsers(count: number): RawUser[] {
  const users: RawUser[] = [];
  const usedEmails = new Set<string>();
  const usedUsernames = new Set<string>();

  while (users.length < count) {
    const candidate = generateFakeUser();
    if (usedEmails.has(candidate.email) || usedUsernames.has(candidate.username)) {
      continue;
    }
    usedEmails.add(candidate.email);
    usedUsernames.add(candidate.username);
    users.push(candidate);
  }

  return users;
}
