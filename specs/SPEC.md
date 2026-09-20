# SPECIFICATION TECHNIQUE & FONCTIONNELLE : D&D COMPANION PLATFORM

## 1. VISION DU PROJET & PHILOSOPHIE ARCHITECTURALE
Plateforme web modulaire et extensible dédiée à la gestion de campagnes de jeu de rôle D&D et à la socialisation privée entre joueurs et maîtres du jeu.

### Principes directeurs d'ingénierie
- Separation stricte des responsabilites (SoC) : Aucune logique metier directement dans les composants d'interface ou les handlers HTTP bruts.
- Architecture modulaire par domaine (Domain-Driven Structure) : Chaque domaine metier encapsule ses schemas, ses actions, ses services et ses composants.
- Scalabilite & Extensibilite : Les choix de types (enumerations, schemas JSON semi-structures pour les imports) doivent permettre l'ajout futur de fonctionnalites (agents IA, nouvelles versions d'outils VTT) sans refonte de schema.
- Typage statique strict : TypeScript en mode strict, zero type any.

---

## 2. STACK TECHNIQUE
- Framework applicatif : Next.js (App Router, Server Actions, Route Handlers) avec React et TypeScript
- Authentification & Profils : Clerk (OAuth Google, Facebook)
- Base de donnees & ORM : PostgreSQL pilote via Prisma ORM
- Validation & Contrats de donnees : Zod
- Style & Design System : Tailwind CSS
- Temps reel : Abstraction modulaire pour WebSockets (Pusher / Socket.io)
- Gestion des uploads/medias : Abstraction stockage cloud (UploadThing ou compatible S3)

---

## 3. STRUCTURE DU CODE & DECOUPAGE DES MODULES

L'application doit respecter strictement l'arborescence modulaire suivante sous src/ :

src/
├── app/                          # Routage Next.js (App Router)
│   ├── (auth)/                   # Routes d'authentification Clerk
│   ├── (dashboard)/              # Espace connecte utilisateur
│   │   ├── campaigns/            # Vues campagnes
│   │   ├── characters/           # Vues fiches et calepins
│   │   └── messages/             # Vues messagerie
│   └── api/                      # Webhooks (Clerk, uploads) et endpoints REST si requis
├── modules/                      # LOGIQUE METIER decouplee par domaine
│   ├── users/                    # Profils, synchronisation Clerk, blocages, signalements
│   ├── characters/               # Fiches, calepins de notes, parseurs d'import Foundry v12+
│   ├── campaigns/                # Campagnes, membres, roles, permissions
│   ├── lore/                     # Lieux, PNJ, Boutiques et items
│   ├── scheduling/               # Calendrier, regles de recurrence, presences
│   ├── sessions/                 # Compte-rendus de partie, liens automatiques, feedback
│   └── chat/                     # Messagerie directe, conversations de groupe, moderation
│       # Structure interne de chaque module :
│       ├── components/           # Composants UI exclusifs au domaine
│       ├── schemas/              # Schemas de validation Zod
│       ├── server/               # Services, Server Actions et requetes Prisma isolees
│       └── types/                # Types TypeScript specifiques
├── components/ui/                # Composants transverses et agnostiques (boutons, modales, etc.)
└── lib/                          # Singletons et utilitaires techniques globaux (prisma.ts, upload.ts)

---

## 4. MODELE DE DONNEES NORMALISE (Prisma Schema)

### A. Domaine Identity & Safety
- User : id (Clerk ID, string), email (unique), name, nickname (unique), avatar_url (optionnel), created_at, updated_at.
- UserBlock : id (cuid), blocker_id (User), blocked_id (User), created_at. Contrainte unique: [blocker_id, blocked_id].
- MessageReport : id (cuid), reporter_id (User), message_id (ChatMessage), reason (Enum: SPAM, HARASSMENT, INAPPROPRIATE, OTHER), status (Enum: PENDING, RESOLVED, DISMISSED), created_at.

