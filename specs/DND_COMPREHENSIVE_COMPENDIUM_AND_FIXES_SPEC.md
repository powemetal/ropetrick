# Spécification Technique Exhaustive : Architecture Compendium Multi-Livres, Compétences Officielles, Grimoire & Correctifs Critiques

## 1. Correctif Immédiat : Crash Calendrier (startTime ZodError)
- **Fichier** : `src/modules/scheduling/schemas/index.ts`
- **Origine du bug** : L'input HTML ou le navigateur transmet une chaîne incluant les secondes (`19:00:00`) ou des espaces, rejetée par la regex stricte `/^([01]\d|2[0-3]):[0-5]\d$/`.
- **Correctif** :
  - Dans `ScheduleRuleCreateSchema`, appliquer une transformation systématique sur `startTime` et `endTime` :
    - `startTime`: `z.string().transform((val) => val.trim().slice(0, 5)).pipe(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "L'heure doit respecter le format HH:MM"))`
    - `endTime`: `z.string().transform((val) => val.trim().slice(0, 5)).pipe(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "L'heure doit respecter le format HH:MM"))`

## 2. Compartimentation Modulaire par Livre de Règles (Sourcebooks)
Pour permettre d'ajouter, activer ou filtrer le contenu d'un livre (PHB 2014, PHB 2024, Xanathar, Tasha, Monsters of the Multiverse, Unearthed Arcana) sans impacter les autres données :

### Modèle SourceBook (`prisma/schema.prisma`)
- `id`: `String @id @default(cuid())`
- `code`: `String @unique` (ex: `PHB_2024`, `TCE`, `XGE`, `MPMM`, `UA_2024`)
- `title`: `String` (ex: `Player's Handbook 2024`, `Tasha's Cauldron of Everything`)
- `isOfficial`: `Boolean @default(true)`
- `enabledByDefault`: `Boolean @default(true)`
- Relations : `species Species[]`, `subspecies Subspecies[]`, `backgrounds Background[]`, `dndClasses DndClass[]`, `dndSubclasses DndSubclass[]`, `spells Spell[]`, `feats Feat[]`, `items EquipmentItem[]`, `monsters Monster[]`, `campaigns CampaignSourceBook[]`
- Métadonnées : `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Mappage : `@@map("source_books")`

### Clés étrangères requises
- Ajouter `sourceBookId String` et la relation `sourceBook SourceBook @relation(...)` sur les modèles :
  - `Species`, `Subspecies`, `Background`, `DndClass`, `DndSubclass`, `Spell`, `Feat`, `EquipmentItem` et `Monster`.

## 3. Table des Compétences Officielles (SkillDefinition)
Création d'une table dédiée pour stocker le texte officiel intégral, la caractéristique de référence et les exemples concrets :

### Modèle SkillDefinition (`prisma/schema.prisma`)
- `id`: `String @id @default(cuid())`
- `code`: `String @unique` (ex: `ATHLETICS`, `ARCANA`, `STEALTH`, `HISTORY`)
- `name`: `String` (ex: `Athlétisme`, `Arcanes`, `Histoire`)
- `ability`: `String` (`STRENGTH`, `DEXTERITY`, `INTELLIGENCE`, `WISDOM`, `CHARISMA`)
- `description`: `String @db.Text`
- `examples`: `String @db.Text`
- Métadonnées : `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Mappage : `@@map("skill_definitions")`

### Données Officielles à Injecter (18 Compétences)
1. **Athlétisme (FOR)** : Escalader des parois escarpées, sauter par-dessus un gouffre, nager à contre-courant, lutter au corps-à-corps, forcer une porte bloquée.
2. **Acrobaties (DEX)** : Garder l'équilibre sur une corniche étroite ou une corde, réaliser des cabrioles, atterrir gracieusement après une chute.
3. **Escamotage (DEX)** : Faire disparaître un objet dans sa manche, dérober une bourse à la ceinture, crocheter discrètement, dissimuler une dague.
4. **Discrétion (DEX)** : Se déplacer sans bruit, se faufiler dans les ombres, échapper aux gardes en évitant d'être vu ou entendu.
5. **Arcanes (INT)** : Connaissance des sorts, des objets magiques, des symboles arcaniques, des traditions magiques et des plans d'existence.
6. **Histoire (INT)** : Connaissance des événements historiques, légendes anciennes, dynasties régnantes, guerres passées et civilisations disparues.
7. **Investigation (INT)** : Déduire un mécanisme caché, repérer des indices dissimulés, déterminer le point de rupture d'un mur, fouiller méthodiquement.
8. **Nature (INT)** : Connaissance de la faune, de la flore, des climats, des terrains sauvages et des créatures naturelles.
9. **Religion (INT)** : Connaissance des divinités, panthéons, rituels sacrés, hiérarchies cléricales et symboles religieux.
10. **Dressage (SAG)** : Calmer une bête sauvage paniquée, contrôler sa monture lors d'un combat, entraîner un animal familier.
11. **Intuition (SAG)** : Détecter le mensonge, évaluer les intentions réelles d'un interlocuteur par son langage corporel et le ton de sa voix.
12. **Médecine (SAG)** : Stabiliser un mourant aux portes de la mort, diagnostiquer une maladie, identifier un poison mortel.
13. **Perception (SAG)** : Voir ou entendre des créatures en embuscade, repérer un danger avant qu'il ne frappe, remarquer un détail sensoriel.
14. **Survie (SAG)** : Suivre des pistes dans la boue ou la neige, trouver de l'eau et de la nourriture en milieu hostile, s'orienter sans repères.
15. **Tromperie (CHA)** : Raconter un mensonge crédible, dissimuler ses véritables motifs, négocier sous une fausse identité.
16. **Intimidation (CHA)** : Menacer physiquement ou verbalement un prisonnier, forcer un garde à reculer par sa simple présence.
17. **Représentation (CHA)** : Raconter une épopée dans une taverne, jouer d'un instrument, émouvoir une foule ou captiver l'attention d'une cour.
18. **Persuasion (CHA)** : Négocier une alliance diplomatique, convaincre un marchand réticent, rallier des alliés avec bienveillance.

