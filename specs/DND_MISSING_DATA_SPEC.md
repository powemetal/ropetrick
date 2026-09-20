Markdown# Spécification Technique Exhaustive : Moteur Complet D&D 5.5 / 5e, Compendium Intégral & Monstre/PNJ Builder

Ce document constitue la référence définitive pour combler l'intégralité des systèmes manquants : Maîtrises d'Armes 2024, Équipements & Armures calculées, Langues, Ressources de Classes à jauges, Profils de Monstres/Boss (CR scaling, Lair & Legendary), et la rigueur bloquante du Wizard de création.

---

## 1. Schéma de Données Complémentaire Prisma (`prisma/schema.prisma`)

```prisma
// ------------------------------------------------------
// GESTION DES SOURCES & LIVRES
// ------------------------------------------------------
model SourceBook {
  id               String          @id @default(cuid())
  code             String          @unique // "PHB_2024", "PHB_2014", "XGE", "TCE", "ULA_2026", "SCAG", "ERLW", "MoT", "BGG", "DSotDQ", "BoMT", "UA_PLAYTEST"
  title            String
  isOfficial       Boolean         @default(true)
  enabledByDefault Boolean         @default(true)

  species          Species[]
  subspecies       Subspecies[]
  backgrounds      Background[]
  dndClasses       DndClass[]
  dndSubclasses    DndSubclass[]
  spells           Spell[]
  feats            Feat[]
  items            EquipmentItem[]
  monsters         Monster[]
  campaigns        CampaignSourceBook[]

  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  @@map("source_books")
}

model CampaignSourceBook {
  id           String     @id @default(cuid())
  campaignId   String
  sourceBookId String
  campaign     Campaign   @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  sourceBook   SourceBook @relation(fields: [sourceBookId], references: [id], onDelete: Cascade)

  @@unique([campaignId, sourceBookId])
  @@map("campaign_source_books")
}

// ------------------------------------------------------
// MAÎTRISES D'ARMES 2024 (WEAPON MASTERY)
// ------------------------------------------------------
model WeaponMasteryProperty {
  id          String          @id @default(cuid())
  code        String          @unique // "CLEAVE", "GRAZE", "NICK", "PUSH", "SAP", "SLOW", "TOPPLE", "VEX"
  name        String          // "Fendoir", "Éraflure", "Coup vif", etc.
  description String          @db.Text
  items       EquipmentItem[]
  characters  CharacterWeaponMastery[]

  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@map("weapon_mastery_properties")
}

model CharacterWeaponMastery {
  id          String                @id @default(cuid())
  characterId String
  masteryId   String
  character   Character             @relation(fields: [characterId], references: [id], onDelete: Cascade)
  mastery     WeaponMasteryProperty @relation(fields: [masteryId], references: [id], onDelete: Cascade)

  @@unique([characterId, masteryId])
  @@map("character_weapon_masteries")
}

// ------------------------------------------------------
// ÉQUIPEMENT, ARMURES & OUTILS
// ------------------------------------------------------
enum ItemType {
  WEAPON
  ARMOR
  SHIELD
  TOOL
  GEAR
  CONSUMABLE
}

enum ArmorCategory {
  LIGHT
  MEDIUM
  HEAVY
  SHIELD
}

model EquipmentItem {
  id                  String                 @id @default(cuid())
  sourceBookId        String
  sourceBook          SourceBook             @relation(fields: [sourceBookId], references: [id], onDelete: Cascade)
  name                String
  type                ItemType
  costGp              Float                  @default(0)
  weightLb            Float                  @default(0)
  description         String?                @db.Text
  
  // Armes
  damageFormula       String?                // ex: "1d8", "2d6"
  damageType          String?                // "SLASHING", "PIERCING", "BLUDGEONING"
  properties          String[]               // ["FINESSE", "LIGHT", "TWO_HANDED", "HEAVY", "REACH", "THROWN", "VERSATILE"]
  rangeNormal         Int?
  rangeLong           Int?
  masteryPropertyId   String?
  masteryProperty     WeaponMasteryProperty? @relation(fields: [masteryPropertyId], references: [id])

  // Armures & Boucliers
  armorCategory       ArmorCategory?
  baseAc              Int?                   // ex: 11, 14, 18, +2
  dexterityBonusMax   Int?                   // null (plein DEX), 2 (Medium), 0 (Heavy)
  strengthRequirement Int?                   // ex: 13, 15
  stealthDisadvantage Boolean                @default(false)

  // Outils
  toolCategory        String?                // "ARTISAN", "GAMING", "INSTRUMENT", "THIEVES", "SPECIALIZED"

  characters          CharacterInventory[]
  createdAt           DateTime               @default(now())
  updatedAt           DateTime               @updatedAt

  @@map("equipment_items")
}

model CharacterInventory {
  id          String        @id @default(cuid())
  characterId String
  itemId      String
  quantity    Int           @default(1)
  isEquipped  Boolean       @default(false)
  character   Character     @relation(fields: [characterId], references: [id], onDelete: Cascade)
  item        EquipmentItem @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@map("character_inventories")
}

// ------------------------------------------------------
// RESSOURCES DE CLASSE & COMPTEURS
// ------------------------------------------------------
enum ResetCondition {
  SHORT_REST
  LONG_REST
  SPECIAL
}

model ClassResourceDefinition {
  id             String          @id @default(cuid())
  dndClassId     String
  name           String          // "Rages", "Second Wind", "Ki Points", "Sorcery Points", "Action Surge"
  resetCondition ResetCondition
  formulaByLevel Json            // Tableau [level]: maxUsages ex: {"1": 2, "3": 3, "20": 999}
  diceFormula    String?         // Pour Barde: {"1": "1d6", "5": "1d8", "10": "1d10", "15": "1d12"}
  dndClass       DndClass        @relation(fields: [dndClassId], references: [id], onDelete: Cascade)

  @@map("class_resource_definitions")
}

model CharacterResourceTracker {
  id             String    @id @default(cuid())
  characterId    String
  name           String
  currentValue   Int
  maxValue       Int
  diceFormula    String?
  resetCondition ResetCondition
  character      Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  @@map("character_resource_trackers")
}

// ------------------------------------------------------
// LANGUES OFFICIELLES
// ------------------------------------------------------
model Language {
  id          String              @id @default(cuid())
  name        String              @unique
  script      String              // "Commun", "Nain", "Elfique", "Infernal", etc.
  isExotic    Boolean             @default(false)
  characters  CharacterLanguage[]

  @@map("languages")
}

model CharacterLanguage {
  id          String    @id @default(cuid())
  characterId String
  languageId  String
  character   Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  language    Language  @relation(fields: [languageId], references: [id], onDelete: Cascade)

  @@unique([characterId, languageId])
  @@map("character_languages")
}

// ------------------------------------------------------
// MODÈLE MONSTRE & BOSS (STAT-BLOCK 5.5)
// ------------------------------------------------------
enum CreatureSize {
  TINY
  SMALL
  MEDIUM
  LARGE
  HUGE
  GARGANTUAN
}

model Monster {
  id                    String      @id @default(cuid())
  sourceBookId          String
  sourceBook            SourceBook  @relation(fields: [sourceBookId], references: [id], onDelete: Cascade)
  name                  String
  size                  CreatureSize
  type                  String      // "Dragon", "Aberration", "Undead", "Fiend", "Humanoid", etc.
  subtype               String?
  alignment             String      // "Chaotic Evil", "Unaligned", etc.
  cr                    Float       // Challenge Rating (0, 0.125, 0.25, 0.5, 1 à 30)
  proficiencyBonus      Int         // Calculé selon le CR
  armorClass            Int
  armorType             String?     // "Armure naturelle", "Harnois", etc.
  hitPoints             Int
  hitDice               String      // ex: "18d12 + 108"
  speed                 String      // ex: "9m, vol 24m, nage 12m"

  // Attributs
  strength              Int
  dexterity             Int
  constitution          Int
  intelligence          Int
  wisdom                Int
  charisma              Int

  // Sauvegardes & Compétences (JSON)
  savingThrows          Json?       // {"STR": 8, "CON": 12, "WIS": 7}
  skills                Json?       // {"Perception": 11, "Stealth": 6}

  // Vulnérabilités, Résistances, Immunités
  damageVulnerabilities String[]
  damageResistances     String[]
  damageImmunities      String[]
  conditionImmunities   String[]

  // Sens & Langues
  senses                String      // ex: "Vision aveugle 18m, Vision dans le noir 36m, Perception passive 21"
  passivePerception     Int
  languages             String      // ex: "Commun, Draconique"

  // Actions & Aptitudes Structurées (Tableaux JSON typés)
  traits                Json        // [{"name": "Magic Resistance", "description": "..."}]
  actions               Json        // [{"name": "Multiattack", "description": "..."}, {"name": "Morsure", "toHit": 11, "reach": "3m", "damage": "2d10 + 6", "damageType": "Piercing"}]
  bonusActions          Json?
  reactions             Json?

  // Mécaniques Légendaires & Repaire (Boss)
  isLegendary           Boolean     @default(false)
  legendaryResistances  Int         @default(0) // Généralement 3/jour
  legendaryActionsCount Int         @default(0) // Généralement 3/round
  legendaryActions      Json?       // [{"name": "Attaque d'aile", "cost": 2, "description": "..."}]
  
  hasLair               Boolean     @default(false)
  lairActions           Json?       // [{"initiative": 20, "description": "..."}]
  regionalEffects       Json?

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@map("monsters")
}
2. Données Complètes à Injecter au Seed (prisma/seed-compendium.ts)A. Les 8 Propriétés de Maîtrise des Armes 2024 (WeaponMasteryProperty)Cleave (Fendoir) : Sur une frappe de corps-à-corps réussie avec une arme lourde, vous effectuez une seconde attaque gratuite contre une autre créature située à moins de 1,5 m de la première et dans votre allonge. Dégâts limités aux dés d'arme sans modificateur de caractéristique.Graze (Éraflure) : Même en cas d'attaque manquée avec une arme lourde, la cible subit un montant de dégâts égal au modificateur de caractéristique utilisé pour le jet d'attaque (ne peut être réduit sous 1).Nick (Coup vif) : Permet d'effectuer l'attaque supplémentaire conférée par la propriété Légère dans le cadre de l'action Attaque principale, sans consommer votre Action Bonus.Push (Repousser) : Sur une attaque réussie, vous projetez la créature touchée (de taille G ou inférieure) jusqu'à 3 mètres (10 ft) en ligne droite à l'opposé de vous.Sap (Affaiblir) : Sur une attaque réussie, la cible subit un désavantage sur son prochain jet d'attaque effectué avant le début de votre prochain tour.Slow (Ralentir) : Sur une attaque réussie infligeant des dégâts, la vitesse de déplacement de la cible est réduite de 3 mètres (10 ft) jusqu'au début de votre prochain tour (non cumulatif).Topple (Renverser) : Sur une attaque réussie, la créature doit réussir un jet de sauvegarde de Constitution (DD = $8 + \text{Bonus de Maîtrise} + \text{Modificateur d'Attaque}$) sous peine de tomber à terre (Prone).Vex (Harceler) : Sur une attaque réussie infligeant des dégâts, vous obtenez l'avantage sur votre prochain jet d'attaque contre cette même cible avant la fin de votre tour suivant.B. Catalogue Exhaustif des Armes Officielles avec Maîtrises AssociéesDague (Dagger) : 2 PO, 0,5 kg | Dégâts: 1d4 Perforant | Finesse, Légère, Lancer (6m/18m) | Maîtrise : NickÉpée courte (Shortsword) : 10 PO, 1 kg | Dégâts: 1d6 Perforant | Finesse, Légère | Maîtrise : VexCimeterre (Scimitar) : 25 PO, 1,5 kg | Dégâts: 1d6 Tranchant | Finesse, Légère | Maîtrise : NickRapière (Rapier) : 25 PO, 1 kg | Dégâts: 1d8 Perforant | Finesse | Maîtrise : VexÉpée longue (Longsword) : 15 PO, 1,5 kg | Dégâts: 1d8 (Polyvalente 1d10) Tranchant | Polyvalente | Maîtrise : SapGrande épée (Greatsword) : 50 PO, 3 kg | Dégâts: 2d6 Tranchant | Lourde, Deux mains | Maîtrise : GrazeHache d'armes (Battleaxe) : 10 PO, 2 kg | Dégâts: 1d8 (Polyvalente 1d10) Tranchant | Polyvalente | Maîtrise : ToppleGrande hache (Greataxe) : 30 PO, 3,5 kg | Dégâts: 1d12 Tranchant | Lourde, Deux mains | Maîtrise : CleaveMasse d'armes (Mace) : 5 PO, 2 kg | Dégâts: 1d6 Contondant | Simple | Maîtrise : SapMarteau de guerre (Warhammer) : 15 PO, 1 kg | Dégâts: 1d8 (Polyvalente 1d10) Contondant | Polyvalente | Maîtrise : PushGrand marteau (Maul) : 10 PO, 5 kg | Dégâts: 2d6 Contondant | Lourde, Deux mains | Maîtrise : ToppleHallebarde (Halberd) : 20 PO, 3 kg | Dégâts: 1d10 Tranchant | Lourde, Deux mains, Allonge | Maîtrise : CleavePique (Glaive) : 20 PO, 3 kg | Dégâts: 1d10 Tranchant | Lourde, Deux mains, Allonge | Maîtrise : GrazeLance (Spear) : 1 PO, 1,5 kg | Dégâts: 1d6 (Polyvalente 1d8) Perforant | Polyvalente, Lancer (6m/18m) | Maîtrise : SapArc court (Shortbow) : 25 PO, 1 kg | Dégâts: 1d6 Perforant | Deux mains, Munitions (24m/96m) | Maîtrise : VexArc long (Longbow) : 50 PO, 1 kg | Dégâts: 1d8 Perforant | Lourde, Deux mains, Munitions (45m/180m) | Maîtrise : SlowArbalète légère (Light Crossbow) : 25 PO, 2,5 kg | Dégâts: 1d8 Perforant | Deux mains, Chargement (24m/96m) | Maîtrise : SlowArbalète lourde (Heavy Crossbow) : 50 PO, 8 kg | Dégâts: 1d10 Perforant | Lourde, Deux mains, Chargement (30m/120m) | Maîtrise : PushArbalète de poing (Hand Crossbow) : 75 PO, 1,5 kg | Dégâts: 1d6 Perforant | Légère, Chargement (9m/36m) | Maîtrise : VexC. Catalogue des Armures et BoucliersMatelassée (Padded) : 5 PO | CA: 11 + DEX | Légère | Discrétion désavantage | 4 kgCuir (Leather) : 10 PO | CA: 11 + DEX | Légère | Pas de malus | 5 kgCuir clouté (Studded Leather) : 45 PO | CA: 12 + DEX | Légère | Pas de malus | 6,5 kgChemise de mailles (Chain Shirt) : 50 PO | CA: 13 + min(DEX, 2) | Moyenne | Pas de malus | 10 kgÉcailles (Scale Mail) : 50 PO | CA: 14 + min(DEX, 2) | Moyenne | Discrétion désavantage | 20 kgCuirasse (Breastplate) : 400 PO | CA: 14 + min(DEX, 2) | Moyenne | Pas de malus | 10 kgDemi-plate (Half Plate) : 750 PO | CA: 15 + min(DEX, 2) | Moyenne | Discrétion désavantage | 20 kgBroigne (Ring Mail) : 30 PO | CA: 14 | Lourde | Discrétion désavantage | 20 kgCotte de mailles (Chain Mail) : 75 PO | CA: 16 | Lourde | FOR 13 | Discrétion désavantage | 25 kgClibanion (Splint) : 200 PO | CA: 17 | Lourde | FOR 15 | Discrétion désavantage | 30 kgHarnois (Plate) : 1500 PO | CA: 18 | Lourde | FOR 15 | Discrétion désavantage | 32 kgBouclier (Shield) : 10 PO | CA: +2 | Bouclier | Pas de malus | 3 kgD. Catalogue des Langues Officielles (Language)Langues Standards : Commun (Script: Commun), Nain (Nain), Elfique (Elfique), Géant (Nain), Gnome (Nain), Gobelin (Nain), Halfelin (Commun), Orc (Nain).Langues Exotiques : Abyssien (Infernal), Céleste (Céleste), Draconique (Draconique), Profond / Undercommon (Elfique), Infernal (Infernal), Primordial (Nain), Sylvain (Elfique), Télépathie (Aucun).E. Grille de Référence CR (Challenge Rating 0 à 30 pour le Monster Builder)Table mathématique d'équilibrage officiel intégrée dans src/modules/monsters/engine/cr-scaling.ts :CR 0 : Bonus Maîtrise: +2 | CA: 10-13 | PV: 1-6 | Bonus Attaque: +3 | Dégâts/Round: 0-1 | DD Sauvegarde: 10CR 1/4 : +2 | CA: 13 | PV: 36-49 | Attaque: +3 | Dégâts: 4-5 | DD: 11CR 1/2 : +2 | CA: 13 | PV: 50-70 | Attaque: +3 | Dégâts: 6-8 | DD: 12CR 1 : +2 | CA: 13 | PV: 71-85 | Attaque: +3 | Dégâts: 9-14 | DD: 12CR 2 : +2 | CA: 13 | PV: 86-100 | Attaque: +3 | Dégâts: 15-20 | DD: 13CR 3 : +2 | CA: 13 | PV: 101-115 | Attaque: +4 | Dégâts: 21-26 | DD: 13CR 4 : +2 | CA: 14 | PV: 116-130 | Attaque: +5 | Dégâts: 27-32 | DD: 14CR 5 : +3 | CA: 15 | PV: 131-145 | Attaque: +6 | Dégâts: 33-38 | DD: 15CR 8 : +3 | CA: 16 | PV: 176-190 | Attaque: +7 | Dégâts: 51-56 | DD: 16CR 10 : +4 | CA: 17 | PV: 206-220 | Attaque: +7 | Dégâts: 63-68 | DD: 16CR 15 : +5 | CA: 18 | PV: 281-295 | Attaque: +8 | Dégâts: 93-98 | DD: 18CR 20 : +6 | CA: 19 | PV: 356-400 | Attaque: +10 | Dégâts: 140-150 | DD: 19CR 25 : +8 | CA: 19 | PV: 586-640 | Attaque: +12 | Dégâts: 215-230 | DD: 21CR 30 : +9 | CA: 19 | PV: 801-850 | Attaque: +14 | Dégâts: 300-320 | DD: 233. Rigueur Stricte & Déterminisme du Character Wizard (CharacterWizard.tsx)Étape Identité : Validation bloquante sur le champ Nom (interdiction des chaînes vides ou d'espaces).Étape Espèce & Langues :Volet descriptif avec caractéristiques de l'espèce, vitesse, vision et traits raciaux intégraux.Sélection obligatoire de la langue bonus imposée par l'espèce ou l'historique parmi la table Language.Étape Historique 2024 :Répartition des bonus de caractéristiques (+2/+1 ou +1/+1/+1) verrouillée strictement sur les 3 attributs éligibles.Injection automatique du don d'origine lié avec tooltip descriptive complète au survol.Étape Classe & Progression :Sous-classe masquée ou désactivée au niveau 1 avec le libellé clair : "Déblocage au Niveau 3".Allocation automatique des ressources de classe (ex: Barbare = 2 rages ; Guerrier = 2 Second Souffle).Étape Maîtrise d'Armes 2024 (Classes Martiales) :Pour Guerrier (3 armes au niveau 1), Barbare (2), Paladin/Rôdeur (2), Roublard (2) : affichage du sélecteur d'armes compatibles avec leur effet de maîtrise (Vex, Nick, Topple, etc.).Quota strict et bloquant.Étape Compétences :Compétences alimentées par SkillDefinition.Tooltips complets au survol (description officielle + exemples).Les compétences de l'historique sont pré-cochées et verrouillées.Quota de compétences de classe strictement plafonné.Étape Grimoire & Sorts de Départ :Quotas stricts (Magicien = 3 cantrips + 6 sorts niv 1 ; Clerc/Druide = 3 cantrips + SAG mod + 1 sorts préparés ; Barde = 2 cantrips + 4 connus ; Ensorceleur/Occultiste = quotas niveau 1).Cartouche de sort complet style livre officiel (École, Temps, Portée, Composantes, Concentration, Description).Équipement de départ :Sélection du pack de classe ou attribution de la bourse d'or.Calcul immédiat et immuable de la CA selon l'armure et le bouclier équipés.