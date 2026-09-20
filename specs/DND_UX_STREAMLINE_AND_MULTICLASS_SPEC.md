# Spécification Technique : UX Immersive, Multiclassage 5.5 & Rigueur "Stupid-Proof"

## 1. Infobulles / Hover Universel (Compendium Tooltips)
- **Composant réutilisable** : `CompendiumTooltip` (ou composant Radix / Floating UI / Tailwind).
- **Comportement** : 
  - Tout don, sort, objet, compétence ou trait affiché dans l'interface (Wizard, Level Up, Feuille de perso, Liste) déclenche au survol (`hover` sur desktop, `tap/clic` sur mobile) une carte contextuelle élégante.
  - La carte affiche : Nom, Type/École/Rareté, Prérequis éventuels, Temps d'incantation/Portée/Composantes (pour sorts), et la Description textuelle intégrale formatée.

## 2. Rétablissement de l'État & Nettoyage Réactif dans le Wizard
- **Problème de persistance des compétences** :
  - Lors du changement de classe ou d'historique en revenant en arrière dans le Wizard, les compétences précédemment sélectionnées doivent être **automatiquement réinitialisées** pour la source modifiée.
  - Le quota de compétences autorisées doit se recalculer dynamiquement.
- **Descriptions complètes à la sélection** :
  - La sélection d'une Espèce (Race), Sous-espèce, Historique ou Classe affiche immédiatement dans un panneau latéral ou un tiroir dédié sa description narrative officielle complète, ses traits raciaux détaillés, sa vitesse, vision dans le noir, et aptitudes innées.
- **Sélection des Sorts à la Création (Niveau 1)** :
  - Étape dédiée conditionnelle pour les classes disposant de magie au niveau 1 (Barde, Clerc, Druide, Ensorceleur, Magicien, Occultiste).
  - Affichage et filtrage stricts :
    - Tours de magie (Cantrips) selon le nombre exact octroyé par la classe.
    - Sorts de niveau 1 selon la formule de classe (ex: Magicien = 6 dans le grimoire / préparation selon INT + 1 ; Clerc/Druide = préparation selon SAG + 1 ; Barde/Ensorceleur/Occultiste = sorts connus stricts).
    - Infobulle détaillée au survol de chaque sort éligible.

## 3. Révision Stricte de la Montée de Niveau (Level Up 5.5)
Rendre le Level Up 100% "Stupid-Proof" :

### A. Affichage Conditionnel Strict des Paliers (Zero Bruit Visuel)
- **Règle absolue** : Si une option n'est pas accordée par le niveau atteint, **son interface ne doit pas apparaître** (pas simplement désactivée, mais totalement masquée).
- **Augmentation de Caractéristiques (ASI) / Don** :
  - Ne s'affiche **JAMAIS** au niveau 2 ou 3.
  - S'affiche **UNIQUEMENT** aux niveaux prévus par la classe (Guerrier : 4, 6, 8, 12, 14, 16, 19 ; Roublard : 4, 8, 10, 12, 16, 19 ; Autres : 4, 8, 12, 16, 19).
  - Choix mutuellement exclusif :
    - **Option A : Amélioration de caractéristiques** : Deux sélecteurs stricts (soit +2 sur une caractéristique, soit +1 sur deux caractéristiques distinctes). Plafond strict à 20.
    - **Option B : Choix d'un Don** : Liste déroulante des dons éligibles (avec vérification des prérequis de niveau et d'attribut) et infobulle/description complète au survol et à la sélection.
- **Choix de Sous-classe** :
  - N'apparaît **qu'au niveau 3**. Masqué avant et après.

### B. Prise en Charge du Multiclassage (D&D 5.5 / 5e)
- Lors du passage de niveau, l'utilisateur a le choix entre :
  1. Continuer dans sa classe existante (ex: Guerrier 1 -> Guerrier 2).
  2. Prendre un niveau dans une nouvelle classe (ex: Guerrier 1 / Magicien 1).
- **Vérifications de Prérequis Officiels de Multiclassage** :
  - Doit satisfaire le score minimal de 13 dans la caractéristique requise de la classe actuelle ET de la nouvelle classe :
    - Barbare : FOR 13
    - Barde, Ensorceleur, Occultiste : CHA 13
    - Clerc, Druide : SAG 13
    - Guerrier : FOR 13 ou DEX 13
    - Moine : DEX 13 et SAG 13
    - Paladin : FOR 13 et CHA 13
    - Rôdeur : DEX 13 et SAG 13
    - Roublard : DEX 13
    - Magicien : INT 13
  - Si les prérequis ne sont pas remplis, la classe apparaît grisée avec la mention explicite de la condition manquante.