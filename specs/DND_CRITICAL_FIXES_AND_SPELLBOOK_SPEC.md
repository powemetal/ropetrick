# Spécification Technique : Correctifs Critiques UI, Stabilité React, Grimoire & Compendium

## 1. Résolution des Bugs Bloquants Runtime

### A. Boucle Infinie React (`CharacterWizard.tsx`)
- **Cause** : `availableSkills` est une référence de tableau instanciée à la volée dans le composant. Le hook `useEffect` dépendant de `[availableSkills, skillQuota]` s'exécute à chaque render.
- **Correctif** :
  - Encapsuler `availableSkills` dans un `useMemo(() => ..., [selectedClassId, selectedBackgroundId])`.
  - Comparer l'égalité superficielle ou utiliser un callback fonctionnel sans redéclencher d'état si les compétences n'ont pas changé.

### B. Exception de Redirection (`NEXT_REDIRECT`)
- **Cause** : La fonction `redirect()` de `next/navigation` lève intentionnellement une erreur spéciale. Elle est capturée par un `catch (e)` générique dans la Server Action ou le gestionnaire du Wizard, traitée à tort comme une erreur serveur 500.
- **Correctif** :
  - Dans tout `try/catch` englobant `redirect()`, ajouter :
    ```typescript
    if (isRedirectError(error)) throw error;
    ```
    (importé depuis `next/dist/client/components/redirect-error` ou laisser `redirect()` s'exécuter hors du bloc try/catch).

### C. Validation Zod du Calendrier (`ScheduleRuleCreateSchema`)
- **Cause** : Le champ d'heure renvoie parfois `HH:MM:SS` ou une chaîne brute rejetée par `/^([01]\d|2[0-3]):[0-5]\d$/`.
- **Correctif** :
  - Normaliser la valeur avant validation dans `ScheduleRuleCreateSchema` via `.transform((v) => v.slice(0, 5))` ou autoriser l'expression `/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/`.

### D. Clic sur Combobox / Menus Déroulants
- **Cause** : Conflit d'événements `pointer-down` / `click` ou composant Select non contrôlé avec `value` non synchronisée.
- **Correctif** :
  - Assurer la gestion contrôlée (`value` et `onValueChange`), empêcher `event.preventDefault()` indésirable sur les items cliqués.

---

## 2. Rigueur 5.5 du Wizard de Personnage

### A. Blocage sur l'Identité
- **Nom obligatoire** : Le bouton "Étape suivante" de l'étape 1 est strictement désactivé tant que le champ Nom est vide ou composé uniquement d'espaces.

### B. Verrouillage des Sous-classes au Niveau 1
- **Règle 2024 stricte** : Aucune classe ne choisit sa sous-classe au niveau 1.
- La section sous-classe doit être **totalement masquée ou explicitement grisée avec la mention "Déblocage au Niveau 3"**.

### C. Étape Obligatoire : Grimoire & Sorts de Niveau 1
- Pour les classes disposant de magie au niveau 1 (Magicien, Clerc, Druide, Barde, Ensorceleur, Occultiste) :
  - **Magicien** : Sélection exacte de 3 tours de magie (Cantrips) et de 6 sorts de niveau 1 pour son grimoire de départ.
  - **Clerc / Druide** : Sélection de 3 Cantrips et préparation de sorts de niveau 1 selon la formule (`SAG mod + 1`, minimum 1).
  - **Barde / Ensorceleur / Occultiste** : Sélection exacte des Cantrips et sorts connus autorisés par leur table respective au niveau 1.
- Impossible de finaliser le personnage sans avoir alloué l'intégralité de son quota de sorts.

---

## 3. Direction Artistique & Fiches Descriptives Complètes

### A. Hover Universel / Infobulles Compendium (Tooltips)
- Tout Don, Aptitude, Compétence ou Sort dispose d'un survol (`hover` instantané sans délai avec `z-index: 9999`) affichant son contenu officiel exhaustif.

### B. Fiche Formatée Officielle pour les Sorts
- Présentation reprenant la mise en page fidèle du manuel :
  - En-tête : Nom du sort, Niveau et École de magie (ex: *Évocation de niveau 1*), tag Rituel si applicable.
  - Métadonnées : Temps d'incantation, Portée, Composantes (V, S, M avec mention du coût éventuel), Durée & Concentration.
  - Corps : Description intégrale du sort.
  - Section "Aux niveaux supérieurs" clairement démarquée.

### C. Descriptions Complètes des Compétences
- Remplacer les résumés par les descriptions officielles exhaustives (Athlétisme, Arcanes, Histoire, Religion, Intuition, etc.) précisant les cas d'usage types pour le joueur.

### D. Extension Massive du Compendium (Sorts & Sous-classes)
- Enrichir le seed avec la totalité des sous-classes de l'édition 5.5, du PHB 2014, de Xanathar et de Tasha.
- Injecter la liste exhaustive des sorts de niveau 0 à 9 pour chaque classe.