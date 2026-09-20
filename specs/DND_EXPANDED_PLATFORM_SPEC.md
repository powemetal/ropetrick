# Spécification Complète : Atelier de Monstres, Compendium Sourcebook-Modular, Wizard Bloquant & Campagnes Vivantes

---

## 1. Architecture Modulaire par Livre de Règles (Sourcebooks)
Pour activer, filtrer ou désactiver facilement le contenu d'un livre (ex. PHB 2024, Tasha, Xanathar, Monsters of the Multiverse, UA) :
- **Table `SourceBook`** :
  - `id`, `code` (ex: `PHB_2024`, `TCE`, `XGE`, `MPMM`, `UA_2024`), `title`, `isOfficial` (bool), `enabledByDefault` (bool).
- **Liaison `sourceBookId` / `page`** obligatoire sur toutes les tables de règles :
  - `Species`, `Subspecies`, `Background`, `DndClass`, `DndSubclass`, `Spell`, `Feat`, `EquipmentItem`, `Monster`.
- **Filtre de campagne (`CampaignSourceBook`)** :
  - Le MJ peut cocher/décocher les livres autorisés pour sa campagne. Le Wizard et le Compendium n'affichent que le contenu des livres activés.

---

## 2. Atelier de Création de Monstres & Boss de Donjon (`/monsters`)
Un créateur complet respectant les tables mathématiques du *Dungeon Master's Guide* / règles 2024 :

### A. Modes de Création
1. **From Scratch / Guidé par CR (Challenge Rating 0 à 30)** :
   - Sélection du CR : suggestion automatique des stats cibles (Bonus de Maîtrise, CA suggérée, Fourchette de PV, DD de sauvegarde, Dégâts moyens par round, Bonus d'attaque).
2. **Clonage & Échelonnage (Scaling Supérieur / Inférieur)** :
   - Possibilité de dupliquer un monstre existant et d'ajuster son CR : recalcul proportionnel automatique des PV, CA, bonus d'attaque et dés de dégâts.
3. **Générateur de Boss & Monstre Légendaire** :
   - Activation d'une bascule "Boss Légendaire" :
     - **Actions Légendaires (3/round)** : templates pré-remplis (Attaque rapide, Déplacement sans provocation d'opportunité, Pouvoir de contrôle).
     - **Résistances Légendaires (3/jour)** : modèle d'annulation d'échec de sauvegarde.
     - **Actions de Repaire (Lair Actions)** : déclenchement à l'initiative 20 (changement d'environnement, dégâts de zone, entraves).

### B. Modèle de Données `Monster`
- Nom, taille, type (Aberration, Dragon, Mort-vivant, etc.), alignement, CR, CA, PV (formule en dés), vitesses.
- Caractéristiques (FOR, DEX, CON, INT, SAG, CHA), sauvegardes et compétences.
- Vulnérabilités, résistances, immunités (dégâts et états).
- Sens (vision dans le noir, perception passive) et langues.
- Traits passifs, Actions martiales/magiques, Actions bonus, Réactions, Actions légendaires et Actions de repaire (stockés sous forme structurée JSON typée Zod).

---

## 3. Rigueur Stricte du Wizard de Personnage ("Stupid-Proof")
- **Descriptions immersives instantanées** :
  - Au clic sur une Espèce, un Historique, une Classe ou une Sous-classe, affichage d'un volet latéral / carte descriptive complète (traits, lore, vitesse, vision).
- **Sélection des Compétences verrouillée mathématiquement** :
  - Blocage strict du nombre de cases cochables (ex: Historique = 2 imposées ; Classe = exactement le nombre accordé, ex. Roublard = 4 parmi sa liste). Désactivation automatique des autres cases dès que le quota est atteint.
- **Sélection des Sorts (Création & Level Up)** :
  - Si la classe est lanceuse de sorts : écran obligatoire filtrant les sorts selon la classe et le niveau d'emplacement débloqué.
  - Calcul et affichage des quotas stricts : Nombre de tours de magie (Cantrips) connus + Nombre de sorts préparés/connus selon le niveau et la caractéristique d'incantation.
- **Attribution automatique des Dons & Traits** :
  - Injection automatique du don d'origine lié à l'historique 2024 et des traits d'espèce dans la feuille finale.

---

## 4. Gestion des Médias (Stockage S3 / Neon)
- **Upload d'Avatar de Personnage** :
  - Intégration via client S3 compatible (AWS S3 ou Neon Object Storage).
  - Lors de l'envoi d'un nouvel avatar : upload du nouveau fichier, mise à jour de l'URL du personnage, et **suppression automatique immédiate de l'ancien fichier S3** pour éviter l'accumulation d'orphelins.
- **Gestion du Personnage** :
  - Suppression complète d'un personnage avec modale de confirmation irréversible (nettoyage des liaisons campagnes, inventaire, notes et suppression de son avatar S3).
  - Affichage sur la fiche et la liste des campagnes auxquelles le personnage participe (`CampaignMember` / `CampaignCharacter`).

---

## 5. Thèmes Visuels Globaux & Typographie
- Correction du `ThemeProvider` :
  - Application de la classe CSS du thème racine directement sur la balise `<html className={theme}>` ou `<body>` afin que toute l'application (Navbar, arrière-plans, bordures, cartes, modales) change d'ambiance.
  - Sauvegarde en `localStorage` et restauration immédiate sans clignotement.

---

## 6. Campagnes Interactives & Vivantes
- **Prise de Notes MJ & Joueurs** :
  - Section calepin de campagne : notes publiques partagées entre tous les membres et calepin secret réservé au MJ.
- **Calendrier & Séances branchés** :
  - Interface calendrier interactive : création d'une date de jeu, émargement en direct des joueurs (Présent / Absent / En retard), et conversion d'une date en journal de session (`SessionLog`) avec résumé et feedbacks.