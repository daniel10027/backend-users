import { PrismaClient } from "@prisma/client";

// Instance unique du client Prisma partagee dans toute l'application,
// afin d'eviter l'ouverture de multiples connexions a la base de donnees.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export default prisma;