## 4. Inventaire Complet pour la Création de Personnages et Monstres (Seed Exhaustif)

### A. Modèle & Données des Sorts (Spell)
- **Structure** :
  - `name`: nom complet du sort.
  - `level`: entier de 0 à 9 (0 = Tour de magie / Cantrip).
  - `school`: Abjuration, Invocation, Divination, Enchantement, Évocation, Illusion, Nécromancie, Transmutation.
  - `castingTime`: Action, Action bonus, Réaction, 1 minute, etc.
  - `range`: Contact, 9m, 18m, 36m, etc.
  - `components`: V, S, M.
  - `materials`: détail textuel du composant matériel et coût en PO éventuel.
  - `duration`: durée textuelle.
  - `concentration`: booléen.
  - `ritual`: booléen.
  - `description`: texte officiel exhaustif.
  - `higherLevels`: description des effets par niveau d'emplacement supérieur.
  - `classes`: tableau des classes éligibles (WIZARD, CLERIC, DRUID, BARD, SORCERER, WARLOCK, PALADIN, RANGER, ARTIFICER).
- **Catalogue minimum au Seed** :
  - **Tours de magie (Niveau 0)** : Prestidigitation, Ray of Frost, Fire Bolt, Guidance, Eldritch Blast, Mage Hand, Minor Illusion, Sacred Flame, Shillelagh, Spare the Dying, Thaumaturgy, Toll the Dead, Mind Sliver, Acid Splash, Shocking Grasp, Blade Ward, Light, Poison Spray.
  - **Niveau 1** : Magic Missile, Shield, Mage Armor, Healing Word, Cure Wounds, Guiding Bolt, Bless, Bane, Hex, Hunter's Mark, Thunderwave, Sleep, Charm Person, Dissonant Whispers, Faerie Fire, Absorb Elements, Silvery Barbs, Burning Hands, Inflict Wounds, Sanctuary, Fog Cloud, Grease.
  - **Niveaux 2 à 9** : Misty Step, Spiritual Weapon, Scorching Ray, Hold Person, Fireball, Counterspell, Lightning Bolt, Revivify, Spirit Guardians, Haste, Polymorph, Banishment, Greater Restoration, Wall of Force, Chain Lightning, Heal, Disintegrate, Teleport, Wish.

### B. Modèle & Données des Dons (Feat)
- **Structure** :
  - `name`: nom du don.
  - `category`: `ORIGIN`, `GENERAL`, `EPIC_BOON`.
  - `levelRequirement`: palier de niveau requis (1, 4, 8, etc.).
  - `prerequisites`: texte des prérequis (caractéristiques, maîtrise).
  - `description`: texte officiel exhaustif des bénéfices.
  - `abilityModifiers`: objet JSON détaillant les augmentations de score d'attribut (+1).
- **Catalogue minimum au Seed** :
  - **Dons d'Origine (Niveau 1)** : Alert, Crafter, Healer, Lucky, Magic Initiate (Cleric, Druid, Wizard), Musician, Savage Attacker, Skilled, Tavern Brawler, Tough.
  - **Dons Généraux (Niveau 4+)** : War Caster, Sentinel, Great Weapon Master, Sharpshooter, Fey Touched, Shadow Touched, Resilient, Polearm Master, Mobile, Alertness, Telekinetic, Actor, Dual Wielder.

