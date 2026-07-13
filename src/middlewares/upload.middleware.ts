import multer from "multer";
import { env } from "../config/env";

// Stockage en memoire : le fichier importe est traite immediatement puis
// jete, il n'a pas besoin d'etre persiste sur le disque du conteneur.
const storage = multer.memoryStorage();

function fileFilter(_req: unknown, file: Express.Multer.File, callback: multer.FileFilterCallback) {
  const isJson = file.mimetype === "application/json" || file.originalname.toLowerCase().endsWith(".json");
  if (!isJson) {
    callback(new Error("Seuls les fichiers JSON sont acceptes"));
    return;
  }
  callback(null, true);
}

export const uploadJsonFile = multer({
  storage,
  limits: { fileSize: env.maxUploadSizeBytes },
  fileFilter,
});
