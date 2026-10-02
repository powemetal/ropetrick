# Documentation du Système d'Importation des Données (Seed)

Ce document décrit le fonctionnement du pipeline d'importation des données du Compendium D&D. Le script charge l'ensemble des données de référence (livres sources, classes, équipements, sorts, etc.) depuis des fichiers JSON locaux et les injecte dans la base de données PostgreSQL via l'ORM Prisma.

---

## 1. Architecture et Organisation

Le dossier de seed est modularisé par domaine fonctionnel sous `prisma/seeds/` afin de faciliter la maintenance et d'isoler la logique de chaque entité.

```text
prisma/
├── data/                  # Fichiers sources JSON (règles, livres, équipements...)
└── seeds/                 # Modules de seed par domaine
    ├── helpers.ts         # Fonctions utilitaires (slugify, mappages, client Prisma)
    ├── sourceBooks.ts     # Importation des livres sources (PHB, XPHB, etc.)
    ├── weaponMasteries.ts # Propriétés de maîtrise d'armes
    ├── languages.ts       # Langues parlées
    ├── skills.ts          # Compétences et caractéristiques associées
    ├── optionalFeatures.ts# Options modulaires (Invocations, Metamagic...)
    ├── feats.ts           # Dons (génère une map d'IDs pour les liaisons)
    ├── species.ts         # Races et espèces
    ├── backgrounds.ts     # Historiques (liés aux dons d'origine)
    ├── equipment.ts       # Équipements de base (armes, armures, objets)
    ├── classes.ts         # Classes et sous-classes (avec liaison hiérarchique)
    ├── deities.ts         # Divinités et panthéons
    ├── items.ts           # Importation avancée des équipements via CSV et parsing intelligent
    └── magicVariants.ts   # Variantes d'objets magiques
```

---

## 2. Fonctionnement du Pipeline (`prisma/seed.ts`)

Pour garantir des performances optimales et s'affranchir des contraintes d'unicité, le script principal exécute deux étapes majeures :

