import prisma from "../src/db/prisma";
import { hashPassword } from "../src/utils/password";
import { signToken } from "../src/utils/jwt";
import { RoleType } from "../src/types";

export async function createTestUser(overrides: Partial<{
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: RoleType;
}> = {}) {
  const password = overrides.password ?? "Passw0rd";
  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      firstName: overrides.firstName ?? "Aicha",
      lastName: overrides.lastName ?? "Kone",
      birthDate: new Date("1995-05-20"),
      city: "Abidjan",
      country: "CI",
      avatar: "https://example.com/avatar.png",
      company: "FFK",
      jobPosition: "Developpeuse",
      mobile: "+2250700000000",
      username: (overrides.username ?? "aicha.kone").toLowerCase(),
      email: (overrides.email ?? "aicha.kone@example.com").toLowerCase(),
      password: hashed,
      role: overrides.role ?? "user",
    },
  });

  const token = signToken({
    sub: user.id,
    email: user.email,
    username: user.username,
    role: user.role as RoleType,
  });

  return { user, plainPassword: password, token };
}
