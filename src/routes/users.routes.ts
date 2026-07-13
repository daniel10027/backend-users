import { Router } from "express";
import { generateUsers, batchImportUsers, getMyProfile, getUserByUsername } from "../controllers/users.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { uploadJsonFile } from "../middlewares/upload.middleware";

const router = Router();

/**
 * @openapi
 * /api/users/generate:
 *   get:
 *     summary: Generer des utilisateurs fictifs
 *     description: Genere un nombre donne d'utilisateurs fictifs et declenche le telechargement d'un fichier JSON.
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: count
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Nombre d'utilisateurs a generer
 *     responses:
 *       200:
 *         description: Fichier JSON contenant les utilisateurs generes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RawUser'
 *       400:
 *         description: Parametre 'count' invalide
 */
router.get("/generate", generateUsers);

/**
 * @openapi
 * /api/users/batch:
 *   post:
 *     summary: Importer des utilisateurs en base de donnees
 *     description: Importe un fichier JSON d'utilisateurs. Les doublons sur email/username sont ignores et les mots de passe sont haches avant stockage.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Resume de l'import
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImportSummary'
 *       400:
 *         description: Fichier manquant ou invalide
 */
router.post("/batch", uploadJsonFile.single("file"), batchImportUsers);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Consulter mon profil
 *     description: Retourne le profil de l'utilisateur authentifie.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Non authentifie
 */
router.get("/me", requireAuth, getMyProfile);

/**
 * @openapi
 * /api/users/{username}:
 *   get:
 *     summary: Consulter le profil d'un utilisateur
 *     description: Un administrateur peut consulter n'importe quel profil. Un utilisateur standard ne peut consulter que son propre profil.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Non authentifie
 *       403:
 *         description: Acces refuse
 *       404:
 *         description: Utilisateur non trouve
 */
router.get("/:username", requireAuth, getUserByUsername);

export default router;
