# Spécification d'Implémentation : Moteur Stupid-Proof D&D 5.5 / 5e, Compendium Exhaustif, Thèmes Globaux & Direction Artistique Officielle

## 1. Moteur de Progression & Règles de Niveaux "Stupid-Proof"
L'objectif est d'empêcher toute incohérence mécanique lors de la création ou de la montée en niveau.

### A. Grille de Progression Stricte par Classe (`src/modules/characters/engine/class-progression-rules.ts`)
* **Paliers d'Amélioration de Caractéristiques / Don (ASI / Feat)** :
  * Classes Standard (10 classes : Barde, Clerc, Druide, Moine, Paladin, Rôdeur, Ensorceleur, Occultiste, Magicien, Artificier) : Niveaux 4, 8, 12, 16 et 19.
  * Guerrier (Fighter) : Niveaux 4, 6, 8, 12, 14, 16 et 19.
  * Roublard (Rogue) : Niveaux 4, 8, 10, 12, 16 et 19.
  * Interdiction stricte de modifier les scores de caractéristiques ou de choisir un don en dehors de ces paliers lors d'une montée de niveau.
* **Sous-classes (Subclasses)** :
  * Déblocage obligatoire et unique au niveau 3 pour l'ensemble des classes (règle harmonisée D&D 2024).
* **Validation Bloquante** :
  * La modale de passage de niveau bloque la sauvegarde tant que :
    1. Le choix des PV n'est pas effectué (valeur moyenne fixe officielle ou tirage de dé).
    2. La sous-classe n'est pas sélectionnée (au niveau 3).
    3. L'ASI (+2, +1/+1) ou le don n'est pas formellement choisi si le niveau correspond à un palier officiel.
    4. Les sorts préparés/connus obligatoires ne sont pas renseignés.

## 2. Compendium Étendu (Base de Données PostgreSQL)
Alimentation exhaustive du seed (`prisma/seed-compendium.ts`) pour couvrir l'édition 2024, les suppléments majeurs (Tasha, Xanathar, Monsters of the Multiverse) et les ajouts *Unearthed Arcana* :

* **Espèces (Species & Lineages)** :
  * Humain (Standard et Variante avec don d'origine supplémentaire).
  * Aasimar (Lignées Céleste, Radieuse, Nécrotique).
  * Dragonborn (Chromatique, Métallique, Gemme).
  * Elfe (Haut-Elfe, Elfe des Bois, Drow).
  * Gnome (des Forêts, des Roches).
  * Goliath (6 ascendances élémentaires de géants : Nuages, Collines, Feu, Givre, Pierre, Tempête).
  * Halfelin (Pied-léger, Robuste).
  * Nain (des Collines, des Montagnes).
  * Orc (avec Adrénaline et Endurance implacable).
  * Tieffelin (Abyssal, Chthonique, Infernal).
  * Githyanki & Githzerai.
* **Historiques 2024 (Backgrounds)** :
  * Intégration des historiques officiels : Acolyte, Artisan, Criminel, Guide, Soldat, Érudit, Noble, Charlatan, Fermier, Garde, Marchand, Pèlerin.
  * Règle D&D 2024 stricte : chaque historique impose la sélection des bonus (+2/+1 ou +1/+1/+1) uniquement parmi les 3 caractéristiques désignées.
  * Assignation automatique du don d'origine lié (Alert, Crafter, Lucky, Magic Initiate, Savage Attacker, Skilled, Tough, etc.).

## 3. Système de Thèmes Visuels Globaux (Application-Wide)
Découplage complet de la sélection de classe : les thèmes s'appliquent à l'ensemble du site.

* **Architecture** :
  * Fournisseur React `ThemeProvider` dans `src/styles/theme-provider.tsx` enveloppant `layout.tsx`.
  * Persistance du thème sélectionné dans `localStorage`.
* **Palettes Globales Disponibles** :
  * `light-parchment` : Mode clair officiel avec fond parchemin texturé (`#f4ede2`), bordures sépia et typographies d'encre sombre.
  * `dark-dungeon` : Mode sombre ardoise et runes métalliques.
  * 13 Thèmes Globaux inspirés des classes de D&D (teintant la barre de navigation, les cartes, les boutons et les bordures de toute l'application) :
    * Barbare (Écarlate), Barde (Pourpre or), Clerc (Or radiant), Druide (Vert sauvage), Guerrier (Acier), Moine (Bleu céleste), Paladin (Or héraldique), Rôdeur (Sauge), Roublard (Ombre nocturne), Ensorceleur (Chaos rose), Occultiste (Violet Eldritch), Magicien (Bleu saphir), Artificier (Cuivre).
* **Composant UI** : Sélecteur de thème déroulant présent dans la barre de navigation supérieure (`Navbar.tsx`).

## 4. Direction Artistique & Typographie Officielle D&D
Remplacement des polices génériques par les équivalents typographiques des livres officiels :

* **Polices Google Fonts (`src/app/layout.tsx`)** :
  * Titres et En-têtes : `Cinzel Decorative` ou `MedievalSharp` (substitut à Modesto).
  * Sous-titres, badges, étiquettes de modificateurs : `Cinzel`.
  * Descriptions narratives et corps de texte : `Crimson Pro` ou `Alegreya` (substitut à Bookmania).
* **Imagerie & Habillage** :
  * Utilisation d'icônes vectorielles et d'illustrations d'en-tête pour chaque classe et espèce.
  * Bordures ornementales façon feuille d'aventure officielle sur les conteneurs de fiches et cartes.