import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API de Gestion d'Utilisateurs",
      version: "1.0.0",
      description:
        "Documentation de l'API developpee dans le cadre de l'evaluation technique backend FFK. " +
        "Permet de generer des utilisateurs fictifs, de les importer en base de donnees, " +
        "de s'authentifier via JWT et de consulter les profils utilisateurs selon les autorisations.",
    },
    servers: [{ url: `http://localhost:${env.port}`, description: "Serveur local" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RawUser: {
          type: "object",
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            birthDate: { type: "string", format: "date-time" },
            city: { type: "string" },
            country: { type: "string", description: "Code ISO2 du pays" },
            avatar: { type: "string", format: "uri" },
            company: { type: "string" },
            jobPosition: { type: "string" },
            mobile: { type: "string" },
            username: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", description: "Mot de passe en clair (6 a 10 caracteres)" },
            role: { type: "string", enum: ["admin", "user"] },
          },
        },
        UserProfile: {
          type: "object",
          properties: {
            id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            birthDate: { type: "string", format: "date-time" },
            city: { type: "string" },
            country: { type: "string" },
            avatar: { type: "string", format: "uri" },
            company: { type: "string" },
            jobPosition: { type: "string" },
            mobile: { type: "string" },
            username: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["admin", "user"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ImportSummary: {
          type: "object",
          properties: {
            total: { type: "integer" },
            imported: { type: "integer" },
            failed: { type: "integer" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  index: { type: "integer" },
                  identifier: { type: "string" },
                  reason: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
