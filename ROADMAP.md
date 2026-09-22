# Roadmap : Consolidation du personnage D&D 5e

## Phase 1 : Schéma Prisma & Données de référence (Compendium)
- [ ] Modèles de base :
  - [ ] `Race` & `Subrace` (bonus de caractéristiques, vitesse de base, vision dans le noir, traits raciaux)
  - [ ] `Background` (compétences accordées, langues, don d'origine)
  - [ ] `Alignment` (enum ou table : Loyal Bon, Chaotique Neutre, etc.)
  - [ ] `Language` (table normalisée + table de liaison `CharacterLanguage`)
- [ ] Extension du modèle `Item` (préparation au simulateur de combat) :
  - [ ] Types d'armes (Courante, Guerre, Corps à corps, Distance)
  - [ ] Formule de dégâts (`damageDice`, ex: 1d8, 2d6) et type de dégâts (Tranchant, Perforant, Contondant, etc.)
  - [ ] Propriétés d'armes (finesse, heavy, versatile, two-handed, reach, thrown, etc.)
  - [ ] Types d'armures (light, medium, heavy, shield) et prérequis de Force
  - [ ] Attribut d'harmonisation requise (`requiresAttunement`)
- [ ] Données & Seeds :
  - [ ] Script de seed ou import pour les races, historiques et équipements du SRD 5e

# Checklist - Implémentation des Personnages & Moteur d'Import

## 1. Identité, Métadonnées et Informations Générales
- [ ] Nom du personnage (`name`)
- [ ] Avatar (`avatarUrl`)
- [ ] Alignement (`alignment` via enum `Alignment`)
- [ ] Niveau (`level`) et Expérience (`experiencePoints`)
- [ ] Champs textuels de repli (`race`, `class`, `subclass`)
- [ ] Intégration Foundry VTT (`foundryActorId`, `foundryVersion`, `rawImportData`)
- [ ] Thèmes visuels (`themeKey`, `notebookTheme`)

## 2. Relations avec le Compendium (D&D Core)
- [ ] Espèce / Race (`speciesId`)
- [ ] Sous-espèce (`subspeciesId`)
- [ ] Historique (`backgroundId`)
- [ ] Classe principale (`dndClassId`)
- [ ] Sous-classe (`subclassId`)

## 3. Caractéristiques et Modificateurs (Ability Scores)
- [ ] Scores bruts (Force, Dextérité, Constitution, Intelligence, Sagesse, Charisme)
- [ ] Calcul automatique ou manuel des modificateurs associés
- [ ] Objet JSON pour les stats personnalisées (`stats`)

## 4. Maîtrises, Jets et Capacités Magiques
- [ ] État des jets de sauvegarde (`savingThrows` en JSON)
- [ ] Niveaux de maîtrise des compétences (*None*, *Proficient*, *Expertise*) via `skillProficiencies`
- [ ] Gestion de la grille des emplacements de sorts (`spellSlots`)
- [ ] Statistiques de sort (`spellSaveDc`, `spellAttackBonus`)
- [ ] État de l'inspiration (`inspiration`)

## 5. Combat, Santé et Survie
- [ ] Points de vie (Max, Actuels, Temporaires)
- [ ] Dés de vie (Type de dé, Total, Actuels)
- [ ] Sauvegardes contre la mort (`deathSaves`) et niveau d'épuisement (`exhaustionLevel`)
- [ ] Défenses et déplacements (`armorClass`, `initiative`, `speed`)

## 6. Équipement, Armure et Devises
- [ ] Données détaillées d'armure (`armorCategory`, `armorBaseClass`, `armorDexCap`, `shieldBonus`)
- [ ] Dons sélectionnés (`selectedFeats` en JSON)
- [ ] Portefeuille (Pièces de Cuivre, Argent, Électrum, Or, Platine)

## 7. Rôle-play et Éléments Narratifs (Fluff)
- [ ] Traits de personnalité (`personalityTraits`)
- [ ] Idéaux (`ideals`)
- [ ] Liens (`bonds`)
- [ ] Défauts (`flaws`)
- [ ] Description physique (`appearance`)
- [ ] Historique / Background narratif (`backstory`)
- [ ] Alliés et organisations (`alliesOrganizations`)

## 8. Tables Liées et Modules Avancés
- [ ] Sorts connus et préparés (`spells` via `CharacterSpell`)
- [ ] Inventaire physique, équipement et attunements (`inventory` via `CharacterInventoryItem`)
- [ ] Suivi des maîtrises d'armes 2024 (`weaponMasteries` via `CharacterWeaponMastery`)
- [ ] Options modulaires de classe : Invocations, Métamagie, Manœuvres (`optionalFeatures` via `CharacterOptionalFeature`)
- [ ] Compteurs de ressources consommables : Rages, Ki, etc. (`resources` via `CharacterResourceTracker`)
- [ ] Langues maîtrisées (`languages` via `CharacterLanguage`)
- [ ] Carnets de notes personnels et pièces jointes (`notebooks`)
- [ ] Liens de campagnes et de sessions de jeu


## Phase 2 : Moteur de règles pur (dnd-rules-engine)
- [ ] Calculateur dynamique de Classe d'Armure (CA) :
  - [ ] Détection des armures et boucliers équipés (`isEquipped: true`)
  - [ ] Formule Sans armure (10 + DEX, Barbare 10 + DEX + CON, Moine 10 + DEX + SAG)
  - [ ] Formule Armure légère (Base + DEX), intermédiaire (Base + min(DEX, 2)), lourde (Base fixe)
  - [ ] Prise en compte du bonus de bouclier (+2)
- [ ] Perception passive & Sens :
  - [ ] Calcul : 10 + bonus de Perception (avec prise en compte de l'avantage ou du don Observateur)
  - [ ] Perspicacité passive (10 + SAG) et Investigation passive (10 + INT)
- [ ] Calcul dynamique de la vitesse de déplacement :
  - [ ] Vitesse de base raciale + bonus de classe (Moine, Barbare) + dons
  - [ ] Support des vitesses alternatives (vol, nage, escalade)
- [ ] Capacité de charge & Encombrement :
  - [ ] Calcul du poids total cumulé de l'inventaire
  - [ ] Seuil maximal de transport : FOR * 15 lbs
  - [ ] Détection des statuts encombré et lourdement encombré
- [ ] Progression automatique des emplacements de sorts (Spell Slots) :
  - [ ] Générateur selon le type de lanceur (Plein, Demi, Tiers-lanceur)
  - [ ] Prise en charge dédiée de la Magie de Pacte de l'Occultiste (slots au niveau max, retour sur repos court)

## Phase 3 : État du personnage & Données dynamiques (Prisma `Character`)
- [ ] Points d'expérience (XP) :
  - [ ] Champ `experiencePoints Int @default(0)`
- [ ] Jets contre la mort (Death Saving Throws) :
  - [ ] Modélisation `{ successes: number, failures: number }` (0 à 3)
- [ ] Défenses & Altérations :
  - [ ] Résistances, immunités et vulnérabilités aux types de dégâts
  - [ ] Suivi des conditions et états actifs (Empoisonné, À terre, Charmé, etc.)
- [ ] Gestion des Harmonisations (Attunement) :
  - [ ] Attribut `isAttuned` sur `CharacterInventoryItem`
  - [ ] Règle des 3 objets magiques harmonisés maximum
- [ ] Compteurs de ressources limitées :
  - [ ] Suivi des utilisations restantes / max pour aptitudes et dons (Rage, Second souffle, Forme sauvage)
- [ ] Demi-dons (Half-feats) :
  - [ ] Enregistrement de la caractéristique sélectionnée pour le bonus (+1 au choix)

## Phase 4 : Interface Utilisateur & Intégration Fiche
- [ ] En-tête & Statistiques dérivées :
  - [ ] Affichage de la vitesse calculée, vision dans le noir et sens passifs
  - [ ] Jauge de progression des points d'expérience (XP)
- [ ] Module Jets contre la mort :
  - [ ] Affichage automatique dès que les PV tombent à 0 (3 bulles de succès, 3 bulles d'échec)
- [ ] Onglet Inventaire enrichi :
  - [ ] Barre de progression de la charge portée vs capacité maximale
  - [ ] Cases d'harmonisation active (3 slots max)
  - [ ] Cartes d'armes avec détails cliquables (dés, propriétés)
- [ ] Onglet Dons & Aptitudes :
  - [ ] Compteurs interactifs d'utilisations par repos
  - [ ] Interface de choix de statistique pour les demi-dons
- [ ] Onglet Biographie & Apparence :
  - [ ] Champs dédiés : Alignement, Âge, Taille, Poids, Yeux, Peau, Cheveux
  - [ ] Affichage des langues maîtrisées

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