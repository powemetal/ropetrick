# Roadmap : Consolidation du personnage D&D 5e

# Roadmap : Consolidation du personnage D&D 5e

## Phase 1 : Schéma Prisma & Données de référence (Compendium)
- [x] Modèles de base :
  - [x] `Race` & `Subrace` (bonus de caractéristiques, vitesse de base, vision dans le noir, traits raciaux)
  - [x] `Background` (compétences accordées, langues, don d'origine)
  - [x] `Alignment` (enum ou table : Loyal Bon, Chaotique Neutre, etc.)
  - [x] `Language` (table normalisée + table de liaison `CharacterLanguage`)
- [x] Extension du modèle `Item` (préparation au simulateur de combat) :
  - [x] Types d'armes (Courante, Guerre, Corps à corps, Distance)
  - [x] Formule de dégâts (`damageDice`, ex: 1d8, 2d6) et type de dégâts (Tranchant, Perforant, Contondant, etc.)
  - [x] Propriétés d'armes (finesse, heavy, versatile, two-handed, reach, thrown, etc.)
  - [x] Types d'armures (light, medium, heavy, shield) et prérequis de Force
  - [x] Attribut d'harmonisation requise (`requiresAttunement`)
- [x] Données & Seeds :
  - [x] Script de seed ou import pour les races, historiques et équipements du SRD 5e

# Checklist - Implémentation des Personnages & Moteur d'Import

## 1. Identité, Métadonnées et Informations Générales
- [x] Nom du personnage (`name`)
- [x] Avatar (`avatarUrl`)
- [x] Alignement (`alignment` via enum `Alignment`)
- [x] Niveau (`level`) et Expérience (`experiencePoints`)
- [x] Champs textuels de repli (`race`, `class`, `subclass`)
- [x] Intégration Foundry VTT (`foundryActorId`, `foundryVersion`, `rawImportData`)
- [x] Thèmes visuels (`themeKey`, `notebookTheme`)

## 2. Relations avec le Compendium (D&D Core)
- [x] Espèce / Race (`speciesId`)
- [x] Sous-espèce (`subspeciesId`)
- [x] Historique (`backgroundId`)
- [x] Classe principale (`dndClassId`)
- [x] Sous-classe (`subclassId`)

## 3. Caractéristiques et Modificateurs (Ability Scores)
- [x] Scores bruts (Force, Dextérité, Constitution, Intelligence, Sagesse, Charisme)
- [x] Calcul automatique ou manuel des modificateurs associés
- [x] Objet JSON pour les stats personnalisées (`stats`)

## 4. Maîtrises, Jets et Capacités Magiques
- [ ] État des jets de sauvegarde (`savingThrows` en JSON)
- [x] Niveaux de maîtrise des compétences (*None*, *Proficient*, *Expertise*) via `skillProficiencies`
- [x] Gestion de la grille des emplacements de sorts (`spellSlots`)
- [x] Statistiques de sort (`spellSaveDc`, `spellAttackBonus`)
- [ ] État de l'inspiration (`inspiration`)

## 5. Combat, Santé et Survie
- [x] Points de vie (Max, Actuels, Temporaires)
- [x] Dés de vie (Type de dé, Total, Actuels)
- [ ] Sauvegardes contre la mort (`deathSaves`) et niveau d'épuisement (`exhaustionLevel`)
- [x] Défenses et déplacements (`armorClass`, `initiative`, `speed`)

## 6. Équipement, Armure et Devises
- [x] Données détaillées d'armure (`armorCategory`, `armorBaseClass`, `armorDexCap`, `shieldBonus`)
- [x] Dons sélectionnés (`selectedFeats` en JSON)
- [x] Portefeuille (Pièces de Cuivre, Argent, Électrum, Or, Platine)

## 7. Rôle-play et Éléments Narratifs (Fluff)
- [x] Traits de personnalité (`personalityTraits`)
- [x] Idéaux (`ideals`)
- [x] Liens (`bonds`)
- [x] Défauts (`flaws`)
- [x] Description physique (`appearance`)
- [x] Historique / Background narratif (`backstory`)
- [x] Alliés et organisations (`alliesOrganizations`)

## 8. Tables Liées et Modules Avancés
- [x] Sorts connus et préparés (`spells` via `CharacterSpell`)
- [x] Inventaire physique, équipement et attunements (`inventory` via `CharacterInventoryItem`)
- [x] Suivi des maîtrises d'armes 2024 (`weaponMasteries` via `CharacterWeaponMastery`)
- [x] Compteurs de ressources consommables : Rages, Ki, etc. (`resources` via `CharacterResourceTracker`)
- [x] Langues maîtrisées (`languages` via `CharacterLanguage`)
- [x] Carnets de notes personnels et pièces jointes (`notebooks`)
- [x] Liens de campagnes et de sessions de jeu


## Phase 2 : Moteur de règles pur (dnd-rules-engine)
- [x] Calculateur dynamique de Classe d'Armure (CA) :
  - [x] Détection des armures et boucliers équipés (`isEquipped: true`)
  - [x] Formule Sans armure (10 + DEX, Barbare 10 + DEX + CON, Moine 10 + DEX + SAG)
  - [x] Formule Armure légère (Base + DEX), intermédiaire (Base + min(DEX, 2)), lourde (Base fixe)
  - [x] Prise en compte du bonus de bouclier (+2)
- [x] Perception passive & Sens :
  - [x] Calcul : 10 + bonus de Perception (avec prise en compte de l'avantage ou du don Observateur)
  - [x] Perspicacité passive (10 + SAG) et Investigation passive (10 + INT)
- [x] Calcul dynamique de la vitesse de déplacement :
  - [x] Vitesse de base raciale + bonus de classe (Moine, Barbare) + dons
  - [x] Support des vitesses alternatives (vol, nage, escalade)
- [x] Capacité de charge & Encombrement :
  - [x] Calcul du poids total cumulé de l'inventaire
  - [x] Seuil maximal de transport : FOR * 15 lbs
  - [x] Détection des statuts encombré et lourdement encombré
- [x] Progression automatique des emplacements de sorts (Spell Slots) :
  - [x] Générateur selon le type de lanceur (Plein, Demi, Tiers-lanceur)
  - [x] Prise en charge dédiée de la Magie de Pacte de l'Occultiste (slots au niveau max, retour sur repos court)

## Phase 1 & 2 : Moteur de règles pur (dnd-rules-engine)
- [x] Calculateur dynamique de Classe d'Armure (CA)
- [x] Perception passive & Sens (Perception, Perspicacité, Investigation)
- [x] Calcul dynamique de la vitesse de déplacement (espèces, classes, dons, pénalités)
- [x] Capacité de charge & Encombrement (seuils et statuts)
- [x] Progression automatique des emplacements de sorts (Spell Slots) et Magie de Pacte

## Phase 3 : État du personnage & Données dynamiques (Prisma `Character`)
- [x] Points d'expérience (XP)
- [x] Jets contre la mort (Death Saving Throws)
- [x] Défenses & Altérations :
  - [x] Résistances, immunités et vulnérabilités alignées Foundry (`damageResistances`, `damageImmunities`, `damageVulnerabilities`)
  - [x] Suivi des conditions et états actifs (`activeConditions`)
- [x] Gestion des Harmonisations (Attunement) :
  - [x] Attribut `isAttuned` sur `CharacterInventoryItem`
  - [x] Règle des 3 objets magiques harmonisés maximum (validée dans `toggleItemAttunement`)
- [x] Compteurs de ressources limitées (`CharacterResourceTracker`)
- [x] Demi-dons (Half-feats) :
  - [x] Enregistrement du bonus de +1 sur la caractéristique choisie et mise à jour via notre service de don



## Phase 4 : Interface Utilisateur & Intégration Fiche
- [x] En-tête & Statistiques dérivées :
  - [x] Affichage de la vitesse calculée, vision dans le noir et sens passifs
  - [x] Jauge de progression des points d'expérience (XP)
- [x] Module Jets contre la mort :
  - [x] Affichage automatique dès que les PV tombent à 0 (3 bulles de succès, 3 bulles d'échec)
- [x] Onglet Inventaire enrichi :
  - [x] Barre de progression de la charge portée vs capacité maximale
  - [x] Cases d'harmonisation active (3 slots max)
  - [x] Cartes d'armes avec détails cliquables (dés, propriétés)
- [ ] Options modulaires de classe : Invocations, Métamagie, Manœuvres (`optionalFeatures` via `CharacterOptionalFeature`)
- [ ] Onglet Dons & Aptitudes :
  - [ ] Compteurs interactifs d'utilisations par repos
  - [ ] Interface de choix de statistique pour les demi-dons
- [ ] Onglet Biographie & Apparence :
  - [ ] Champs dédiés : Alignement, Âge, Taille, Poids, Yeux, Peau, Cheveux
  - [ ] Affichage des langues maîtrisées

## Phase 5 : Processus de Création de Personnage (Wizard) — *En cours (Débuggage & Polissage)*
- [x] Structure de base étape par étape (Wizard) :
  - [x] Choix de l'espèce, sous-espèce et historique
  - [x] Sélection de la classe de départ
  - [x] Répartition des caractéristiques (Point Buy)
  - [x] Sélection des compétences, sorts et maîtrises d'armes
- [ ] Résolution des bugs et validation finale :
  - [ ] Correction des quotas de sélection (compétences, sorts, maîtrises)
  - [ ] Cohérence de la persistance des données à la soumission (`onSubmit`)
  - [ ] Gestion des cas particuliers (classes non-lanceuses vs lanceuses de sorts)
- [ ] Polissage, Filtres et Ergonomie :
  - [ ] Ajout de **combobox interactives** avec recherche textuelle pour les listes denses (sorts, équipements, etc.)
  - [ ] Implémentation du **tri et filtrage par livre / source officielle** (ex. PHB 2024)


<br><br>

# Projet Futur  
## Phase X : Simulateur de combat (Training Dummy) & Effect Engine
- [ ] Architecture du Moteur d'Effets (Action & Effect Engine) :
  - [ ] Modélisation déclarative des actions offensives (`ActionEffect`) : coût en ressource, type d'attaque, formule de dés, modificateurs
  - [ ] Système modulaire de déclencheurs (*Triggers*) pour dégâts conditionnels (Sneak Attack, Divine Smite, etc.)
- [ ] Catalogue des modificateurs de combat & Aptitudes (Toggles) :
  - [ ] Prise de risque : *Great Weapon Master* (-5 toucher / +10 dégâts), *Sharpshooter*
  - [ ] Buffs offensifs actifs : *Bless* (+1d4 toucher), *Hunter's Mark* (+1d6), *Hex* (+1d6), *Rage* (+dégâts FOR)
  - [ ] Spells d'attaque directe et mise à l'échelle par niveau d'emplacement (*Upcasting*) : *Eldritch Blast*, *Firebolt*, *Scorching Ray*
- [ ] Configuration du Mannequin (Target Dummy) :
  - [ ] Cible paramétrable : CA ajustable (plage 5 à 25), PV, type d'armure
  - [ ] Résistances, vulnérabilités et immunités configurables sur le mannequin
- [ ] Moteur statistique & Simulation de dégâts :
  - [ ] Calcul de la probabilité exacte de toucher selon la CA adverse (1d20 + modificateur + maîtrise)
  - [ ] Prise en compte de l'Avantage, Désavantage et règles de coups critiques (20 naturel ou seuil étendu 19-20)
  - [ ] Espérance mathématique de dégâts par round (DPR — Damage Per Round)
  - [ ] Simulation stochastique par tirages Monte-Carlo (distribution réelle des dégâts sur 1 000 ou 10 000 rounds)
- [ ] Visualisation statistique interactive (Dashboard Recharts) :
  - [ ] Courbe de rentabilité (DPR vs CA) : identifier le seuil de bascule où activer GWM/Sharpshooter devient sous-optimal
  - [ ] Graphiques comparatifs multi-builds : arme à deux mains vs combat à deux armes vs sorts
  - [ ] Histogramme de répartition des dégâts (dégâts minimum, médians, maximum et burst sur critique)