# Spécification Technique : Moteur D&D 5.5 / 5e, Compendium Exhaustif & UI Thématique

## 1. Modèle de Données & Compendium en Base (PostgreSQL / Prisma)
Toutes les entités de règles doivent exister en BDD afin d'être modulaires, scalables et extensibles sans toucher au code :

* **Species (Races) & Subspecies** : Vitesse de base, taille (Medium/Small), traits innés, sorts innés, vision dans le noir.
* **Backgrounds (Historiques 2024)** : 
  * 3 choix d'attributs préconisés (+2/+1 ou +1/+1/+1).
  * Don d'origine accordé (Origin Feat).
  * 2 maîtrises de compétences associées.
  * Maîtrise d'outils et équipement de départ.
* **Classes & Subclasses** :
  * Dé de vie (d6, d8, d10, d12).
  * Sauvegardes maîtrisées.
  * Choix de compétences de classe (quantité et liste éligible).
  * Profil magique (Caractéristique d'incantation, progression des emplacements : Full, Half, Third, Pact).
  * Multiplicateur / table de progression des aptitudes (`ClassLevelFeature`).
* **Spells, Feats, Items & Weapons Mastery** : Tables dédiées pour l'ensemble du compendium officiel avec critères de recherche et propriétés (Maîtrises d'armes 2024 : Nick, Push, Topple, etc.).

## 2. Moteur de Calcul Automatique des Statistiques (Pure TypeScript Engine)
Fichier isolé dans `src/modules/characters/engine/dnd-rules-engine.ts` pour garantir la scalabilité et la testabilité unitaire :

* **Calcul des Scores & Modificateurs** : `Modifier = Math.floor((Score - 10) / 2)`.
* **Bonus de Maîtrise (PB)** : Calculé selon le niveau global (`Math.ceil(Level / 4) + 1`).
* **Jets de Sauvegarde & Compétences** :
  * `Bonus = Modificateur d'attribut + (estMaîtrisé ? PB : 0) + (estExpertise ? PB * 2 : 0)`.
* **Classe d'Armure (CA) Dynamique** :
  * Sans armure : 10 + Dex (ou Barbalgorithme : 10 + Dex + Con, Moine : 10 + Dex + Sag).
  * Avec armure / bouclier : application stricte des plafonds de Dextérité (Armure lourde = pas de Dex, Moyenne = max +2, Légère = pleine Dex).
* **Points de Vie (PV)** :
  * Niveau 1 : PV max du dé de vie + Modificateur de Constitution (+ bonus d'espèces comme Nain des collines).
  * Niveaux suivants : moyenne officielle arrondie au supérieur ou tirage + Modificateur de Constitution.
* **Magie & Grimoire** :
  * DD de sauvegarde = `8 + PB + Modificateur d'incantation`.
  * Modificateur d'attaque des sorts = `PB + Modificateur d'incantation`.
  * Calcul automatique des emplacements de sorts débloqués selon la grille de classe.

## 3. Thèmes Visuels Dynamiques (Dark, Light & Thèmes par Classe)
Mise en place d'un système de variables CSS / tokens Tailwind dans `src/styles/dnd-themes.ts` :

* **Mode Clair (Light)** : Parchemin texturé façon feuille de personnage officielle imprimée (`#f5efe6`, encres brunes `#2b1d0c`).
* **Mode Sombre (Dark)** : Ardoise d'ébène et accents de runes dorées.
* **13 Thèmes de Couleurs par Classe** :
  * Barbare : Rouge écarlate / Rage (#b91c1c)
  * Barde : Mauve inspirant / Or (#9333ea)
  * Clerc : Or solaire / Blanc sacré (#eab308)
  * Druide : Vert forêt sauvage (#15803d)
  * Guerrier : Acier trempé / Bronze (#71717a)
  * Moine : Bleu ciel méditatif / Jade (#0ea5e9)
  * Paladin : Or radiant / Bleu héraldique (#f59e0b)
  * Rôdeur : Vert sauge / Terre de Sienne (#166534)
  * Roublard : Noir ombre / Pourpre nocturne (#3f3f46)
  * Ensorceleur : Écarlate chaotique / Améthyste (#ec4899)
  * Occultiste : Pourpre d'Eldritch / Vert peste (#6b21a8)
  * Magicien : Bleu nuit arcanique / Saphir (#1d4ed8)
  * Artificier : Cuivre martelé / Laiton (#ca8a04)

## 4. Assistant de Création Pas-à-Pas (Interactive Wizard)
Interface guidée étape par étape avec calculs réactifs en temps réel :
1. **Étape 1 : Identité & Espèce** (Sélection visuelle avec bonus de vitesse et vision).
2. **Étape 2 : Historique 2024** (Attribution guidée des +2/+1 ou +1/+1/+1, don d'origine sélectionné automatiquement).
3. **Étape 3 : Classe & Sous-classe** (Sélection visuelle appliquant immédiatement le thème de couleur de la classe choisie).
4. **Étape 4 : Caractéristiques** (Calculateur interactif Point Buy 27 pts avec compteur restant, Standard Array avec verrouillage des valeurs utilisées, ou Tirage manuel avec validation).
5. **Étape 5 : Compétences & Équipement** (Sélection des compétences autorisées avec pré-sélection de celles accordées par l'historique).
6. **Étape 6 : Sorts & Validation** (Sélection des tours de magie et sorts de niveau 1 selon les emplacements disponibles).