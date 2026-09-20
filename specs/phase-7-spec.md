# Feuille de Route du Projet (Post-Phase 6)

Ce document décrit les spécifications techniques et fonctionnelles pour compléter le projet après la mise en place de la messagerie et de la sécurité (Phase 6).

---

## Phase 7 : Tableau de Bord d'Administration & Modération

### 1. Objectifs
- Fournir une interface sécurisée réservée aux administrateurs (`role: ADMIN`).
- Traiter les signalements (`reports`) créés avec le statut `PENDING` lors de la Phase 6.
- Permettre des actions de modération : rejeter un signalement, masquer/supprimer définitivement un message, avertir ou suspendre un compte utilisateur.
- Journaliser (*audit log*) les actions d'administration.

### 2. Services & Logique Métier
- **`admin-service.ts`** :
  - `getReports(status?: ReportStatus, cursor?: string, limit?: number)` : Récupération paginée des signalements avec détails (auteur, cible, message associé).
  - `resolveReport(reportId: string, action: 'DISMISS' | 'DELETE_CONTENT' | 'SUSPEND_USER', adminId: string, reason?: string)` : Traitement atomique.
  - `getUserManagementList(query?: string, page?: number)` : Recherche et gestion des statuts utilisateurs (Actif, Suspendu, Banni).
  - `updateUserStatus(userId: string, status: UserStatus, reason: string)` : Modification du statut d'accès.

### 3. Contrôle d'Accès & Sécurité
- Middleware / Gardien de route (`app/admin/*`) validant la session et le rôle `ADMIN`.
- Rejet 403 systématique sur l'ensemble des Server Actions / API routes d'administration en cas de droit insuffisant.

### 4. Interface & Composants
- **Composants (`components/admin/`)** :
  - `AdminSidebar.tsx` / `AdminNav.tsx` : Navigation vers Signalements, Utilisateurs, Journaux.
  - `ReportTable.tsx` : Tableau triable des signalements avec badges de statut (`PENDING`, `RESOLVED`, `DISMISSED`).
  - `ReportDetailModal.tsx` : Aperçu du message signalé dans son contexte de conversation.
  - `ModerationActionDialog.tsx` : Confirmation avec champ obligatoire pour le motif.
- **Pages (`app/admin/`)** :
  - `app/admin/page.tsx` : Métriques clés (signalements en attente, inscriptions récentes, activité globale).
  - `app/admin/reports/page.tsx` : File d'attente de modération.
  - `app/admin/users/page.tsx` : Liste et gestion des comptes utilisateurs.

### 5. Critères de Validation (DoD)
- [ ] Les routes `/admin/*` sont inaccessibles aux utilisateurs standard et anonymes.
- [ ] Un signalement `PENDING` passe au statut `RESOLVED` ou `DISMISSED` avec trace en base de données.
- [ ] La suppression de contenu depuis l'admin propage la suppression douce ou dure sans corrompre l'historique de conversation.
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`

---

## Phase 8 : Temps Réel, Présence & Notifications

### 1. Objectifs
- Réception instantanée des messages dans la conversation ouverte sans rafraîchissement manuel.
- Indicateurs de présence en ligne et retour visuel de saisie (*« En train d'écrire... »*).
- Gestion des notifications (cloche in-app + e-mails en cas d'absence prolongée).

### 2. Services & Architecture
- **`notification-service.ts`** :
  - `createNotification(userId: string, type: NotificationType, data: object)`
  - `getUnreadCount(userId: string)`
  - `markAsRead(notificationIds: string[])`
- **Couche Temps Réel** :
  - Abonnements aux événements : `message:sent`, `message:deleted`, `typing:status`, `user:presence`.
  - Gestion des canaux isolés par conversation avec validation stricte des permissions d'écoute.

### 3. Interface & Composants
- `NotificationBell.tsx` : Menu déroulant listant les alertes non lues.
- `TypingIndicator.tsx` : Bulle de frappe animée dans `ChatWindow.tsx`.
- `PresenceBadge.tsx` : Pastille verte/grise sur les avatars dans `ConversationList.tsx`.

### 4. Critères de Validation (DoD)
- [ ] Deux sessions distinctes reçoivent et affichent les messages instantanément.
- [ ] Les messages reçus incrémentent le compteur de notifications si la conversation n'est pas active à l'écran.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build`

---

## Phase 9 : Tests, Robustesse & Préparation au Déploiement

### 1. Objectifs
- Couverture de tests unitaires et d'intégration sur les flux critiques (authentification, sécurité de chat, modération).
- Optimisation des assets (compression des images téléversées, quotas de téléversement).
- Configuration de la journalisation d'erreurs et des scripts de migration DB de production.

### 2. Livrables
- Tests d'intégration (`vitest` ou `jest`) pour `chat-service.ts` et `safety-service.ts`.
- Tests end-to-end (`Playwright`) : Connexion -> Signalement -> Résolution par l'admin.
- Variables d'environnement validées par schéma strict (ex. `zod`).
- Documentation d'exploitation et de déploiement (Docker / Vercel / hébergeur cible).