1. **Vidage global de la base (`clearDatabase`)** : 
   - Supprime l'ensemble des données en respectant l'ordre inverse des dépendances relationnelles (les tables enfants d'abord, les tables parentes ensuite) pour éviter les erreurs de clés étrangères.
2. 2. **Réinsertion en masse (`createMany`)** : 
   - Exécute chaque module de seed de manière séquentielle en utilisant les insertions groupées `createMany` de Prisma (par paquets de 100 éléments pour les équipements).

---

## 3. Guide d'Utilisation

### Prérequis
Assure-toi que ta base de données est accessible et que ton schéma Prisma est à jour :
```bash
npx prisma db push
npx prisma generate
```

### Exécution du Seed
Lance la commande suivante pour exécuter le script d'importation complet :
```bash
npx tsx prisma/seed.ts
```

---

## 4. Choix Techniques et Bonnes Pratiques

* **Optimisation des performances (`createMany`)** : 
  L'utilisation des boucles d'insertion unitaire (`upsert` / `create` dans des boucles `for...of`) a été entièrement remplacée par une approche en mémoire (tableaux `data` accumulés) suivie d'une requête groupée `createMany` par module.
* **Gestion des relations inter-entités** : 
  Certains modules dépendent des IDs générés par d'autres (par exemple, les *Dons* retournent une `Map` pour permettre aux *Historiques* de lier leur `originFeatId`, ou les *Classes* fournissent leurs IDs pour rattacher les *Sous-classes*).
* **Flexibilité des types JSON** : 
  Les structures complexes ou changeantes (comme les propriétés d'équipement ou les descriptions riches) sont stockées dans des colonnes de type `Json` pour éviter les erreurs de validation de schéma lors de l'import de données brutes.
* **Parsing intelligent par Expressions Régulières (Regex)** : 
  Pour le catalogue d'équipements (`items.ts`), un parseur avancé analyse les chaînes textuelles brutes du fichier CSV pour en extraire automatiquement les formules de dégâts, les types de dégâts, la détection des objets magiques, les bonus numériques (`+1`, `+2`), l'attunement et les propriétés converties directement en tableaux JSON.

---

# Guide de Structure des Fichiers JSON (Données Source)

Ce document décrit le format et les champs attendus dans chaque fichier JSON placé dans le dossier prisma/data_personnal/ pour que le système d'importation (seed) puisse les traiter correctement.

---

## 1. books.json (Livres Sources)
Définit les ouvrages officiels ou tiers de référence.

```json
{
  "book": [
    {
      "id": "XPHB",
      "name": "Player's Handbook (2024)"
    }
  ]
}
```

* **id** (String) : Code unique du livre (ex: PHB, XPHB, XDMG). Converti automatiquement en majuscules.
* **name** (String) : Titre complet du livre.

---

## 2. languages.json (Langues)
Liste les langues parlées et leurs caractéristiques.

```json
{
  "language": [
    {
      "name": "Common",
      "script": "Common",
      "type": "standard"
    }
  ]
}
```

* **name** (String) : Nom de la langue.
* **script** (String) : Alphabet utilisé (ex: Common, Elvish). Par défaut "Common" si absent.
* **type** (String) : Catégorie de la langue ("standard", "exotic", "rare", "secret"). Détermine si elle est classée comme exotique.

---

## 3. Items.csv (Catalogue d'Équipements et Objets)
Fichier au format CSV contenant le catalogue complet des objets (armes, armures, objets magiques, etc.) traité par le module `items.ts` à l'aide de parseurs Regex avancés.

**Colonnes clés du CSV et correspondance en base :**
* `Name` : Nom de l'objet (permet d'extraire la magie et le bonus via regex, ex: `+2 Longsword`).
* `Source` : Code du livre source de référence (synchronisé avec `SourceBook`).
* `Page` : Numéro de page dans l'ouvrage.
* `Rarity` : Niveau de rareté textuel converti vers l'Enum Prisma `ItemRarity`.
* `Type` : Catégorie ou type textuel brut de l'objet.
* `Attunement` : Condition d'harmonisation (converti en booléen `requiresAttunement`).
* `Damage` : Formule et type de dégâts bruts (analysé par regex pour alimenter `damageFormula` et `damageType`).
* `Properties` : Liste des propriétés de l'objet (converties et stockées sous forme de tableau `Json`).
* `Mastery` : Propriété de maîtrise d'arme associée (`weaponMastery`).
* `Weight` : Poids numérique de l'objet en livres (`weightLb`).
* `Value` : Valeur financière convertie en pièces d'or (`costGp`).
* `Text` : Description détaillée de l'objet (`description` au format texte long).

---

## 4. races.json (Races / Espèces)
Définit les espèces jouables.

```json
{
  "race": [
    {
      "name": "Human",
      "source": "XPHB",
      "speed": 30,
      "size": ["M"],
      "darkvision": 0,
      "entries": ["Versatile and ambitious."]
    }
  ]
}
```

* **name** (String) : Nom de l'espèce.
* **speed** (Number ou Object) : Vitesse de déplacement (nombre ou objet { walk: 30 }).
* **size** (Array) : Tableau des tailles (ex: ["M"] pour Medium, ["S"] pour Small).
* **darkvision** (Number) : Portée de la vision dans le noir en pieds (optionnel).
* **entries** (Array) : Traits raciaux et description.

---

## 5. Fichiers class-*.json (Classes et Sous-classes)
Chaque fichier commençant par class- gère une ou plusieurs classes et leurs sous-classes associées.

```json
{
  "class": [
    {
      "name": "Fighter",
      "source": "XPHB",
      "hd": { "faces": 10 },
      "proficiency": ["strength", "constitution"],
      "casterProgression": "none",
      "entries": ["A master of martial combat."]
    }
  ],
  "subclass": [
    {
      "name": "Champion",
      "source": "XPHB",
      "className": "Fighter",
      "classSource": "XPHB",
      "entries": ["The Champion focuses on the development of raw physical power."]
    }
  ]
}
```

* **class** (Array) : 
  * `hd` : Dé de vie (nombre de faces, ex: 10 ou objet { faces: 10 }).
  * `proficiency` : Sauvegardes maîtrisées.
  * `casterProgression` : Progression de sort ("full", "half", "third", "pact", "none").
* **subclass** (Array) : 
  * `className` (String) : Nom de la classe parente obligatoire pour faire la liaison.

---

## 6. feats.json (Dons)
Définit les dons accessibles aux personnages.

```json
{
  "feat": [
    {
      "name": "Alert",
      "source": "XPHB",
      "category": "General",
      "prerequisite": [{ "level": 4 }],
      "repeatable": false,
      "entries": ["Always on the lookout."]
    }
  ]
}
```

* **category** (String) : Catégorie du don (ex: Origin, General, Epic Boon).
* **prerequisite** (Array) : Conditions d'obtention (niveau requis, dons préalables, etc.).

---

## 7. backgrounds.json (Historiques)
Définit les historiques de personnages et leurs liens avec les dons.

```json
{
  "background": [
    {
      "name": "Acolyte",
      "source": "XPHB",
      "skillProficiencies": [{ "insight": true, "religion": true }],
      "toolProficiencies": [{ "calligrapher": true }],
      "feats": [{ "Magic Initiate|XPHB": true }],
      "entries": ["You have spent your life in service to a temple."]
    }
  ]
}
```

* **skillProficiencies / toolProficiencies** (Array) : Compétences et outils maîtrisés.
* **feats** (Array) : Dons d'origine associés (utilisé pour lier automatiquement le originFeatId).

---

## 8. deities.json (Divinités)
Répertorie les dieux et panthéons.

```json
{
  "deity": [
    {
      "name": "Bahamut",
      "pantheon": "Dragon",
      "source": "XPHB",
      "alignment": ["L", "G"],
      "domains": ["Life", "War"],
      "symbol": "A dragon's head in profile"
    }
  ]
}
```

* **pantheon** (String) : Nom du panthéon (ex: Forgotten Realms, Greek).
* **alignment** (Array) : Alignement abrégé (ex: ["L", "G"] pour Loyal Bon).
* **domains** (Array) : Domaines divins associés.

---

## 9. magicvariants.json (Variantes d'Objets Magiques)
Modèles ou suffixes pour générer des objets magiques.

```json
{
  "magicvariant": [
    {
      "name": "Weapon +1",
      "type": "M",
      "inherits": {
        "source": "XDMG",
        "rarity": "uncommon",
        "entries": ["You have a +1 bonus to attack and damage rolls made with this weapon."]
      }
    }
  ]
}
```

---

## 10. optionalfeatures.json (Options Modulaires)
Invocations occultes, options de métamagie, styles de combat, etc.

```json
{
  "optionalfeature": [
    {
      "name": "Agonizing Blast",
      "source": "XPHB",
      "featureType": ["EI"],
      "entries": ["When you cast Eldritch Blast, add your Charisma modifier to damage."]
    }
  ]
}
```

* **featureType** (Array) : Codes identifiant le type d'option (ex: EI pour Eldritch Invocations, MM pour Metamagic).

---

## 11. skills.json (Compétences)
Définitions de base des compétences de règles.

```json
{
  "skill": [
    {
      "name": "Acrobatics",
      "ability": "dex",
      "source": "XPHB",
      "entries": ["Your Dexterity (Acrobatics) check covers your attempt to stay on your feet."]
    }
  ]
}
```

* **ability** (String) : Caractéristique associée en abrégé ("str", "dex", "