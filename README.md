# 🎲 Rope Trick

[![Next.js App Router](https://img.shields.io/badge/Next.js-App_Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Clerk Auth](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)

**Rope Trick** est une plateforme web full-stack immersive conçue pour les Maîtres de Jeu (MJ) et les joueurs de *Dungeons & Dragons 5e*. Elle centralise la gestion des campagnes, l'import de fiches Foundry VTT v12+, un calendrier interactif des parties synchronisé et des grimoires de session collaboratifs.

---

## 💡 Pourquoi ce projet?

La gestion d'une campagne de JDR à long terme implique un volume important d'informations fragmentées : notes secrètes du MJ, chroniques de table, feuilles de personnages et coordination des dates. 

* **Pour qui ?** Conçu pour les tables exigeantes qui cherchent un espace fluide, sans friction, élégant et adapté au folklore fantastique.
* **Ce que ça résout** : Fini les plannings éparpillés sur Discord et les carnets de notes perdus. Rope Trick unifie l'agenda, les rôles de table et l'histoire en cours d'écriture dans une interface thématique hautement réactive.

---

## ✨ Caractéristiques Principales

- **📅 Calendrier d'Aventures Synchronisé** : 
  - Grille mensuelle interactive regroupant les sessions de toutes vos campagnes avec des codes couleur distincts.
  - Gestion native des statuts (sessions planifiées vs signalées en ❌ *Annulées* avec un retour visuel sobre et élégant).
- **📜 Grimoires & Registres de Session (Tomorama)** :
  - Vues de lecture et d'écriture de notes par session.
  - Système de parchemins partagés (chroniques publiques pour la table) ou secrets (notes privées de joueurs).
  - Thèmes de reliure dynamiques et immersifs (*Parchemin Ancien, Grimoire Démoniaque, Pacte des Ombres, Tome Sylvestre, Archives Royales*).
- **🛡️ Import & Fiches Foundry VTT** : Intégration et affichage structuré des personnages pour un suivi rapide en cours de partie.
- **🔐 Contrôle d'Accès par Rôles** : Gestion fine des permissions (`DM`, `PLAYER`) assurant l'étanchéité des secrets du maître de jeu et des notes personnelles.

---

## 🏛️ Architecture & Structure du Projet

L'architecture repose sur les standards modernes de Next.js (App Router) et une structuration modulaire orientée domaine :
```
src/
├── app/                  # Pages et routes de l'App Router (Dashboard, Campagnes, Sessions)
├── modules/              # Modules métiers isolés (Campaigns, Characters, Scheduling, Sessions)
│   ├── campaigns/        # Services serveur et composants UI des campagnes
│   ├── scheduling/       # Algorithmes de récurrence, règles et gestion du calendrier
│   └── sessions/         # Logique des notes, grimoires et présences
├── lib/                  # Configuration centralisée (Prisma client, utilitaires)
└── styles/               # Thétimisation dynamique et variables graphiques D&D
```

---

## 🤖 Workflow d'Ingénierie Assistée par IA (AI-Assisted Engineering)

Ce projet a été développé en mode **AI-assisted engineering**, où des agents LLM m'ont servi d'accélérateurs de productivité pour :
- Explorer rapidement la base de code et prototyper des schémas,
- Proposer des implémentations ciblées et accélérer les refactors,
- Détecter des incohérences de données et itérer rapidement sur l'UX.

Mon rôle en tant que développeur / architecte a consisté à :
- Cadrer les objectifs fonctionnels et valider les choix de conception (séparation Server/Client components, intégrité des relations Prisma),
- Imposer les contraintes d'architecture et de sécurité (contrôle d'accès rigoureux),
- Valider systématiquement chaque changement par des vérifications de types (`tsc`), des tests et des revues de flux critiques.

Cette approche démontre la capacité à piloter des agents comme de véritables outils d'ingénierie, en conservant le contrôle total sur la qualité, la cohérence produit et la maintenabilité du code.

---

## 🛠️ Stack Technique

- **Framework** : Next.js 14+ (App Router, Server Actions)
- **Langage** : TypeScript
- **Base de Données & ORM** : PostgreSQL / Prisma ORM (relations complexes et transactions)
- **Style & UI** : Tailwind CSS, composants modulaires, thèmes dynamiques
- **Authentification & Sécurité** : Clerk (gestion des sessions et des utilisateurs)

---

## 🚀 Installation & Démarrage

1. Cloner le dépôt :
   git clone <url-du-depot>
   cd rope-trick

2. Installer les dépendances :
   npm install

3. Configurer les variables d'environnement :
   Crée un fichier `.env` à la racine basé sur `.env.example` (incluant les identifiants de connexion PostgreSQL / Prisma et les clés Clerk).

4. Lancer les migrations de la base de données :
   npx prisma migrate dev

5. Démarrer le serveur de développement :
   npm run dev

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📜 Licence
Projet réalisé dans le cadre d'une exploration de l'ingénierie logicielle assistée par IA et de la conception d'expériences web immersives.