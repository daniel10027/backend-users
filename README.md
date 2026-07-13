# API de Gestion d'Utilisateurs

Projet realise dans le cadre de l'evaluation technique backend FFK. L'API permet de :

1. Generer des utilisateurs fictifs et telecharger le resultat en JSON
2. Importer un fichier JSON d'utilisateurs en base de donnees
3. Authentifier un utilisateur (username ou email) et delivrer un token JWT
4. Consulter son propre profil
5. Consulter le profil d'un autre utilisateur (reserve aux administrateurs, sauf pour son propre profil)

## Sommaire

- [Stack technique](#stack-technique)
- [Choix techniques](#choix-techniques)
- [Structure du projet](#structure-du-projet)
- [Demarrage avec Docker](#demarrage-avec-docker-recommande)
- [Demarrage en local sans Docker](#demarrage-en-local-sans-docker)
- [Variables d'environnement](#variables-denvironnement)
- [Documentation de l'API](#documentation-de-lapi)
- [Description des endpoints](#description-des-endpoints)
- [Tests](#tests)
- [Securite](#securite)

## Stack technique

| Composant                      | Choix                              |
| ------------------------------ | ---------------------------------- |
| Langage                        | TypeScript                         |
| Framework HTTP                 | Express                            |
| Base de donnees                | SQLite, via l'ORM Prisma           |
| Authentification               | JWT (jsonwebtoken)                 |
| Hachage                        | bcryptjs                           |
| Generation de donnees fictives | @faker-js/faker                    |
| Upload de fichier              | multer (stockage en memoire)       |
| Validation                     | zod                                |
| Documentation API              | swagger-jsdoc + swagger-ui-express |
| Tests                          | Jest + Supertest                   |
| Conteneurisation               | Docker / docker-compose            |

## Choix techniques

**Express** a ete prefere a Fastify pour sa maturite et l'abondance de middlewares stables (multer, helmet, morgan), suffisants pour le perimetre de ce test.

**SQLite via Prisma** a ete choisi comme base de donnees. Ce choix evite toute dependance a un serveur de base de donnees externe : le fichier de base est cree automatiquement au demarrage du conteneur (via `prisma migrate deploy`), ce qui simplifie grandement l'installation et l'evaluation du projet. Prisma apporte en complement un typage genere automatiquement a partir du schema, ce qui reduit les risques d'erreur. Le schema (`prisma/schema.prisma`) reste portable vers PostgreSQL ou MySQL en changeant simplement le `provider` et la variable `DATABASE_URL`.

**Zod** est utilise pour valider a la fois le corps des requetes entrantes (authentification) et chaque enregistrement d'un fichier importe, afin qu'une ligne invalide dans un fichier d'import n'interrompe pas le traitement des autres lignes.

**bcryptjs** est utilise plutot que `bcrypt` afin de ne pas dependre d'un module natif compile, ce qui simplifie la portabilite entre systemes et la construction de l'image Docker.

**multer avec stockage en memoire** est utilise pour le fichier importe : celui-ci est traite immediatement (parsing JSON puis insertion en base) et n'a pas besoin d'etre persiste sur le disque du conteneur.

**Gestion des doublons a l'import** : un enregistrement est rejete si son email ou son username existe deja en base, ou s'il est deja present plus haut dans le meme fichier importe. Le traitement se poursuit sur les enregistrements suivants (traitement ligne par ligne, pas de transaction globale bloquante), afin de fournir un resume precis (total / importes / echecs) meme en cas de fichier partiellement invalide.

## Structure du projet

```
.
├── src/
│   ├── app.ts                  # Assemblage de l'application Express
│   ├── server.ts               # Point d'entree, demarrage du serveur
│   ├── config/
│   │   ├── env.ts              # Chargement et validation des variables d'environnement
│   │   └── swagger.ts          # Configuration OpenAPI/Swagger
│   ├── db/
│   │   └── prisma.ts           # Instance unique du client Prisma
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # Verification du JWT, controle des roles
│   │   ├── errorHandler.ts     # Gestion centralisee des erreurs
│   │   └── upload.middleware.ts# Configuration de multer
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── users.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── users.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── faker.service.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── password.ts
│   └── types/
│       └── index.ts            # Schemas Zod et types partages
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/                      # Tests Jest + Supertest
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint.sh
├── .env.example
├── package.json
└── tsconfig.json
```

## Demarrage avec Docker (recommande)

Pre-requis : Docker et Docker Compose installes.

```bash
# 1. Copier le fichier d'environnement et adapter le secret JWT si besoin
cp .env.example .env

# 2. Construire l'image et demarrer le conteneur
docker compose up --build
```

L'API est alors disponible sur `http://localhost:9090`.
La documentation Swagger est disponible sur `http://localhost:9090/api-docs`.

Au demarrage du conteneur, le script `docker-entrypoint.sh` applique automatiquement les migrations Prisma (`prisma migrate deploy`) avant de lancer le serveur. La base SQLite est persistee dans un volume Docker nomme (`db-data`), ce qui evite de perdre les donnees lors des redemarrages du conteneur.

Pour arreter le conteneur :

```bash
docker compose down
```

Pour reinitialiser completement la base de donnees (supprime le volume) :

```bash
docker compose down -v
```

## Demarrage en local sans Docker

Pre-requis : Node.js 20 ou superieur.

```bash
# 1. Installer les dependances
npm install

# 2. Copier le fichier d'environnement
cp .env.example .env

# 3. Appliquer les migrations et generer le client Prisma
npx prisma migrate deploy

# 4. Lancer le serveur en mode developpement (rechargement automatique)
npm run dev

# ou construire puis demarrer en mode production
npm run build
npm start
```

Le serveur demarre par defaut sur le port `9090` (configurable via la variable `PORT`).

## Variables d'environnement

Voir `.env.example` pour la liste complete. Les principales sont :

| Variable                | Description                                 | Valeur par defaut       |
| ----------------------- | ------------------------------------------- | ----------------------- |
| `PORT`                  | Port d'ecoute du serveur                    | `9090`                  |
| `DATABASE_URL`          | URL de connexion Prisma (fichier SQLite)    | `file:./data/prod.db`   |
| `JWT_SECRET`            | Secret utilise pour signer les tokens JWT   | a definir en production |
| `JWT_EXPIRES_IN`        | Duree de validite des tokens JWT            | `1d`                    |
| `MAX_UPLOAD_SIZE_BYTES` | Taille maximale du fichier importe (octets) | `5242880` (5 Mo)        |

## Documentation de l'API

La documentation interactive (Swagger UI) est generee automatiquement a partir des annotations OpenAPI presentes dans les fichiers de routes, et disponible a l'adresse :

```
http://localhost:9090/api-docs
```

La specification brute au format JSON est egalement exposee sur :

```
http://localhost:9090/api-docs.json
```

Un point de controle de sante (health check) est disponible sur `GET /health`.

## Description des endpoints

### `GET /api/users/generate?count=N`

Genere `N` utilisateurs fictifs realistes (via Faker) et declenche le telechargement d'un fichier JSON (`Content-Disposition: attachment`). Aucune authentification requise. `count` doit etre un entier compris entre 1 et 1000.

### `POST /api/users/batch`

Requete `multipart/form-data` avec un champ `file` contenant un fichier JSON (tableau d'utilisateurs, meme format que celui genere par `/api/users/generate`). Chaque utilisateur est valide individuellement ; les doublons (email ou username deja existants en base, ou dupliques au sein du fichier) sont rejetes sans bloquer le reste du traitement. Les mots de passe sont haches (bcrypt) avant stockage. Reponse : resume `{ total, imported, failed, errors }`.

### `POST /api/auth`

Corps JSON `{ "username": "...", "password": "..." }`. Le champ `username` accepte indifferemment le username ou l'email de l'utilisateur. Retourne `{ "accessToken": "<jwt>" }` en cas de succes. Le token contient l'email, le username, l'identifiant et le role de l'utilisateur.

### `GET /api/users/me`

Necessite un en-tete `Authorization: Bearer <token>`. Retourne le profil complet (sans mot de passe) de l'utilisateur associe au token.

### `GET /api/users/{username}`

Necessite un en-tete `Authorization: Bearer <token>`. Un administrateur (`role: admin`) peut consulter n'importe quel profil. Un utilisateur standard (`role: user`) ne peut consulter que son propre profil ; toute autre tentative retourne une erreur `403`.

## Tests

Les tests utilisent Jest et Supertest, et s'executent contre une base SQLite isolee (`test.db`), reinitialisee avant chaque test.

```bash
npm test
```

La suite couvre notamment :

- la generation d'utilisateurs fictifs (nombre genere, format des champs, validation du parametre `count`)
- l'import par lot (succes, doublons, fichier manquant ou invalide)
- l'authentification (par username, par email, mot de passe incorrect, utilisateur inconnu, validation du corps de requete)
- la consultation de profil (`/me`, acces admin a tout profil, acces restreint pour un utilisateur standard, profil inexistant)

## Securite

- Mots de passe haches avec bcrypt (jamais stockes ni renvoyes en clair)
- Authentification par JWT signe avec un secret configurable, duree de validite limitee
- Controle d'acces base sur les roles (`admin` / `user`) pour la consultation des profils
- En-tetes HTTP securises via `helmet`
- Validation stricte des entrees (corps de requete, fichiers importes) via `zod`
- Limitation de la taille des fichiers importes (`MAX_UPLOAD_SIZE_BYTES`)
- Le mot de passe (meme hache) n'est jamais present dans les reponses de l'API
#   b a c k e n d - u s e r s  
 