import dotenv from "dotenv";
import path from "path";

// En environnement de test, on charge .env.test (base de donnees isolee).
// Sinon, on charge le fichier .env standard.
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "9090", 10),
  jwtSecret: required("JWT_SECRET", "change-me-in-production-please"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  databaseUrl: required("DATABASE_URL", "file:./dev.db"),
  maxUploadSizeBytes: parseInt(process.env.MAX_UPLOAD_SIZE_BYTES ?? String(5 * 1024 * 1024), 10),
};
