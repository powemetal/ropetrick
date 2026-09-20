# Spécification d'Implémentation : Résilience Clerk & Webhook de Production

## 1. Contexte & Objectif
Actuellement, les Server Actions (comme `createCampaignAction`) échouent avec une violation de clé étrangère (`foreign key constraint: campaigns_dm_id_fkey`) dès qu'un utilisateur authentifié via Clerk n'existe pas encore dans la table PostgreSQL `User`. 

L'objectif est d'assurer un flux de production robuste en deux volets :
1. **Webhook Clerk officiel** sécurisé via Svix pour synchroniser les créations, modifications et suppressions d'utilisateurs.
2. **Mécanisme de secours (Lazy Sync / JIT)** pour que les utilisateurs existants ou les sessions créées avant le webhook ne bloquent jamais les actions de base de données.

---

## 2. Spécifications Techniques

### A. Mécanisme de Résilience (JIT Sync Helper)
- **Fichier** : `src/modules/users/server/user-sync.ts`
- **Méthode** : `getOrCreateCurrentUser(): Promise<User>`
- **Comportement** :
  - Récupère l'utilisateur Clerk via `currentUser()` de `@clerk/nextjs/server`.
  - Si non authentifié, lève une erreur `UnauthorizedError`.
  - Exécute un `prisma.user.upsert` basé sur le `clerkId` (ou `id`).
  - Champs synchronisés : `id` (Clerk ID), `email`, `name`, `nickname`, `avatarUrl`.
  - Renvoie l'enregistrement Prisma garanti existant.

### B. Sécurisation de la Route Webhook
- **Fichier** : `src/app/api/webhooks/clerk/route.ts`
- **Dépendance** : `svix`
- **Variable** : `CLERK_WEBHOOK_SECRET`
- **Événements supportés** :
  - `user.created` : `prisma.user.upsert`
  - `user.updated` : `prisma.user.update`
  - `user.deleted` : `prisma.user.delete` (ou marquage inactif selon RGPD/schéma)
- **Validation** : Renvoyer des codes HTTP explicites (`200 OK`, `400 Bad Request` si signature invalide).

### C. Mise à jour des Server Actions
- Remplacer les extractions directes de l'ID Clerk non vérifiées par l'appel à `getOrCreateCurrentUser()` dans :
  - `src/app/(dashboard)/campaigns/page.tsx`
  - Les actions de création de personnage (`characters`)
  - L'envoi de messages (`chat`)

---

## 3. Checklist de Validation
- [ ] `npm run typecheck` passe sans erreur.
- [ ] `npm run lint` passe sans erreur.
- [ ] `npm run build` compile sans régression.
- [ ] La création d'une campagne par un utilisateur Clerk nouvellement connecté réussit sans erreur de clé étrangère.