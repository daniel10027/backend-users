import { Router } from "express";
import { login } from "../controllers/auth.controller";

const router = Router();

/**
 * @openapi
 * /api/auth:
 *   post:
 *     summary: Authentifier un utilisateur
 *     description: Authentifie un utilisateur a partir de son username ou de son email, et retourne un token JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username OU email de l'utilisateur
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification reussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Corps de requete invalide
 *       401:
 *         description: Identifiants invalides
 */
router.post("/", login);

export default router;