### C. Sous-classes Multi-Livres (DndSubclass)
Rattachement strict à la classe et au livre source :
- **Barbare** : Berserker, Wild Magic (TCE), Beast (TCE), Zealot (XGE), Ancestral Guardian (XGE), Totem Warrior.
- **Barde** : Lore, Valor, Glamour (XGE), Swords (XGE), Eloquence (TCE), Creation (TCE).
- **Clerc** : Life, Light, Trickery, War, Forge (XGE), Grave (XGE), Peace (TCE), Twilight (TCE).
- **Druide** : Land, Moon, Shepherd (XGE), Spores (TCE), Stars (TCE), Wildfire (TCE).
- **Ensorceleur** : Draconic, Wild Magic, Divine Soul (XGE), Shadow (XGE), Aberrant Mind (TCE), Clockwork Soul (TCE).
- **Guerrier** : Champion, Battle Master, Eldritch Knight, Samurai (XGE), Arcane Archer (XGE), Psi Warrior (TCE), Rune Knight (TCE).
- **Magicien** : Abjuration, Evocation, Divination, Necromancy, Transmutation, War Magic (XGE), Bladesinging (TCE), Chronurgy, Graviturgy.
- **Moine** : Open Hand, Shadow, Four Elements, Kensei (XGE), Sun Soul (XGE), Mercy (TCE), Astral Self (TCE).
- **Occultiste** : Fiend, Great Old One, Archfey, Celestial (XGE), Hexblade (XGE), Fathomless (TCE), Genie (TCE).
- **Paladin** : Devotion, Ancients, Vengeance, Conquest (XGE), Redemption (XGE), Glory (TCE), Watchers (TCE).
- **Rôdeur** : Hunter, Beast Master, Gloom Stalker (XGE), Horizon Walker (XGE), Monster Slayer (XGE), Fey Wanderer (TCE), Swarmkeeper (TCE).
- **Roublard** : Thief, Assassin, Arcane Trickster, Inquisitive (XGE), Mastermind (XGE), Scout (XGE), Swashbuckler (XGE), Phantom (TCE), Soulknife (TCE).
- **Artificier** : Alchemist, Armorer (TCE), Artillerist, Battle Smith.

### D. Données pour Monstres & PNJ (MonsterTemplate)
- Caractéristiques suggérées par CR (0 à 30) : CA, PV (dés de vie), Bonus d'Attaque, Dégâts moyens par round, DD de Sauvegarde.
- Templates réutilisables d'Actions Légendaires (Déplacement éclair, Coup d'aile/queue, Présence terrifiante).
- Templates d'Actions de Repaire (Secousse sismique, Vapeurs toxiques, Éboulis rocheux, Invocation d'ombres).

## 5. Rigueur & Intégration dans le Wizard de Personnage (CharacterWizard.tsx)

### Étape 1 - Identité
- Le champ `Nom` est obligatoire.
- Le bouton `Suivant` reste bloqué tant que le champ est vide ou composé uniquement d'espaces.

### Étape 2 - Espèce & Sous-espèce
- Au clic sur une espèce : affichage immédiat d'un volet latéral avec la description officielle, la vitesse, la vision dans le noir et l'ensemble des traits raciaux.

### Étape 3 - Historique 2024
- Affiche les 3 attributs éligibles.
- Injecte automatiquement le Don d'Origine correspondant avec son infobulle (`Tooltip`) descriptive.

### Étape 4 - Classe
- La sélection de sous-classe est strictement masquée ou verrouillée au niveau 1 avec le libellé explicite : `Déblocage au Niveau 3`.

### Étape 5 - Compétences Réactives
- Les compétences sont alimentées dynamiquement depuis la table `SkillDefinition`.
- Au survol ou clic, affichage de la description officielle complète et des exemples d'usage concrets.
- Les compétences issues de l'historique sont pré-cochées et verrouillées.
- Les compétences de classe sont restreintes au quota exact : désactivation automatique de toutes les autres cases dès que le quota est atteint.

### Étape 6 - Grimoire & Sorts de Départ (Obligatoire pour les incantateurs)
- Étape affichée obligatoirement si la classe dispose de sorts au niveau 1 :
  - **Magicien** : sélection exacte de 3 cantrips et de 6 sorts de niveau 1 pour son grimoire.
  - **Clerc / Druide** : sélection de 3 cantrips et préparation des sorts selon le `Modificateur SAG + 1`.
  - **Barde** : sélection de 2 cantrips et 4 sorts connus de niveau 1.
  - **Ensorceleur / Occultiste** : sélection de leurs cantrips et sorts connus stricts de niveau 1.
- Chaque sort est présenté sous forme de carte interactive reprenant la mise en page officielle du livre (École, Durée, Portée, Composantes, Effets).
- Bloque le passage tant que tous les emplacements requis ne sont pas alloués.
- Persistance en base dans `CharacterSpell` lors de la soumission finale.