### B. Domaine Characters & Foundry Integration
- Character : id (cuid), user_id (User), name, avatar_url (optionnel), race (optionnel), class (optionnel), subclass (optionnel), level (Int, default 1), stats (Json : PV, CA, attributs), foundry_actor_id (String, optionnel), foundry_version (String, optionnel, ex: "12.331"), raw_import_data (Json, optionnel : payload d'export Foundry v12+ preserve intact pour retrocompatibilite), created_at, updated_at.
- CharacterNotebook : id (cuid), character_id (Character, cascade delete), title, subject, content (Markdown), created_at, updated_at.
- NoteAttachment : id (cuid), notebook_id (CharacterNotebook, cascade delete), file_url, caption (optionnel), created_at.

### C. Domaine Realtime Messaging
- Conversation : id (cuid), is_group (Boolean, default false), title (optionnel, pour les groupes), created_at.
- ConversationParticipant : id (cuid), conversation_id (Conversation, cascade delete), user_id (User), is_admin (Boolean, default false), joined_at. Contrainte unique: [conversation_id, user_id].
- ChatMessage : id (cuid), conversation_id (Conversation, cascade delete), sender_id (User), content (Text), is_deleted (Boolean, default false), created_at.
- MessageAttachment : id (cuid), message_id (ChatMessage, cascade delete), file_url, file_type, created_at.

### D. Domaine Campaign & Lore
- Campaign : id (cuid), dm_id (User), title, description, invite_code (unique), created_at.
- CampaignMember : id (cuid), campaign_id (Campaign, cascade delete), user_id (User), role (Enum: DM, CO_DM, PLAYER), dm_private_notes (Text, optionnel : notes secretes du DM non exposees au joueur), joined_at. Contrainte unique: [campaign_id, user_id].
- CampaignCharacter : id (cuid), campaign_id (Campaign, cascade delete), character_id (Character), player_id (User), is_active (Boolean, default true). Contrainte unique: [campaign_id, character_id].
- Location : id (cuid), campaign_id (Campaign, cascade delete), parent_id (Location auto-referencee pour hierarchisation, optionnel), name, description, is_secret_dm (Boolean, default false).
- NPC : id (cuid), campaign_id (Campaign, cascade delete), name, race (optionnel), occupation (optionnel), appearance, secrets_dm (optionnel), is_secret_dm (Boolean, default false).
- Shop : id (cuid), campaign_id (Campaign, cascade delete), location_id (Location, optionnel), keeper_npc_id (NPC, optionnel), name, shop_type.
- ShopItem : id (cuid), shop_id (Shop, cascade delete), name, description, rarity (Enum: MUNDANE, COMMON, UNCOMMON, RARE, VERY_RARE, LEGENDARY, ARTIFACT), is_magic (Boolean, default false), price_cp (Int : prix en pieces de cuivre ; 1 po = 100 pc), stock_quantity (Int, default -1 pour stock illimite).

### E. Domaine Scheduling & Attendance
- ScheduleRule : id (cuid), campaign_id (Campaign, cascade delete), frequency (Enum: WEEKLY, BIWEEKLY, MONTHLY, CUSTOM), day_of_week (Int 0-6), start_time (String ex: "19:00"), duration_minutes (Int).
- ScheduledGame : id (cuid), campaign_id (Campaign, cascade delete), schedule_rule_id (ScheduleRule, optionnel), date_time (DateTime), title, status (Enum: SCHEDULED, CONFIRMED, CANCELLED, COMPLETED).
- GameAttendance : id (cuid), game_id (ScheduledGame, cascade delete), user_id (User), status (Enum: ATTENDING, NOT_ATTENDING, TENTATIVE, NO_REPLY), comment (optionnel). Contrainte unique: [game_id, user_id].

### F. Domaine Session Journal & Feedback
- CampaignNote : id (cuid), campaign_id (Campaign, cascade delete), author_id (User), is_shared (Boolean : false = note personnelle, true = note de table), title, content, created_at, updated_at.
- SessionLog : id (cuid), campaign_id (Campaign, cascade delete), session_number (Int), title, played_at (DateTime), summary (Text), dm_notes (Text, optionnel), created_at.
- SessionAttendee : id (cuid), session_id (SessionLog, cascade delete), user_id (User), character_id (Character, optionnel). Contrainte unique: [session_id, user_id].
- SessionVisitedLocation : id (cuid), session_id (SessionLog, cascade delete), location_id (Location). Contrainte unique: [session_id, location_id].
- SessionMetNPC : id (cuid), session_id (SessionLog, cascade delete), npc_id (NPC). Contrainte unique: [session_id, npc_id].
- SessionFeedback : id (cuid), session_id (SessionLog, cascade delete), user_id (User), rating (Int 1-5, optionnel), comment (Text), is_public (Boolean, default true ; false = prive pour le DM uniquement), created_at.

---

## 5. REGLES D'IMPLEMENTATION STRICTES POUR L'AGENT

1. Validation & Controle d'acces :
   - Aucune mutation de donnees sans validation prealable par schema Zod.
   - Les champs marques is_secret_dm, dm_notes ou dm_private_notes ne doivent JAMAIS etre exposes aux requetes provenant d'utilisateurs dont le role n'est pas DM ou CO_DM dans la campagne concernee.
2. Gestion de l'import Foundry VTT (v12+) :
   - Isoler la logique de conversion dans un service dedie src/modules/characters/server/foundry-importer.ts.
   - L'importateur doit verifier la version (data.system vs data.flags), extraire les valeurs cles (name, system.attributes.hp, system.abilities, classes, items) et serialiser l'objet brut dans raw_import_data.
3. Persistance des prix :
   - Les prix des items sont obligatoirement manipules en monnaie entiere minimale (price_cp). Fournir des utilitaires de conversion (toGoldPieces, formatCurrency).

---

## 6. FEUILLE DE ROUTE D'EXECUTION (PHASE 1 - CIBLE DU PREMIER SPRINT)
L'agent doit executer uniquement la Phase 1 avant toute creation d'interface :
1. Initialiser le client Prisma singleton dans src/lib/prisma.ts.
2. Generer le fichier prisma/schema.prisma complet base fidelement sur la section 4.
3. Creer l'architecture des dossiers sous src/modules/ telle que definie en section 3.
4. Generer les schemas de validation Zod de base pour chaque entite dans leurs modules respectifs.