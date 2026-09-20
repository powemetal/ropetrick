# Registre Complémentaire Exhaustif : Dons Multi-Livres (D&D 5e, 5.5 & Unleashed Arcana)

Ce registre rassemble l'ensemble des dons officiels et suppléments avancés venant compléter le compendium principal. Chaque entrée suit une structure stricte pour permettre une ingestion directe via script de seed dans la table `Feat` rattachée à la table `SourceBook`.

---

## 1. Livres Sources Référencés (SourceBooks)

* `ULA_2026` : Unleashed Arcana (Supplément officiel, Septembre 2026)
* `PHB_2024` : Player's Handbook (Révision 2024 / D&D 5.5)
* `PHB_2014` : Player's Handbook (Édition 2014 / 5e)
* `SCAG` : Sword Coast Adventurer's Guide
* `ERLW` : Eberron: Rising from the Last War
* `MoT` : Mythic Odysseys of Theros
* `BGG` : Bigby Presents: Glory of the Giants
* `DSotDQ` : Dragonlance: Shadow of the Dragon Queen
* `BoMT` : The Book of Many Things
* `PS_A` : Plane Shift: Amonkhet
* `PS_K` : Plane Shift: Kaladesh

---

## 2. Dons de Style de Combat (Fighting Style Feats — PHB_2024)

Dans l'édition 2024, les styles de combat constituent des dons formels de niveau 1 conditionnés par l'aptitude de classe *Fighting Style* :

* **Archery** (`PHB_2024`) | Niveau 1 | FIGHTING_STYLE | Aptitude Style de Combat. Bonus de +2 aux jets d'attaque effectués avec une arme à distance.
* **Blind Fighting** (`PHB_2024`) | Niveau 1 | FIGHTING_STYLE | Aptitude Style de Combat. Confère une vision aveugle (Blindsight) sur un rayon de 3 mètres (10 ft).
* **Defense** (`PHB_2024`) | Niveau 1 | FIGHTING_STYLE | Aptitude Style de Combat. Bonus de +1 à la Classe d'Armure tant que vous portez une armure.
* **Dueling** (`PHB_2024`) | Niveau 1 | FIGHTING_STYLE | Aptitude Style de Combat. Bonus de +2 aux jets de dégâts lorsque vous maniez une arme de corps-à-corps à une main et aucune autre arme.
* **Great Weapon Fighting** (`PHB_2024`) | Niveau 1 | FIGHTING_STYLE | Aptitude Style de Combat. Lorsque vous obtenez un 1 ou un 2 sur un dé de dégâts d'une arme maniée à deux mains, ce dé inflige automatiquement un minimum de 3 dégâts.
* **Interception** (`PHB_2024`) | Niveau 1 | FIGHTING_STYLE | Aptitude Style de Combat. En réaction lorsqu'une créature visible à 1,5 m de vous subit les dégâts d'une attaque, vous réduisez ces dégâts de 1d10 + votre bonus de maîtrise (nécessite un bouclier ou une arme).
* **Protection** (`PHB_2024`) | Niveau 1 | FIGHTING_STYLE | Aptitude Style de Combat. En réaction lorsqu'une créature attaque une cible autre que vous située à 1,5 m, vous imposez le désavantage sur son jet d'attaque (nécessite un bouclier).
* **Thrown Weapon Fighting** (`PHB_2024`) | Niveau 1 | FIGHTING_STYLE | Aptitude Style de Combat. Vous pouvez dégainer une arme de lancer dans le cadre de l'attaque. Bonus de +2 aux dégâts avec les armes de lancer.
* **Two-Weapon Fighting** (`PHB_2024`) | Niveau 1 | FIGHTING_STYLE | Aptitude Style de Combat. Vous ajoutez votre modificateur de caractéristique aux dégâts de l'attaque supplémentaire effectuée avec la seconde arme.
* **Unarmed Fighting** (`PHB_2024`) | Niveau 1 | FIGHTING_STYLE | Aptitude Style de Combat. Vos frappes à mains nues infligent 1d6 + FOR de dégâts (ou 1d8 + FOR si les deux mains sont libres). Inflige 1d4 dégâts contondants automatiques au début de chaque tour à une créature que vous empoignez.

---

## 3. Dons Raciaux & Régionaux (SCAG & ERLW)

* **Aberrant Dragonmark** (`ERLW`) | Niveau 1 | ORIGIN | Aucun autre don de marque draconique. +1 Constitution (max 20). Vous apprenez un cantrip et un sort de niveau 1 de la liste du Magicien (utilisant CON). Lancement gratuit 1x par repos court ou long. Possibilité de dépenser un dé de vie lors de l'incantation pour gonfler les dégâts ou gagner des PV temporaires.
* **Dragonmark of Detection** (`ERLW`) | Niveau 1 | ORIGIN | Espèce Demi-Elfe. +1 Sagesse ou Intelligence. Ajoute 1d4 aux tests d'Investigation et d'Intuition. Sorts innés de détection ajoutés à la liste de classe du personnage.
* **Dragonmark of Finding** (`ERLW`) | Niveau 1 | ORIGIN | Espèce Humain ou Demi-Orc. +1 Sagesse ou Constitution. Ajoute 1d4 aux tests de Survie et de Perception. Sorts innés de pistage et de localisation.
* **Dragonmark of Handling** (`ERLW`) | Niveau 1 | ORIGIN | Espèce Humain. +1 Sagesse ou Force. Ajoute 1d4 aux tests de Dressage et de Nature. Sorts d'apaisement animal et de communication innés.
* **Dragonmark of Healing** (`ERLW`) | Niveau 1 | ORIGIN | Espèce Halfelin. +1 Sagesse. Ajoute 1d4 aux tests de Médecine. Sorts de soins et de restauration ajoutés à la liste de classe.
* **Dragonmark of Hospitality** (`ERLW`) | Niveau 1 | ORIGIN | Espèce Halfelin. +1 Charisme. Ajoute 1d4 aux tests de Persuasion et aux tests avec les outils de brasseur ou de cuisinier. Sorts d'abri et de subsistance innés.
* **Dragonmark of Making** (`ERLW`) | Niveau 1 | ORIGIN | Espèce Humain. +1 Intelligence. Ajoute 1d4 aux tests avec les outils d'artisan. Sorts de fabrication, de réparation et de façonnage d'objets innés.
* **Dragonmark of Passage** (`ERLW`) | Niveau 1 | ORIGIN | Espèce Humain. +1 Dextérité. Vitesse augmentée de 1,5 mètre. Ajoute 1d4 aux tests d'Acrobaties. Sorts de téléportation et d'accélération innés.
* **Dragonmark of Scribing** (`ERLW`) | Niveau 1 | ORIGIN | Espèce Gnome. +1 Intelligence. Ajoute 1d4 aux tests d'Histoire et aux outils de calligraphe. Sorts de communication scripturale et de messagerie innés.
* **Dragonmark of Sentinel** (`ERLW`) | Niveau 1 | ORIGIN | Espèce Humain. +1 Sagesse ou Constitution. Ajoute 1d4 aux tests d'Intuition et de Perception. Sorts de protection, d'armure et de barrières défensives innés.
* **Dragonmark of Shadow** (`ERLW`) | Niveau 1 | ORIGIN | Espèce Elfe. +1 Dextérité ou Charisme. Ajoute 1d4 aux tests de Discrétion et d'Escamotage. Sorts d'illusion, d'invisibilité et d'obscurité innés.
* **Dragonmark of Storm** (`ERLW`) | Niveau 1 | ORIGIN | Espèce Demi-Elfe. +1 Charisme. Résistance aux dégâts de foudre. Ajoute 1d4 aux tests d'Acrobaties et aux véhicules nautiques. Sorts de tempête et de vents innés.
* **Dragonmark of Warding** (`ERLW`) | Niveau 1 | ORIGIN | Espèce Nain. +1 Intelligence ou Constitution. Ajoute 1d4 aux tests d'Investigation et aux outils de voleur. Sorts de verrous mystiques, de pièges et d'armures runiques innés.
* **Greater Dragonmark** (`ERLW`) | Niveau 8 | GENERAL | Posséder une marque draconique de niveau 1. +1 Caractéristique au choix (max 20). Débloque un sort majeur de niveau 4 ou 5 lié à votre lignée (lancement 1x par repos long sans dépenser d'emplacement).
* **Svirfneblin Magic** (`SCAG`) | Niveau 4 | GENERAL | Espèce Gnome des profondeurs. Vous apprenez *Nondetection* (à volonté sur vous-même sans composante matérielle), ainsi que *Blindness/Deafness*, *Blur* et *Disguise Self* (lancement 1x par repos long chacun).

---

## 4. Dons Surnaturels & Destinée Mythique (Mythic Odysseys of Theros — MoT)

* **Heroic Destiny** (`MoT`) | Niveau 1 | ORIGIN | Aucun prérequis. Lorsque vous tombez à 0 PV sans mourir sur le coup, vous tombez à 1 PV à la place (1x par repos long). Chaque fois que vous réussissez un jet de sauvegarde contre la mort, vous récupérez des PV égaux à votre modificateur de CON + votre niveau.
* **Iconoclast** (`MoT`) | Niveau 1 | ORIGIN | Aucun prérequis. Vous rejetez l'emprise des divinités : vous êtes immunisé contre les sorts de localisation et de détection divine, et pouvez lancer *Protection from Evil and Good* et *Dispel Magic* sans emplacement de sort.
* **Inscrutable** (`MoT`) | Niveau 1 | ORIGIN | Aucun prérequis. Vos pensées et émotions ne peuvent être lues par aucune magie, et les autres créatures ont un désavantage permanent à tous leurs tests d'Intuition menés contre vous.
* **Nyxborn** (`MoT`) | Niveau 1 | ORIGIN | Aucun prérequis. Corps tissé dans la trame céleste : résistance permanente aux dégâts radiants et nécrotiques, et vous apprenez le cantrip *Light*.
* **Unscarred** (`MoT`) | Niveau 1 | ORIGIN | Aucun prérequis. Lorsque vous subissez des dégâts, vous pouvez utiliser votre réaction pour réduire ces dégâts de 1d12 + votre modificateur de Constitution (1x par repos court ou long).

---

## 5. Dons Militaires & Ordres de Haute Sorcellerie (Dragonlance — DSotDQ)

* **Initiate of High Sorcery** (`DSotDQ`) | Niveau 1 | ORIGIN | Aucun prérequis. Choix d'un ordre lunaire (Solinari, Lunitari, Nuitari). Vous apprenez un tour de magie et deux sorts de niveau 1 rattachés à cet ordre, utilisables via vos emplacements ou une fois gratuitement par repos long.
* **Divinely Favored** (`DSotDQ`) | Niveau 4 | GENERAL | Alignement aligné avec votre divinité tutélaire. +1 Caractéristique d'incantation. Vous apprenez *Thaumaturgy*, un sort de clerc de niveau 1 au choix, et le sort *Augury* (lancement 1x par repos long sans composante matérielle).

---

## 6. Dons de la Gloire des Géants (Bigby Presents: Glory of the Giants — BGG)

* **Rune Carver Apprentice** (`BGG`) | Niveau 1 | ORIGIN | Aucun prérequis. Vous apprenez à graver une rune de géant sur une arme, armure ou focalisateur après un repos long. Confère l'accès à un sort de niveau 1 associé à la rune (Feu = *Burning Hands*, Givre = *Armor of Agathys*, Pierre = *Sanctuary*, etc.) sans consommer d'emplacement 1x par repos long.
* **Keenness of the Stone Giant** (`BGG`) | Niveau 4 | GENERAL | Niveau 4+, don *Strike of the Giants*. +1 Force, Constitution ou Sagesse. Vision dans le noir étendue de 18 mètres. En réaction lorsqu'une créature visible à 18 m tente de se cacher ou de se téléporter, vous projetez un éclat tellurique infligeant des dégâts et annulant son action.

---

## 7. Dons du Livre des Nombreuses Choses (The Book of Many Things — BoMT)

* **Cartomancer** (`BoMT`) | Niveau 4 | GENERAL | Capacité à lancer des sorts. Vous utilisez un jeu de cartes comme focalisateur arcanique et apprenez *Prestidigitation*. Après un repos long, vous pouvez imprégner une carte d'un sort que vous connaissez : vous pouvez ensuite lancer ce sort par une simple action bonus dans les 8 heures suivantes.
* **Fate Foretold** (`BoMT`) | Niveau 4 | GENERAL | +1 Intelligence, Sagesse ou Charisme. Vous tirez une carte du destin après chaque repos long vous accordant une réaction : soit ajouter votre bonus de maîtrise à la CA d'un allié attaqué, soit infliger des dégâts psychiques automatiques à l'assaillant.

---

## 8. Dons Dérivés des Plane Shift (PS_A & PS_K)

* **Servant of the God-Pharaoh** (`PS_A`) | Niveau 4 | GENERAL | +1 Sagesse ou Charisme. Avantage aux sauvegardes contre les états Charmé et Effrayé. Vos sorts d'attaque infligent 1d6 dégâts de feu ou nécrotiques supplémentaires contre les ennemis désignés par votre ordre.
* **Quicksmithing** (`PS_K`) | Niveau 4 | GENERAL | +1 Intelligence ou Dextérité. Maîtrise des outils de bricoleur. Vous concevez des modules d'éthérium temporaires améliorant les armes (+1 aux attaques et dégâts) ou les armures (+1 à la CA) pendant 24 heures.

---

## 9. Dons d'Unleashed Arcana (`ULA_2026` — Septembre 2026)

### Dons d'Origine (Niveau 1)
* **Arcane Siphon** (`ULA_2026`) | Niveau 1 | ORIGIN | Aucun prérequis. Permet d'absorber une fraction d'énergie magique lorsqu'un sort hostile vous cible : vous gagnez un nombre de PV temporaires égal au niveau du sort + votre bonus de maîtrise (utilisable un nombre de fois égal à votre bonus de maîtrise par repos long).
* **Leyline Attuned** (`ULA_2026`) | Niveau 1 | ORIGIN | Aucun prérequis. Vous apprenez le sort *Detect Magic* (lancement rituel sans composantes matérielles) et ajoutez votre modificateur de Sagesse ou d'Intelligence aux tests d'initiative dans les zones d'afflux arcanique.
* **Primal Surge** (`ULA_2026`) | Niveau 1 | ORIGIN | Aucun prérequis. Une fois par repos court ou long, lorsque vous tombez en dessous de 50% de vos PV max, vous libérez une onde élémentaire infligeant 1d8 dégâts (Acide, Froid, Feu ou Foudre au choix) à toutes les créatures hostiles adjacentes.
* **Unleashed Will** (`ULA_2026`) | Niveau 1 | ORIGIN | Aucun prérequis. Avantage aux jets de sauvegarde pour maintenir la concentration sur un sort et immunité contre l'interruption magique provoquée par des intempéries ou secousses environnementales.

### Dons Généraux & Paliers Avancés (Niveau 4+)
* **Chain-Cast Specialist** (`ULA_2026`) | Niveau 4 | GENERAL | Capacité à lancer des sorts. +1 Intelligence, Sagesse ou Charisme (max 20). Lorsque vous lancez un sort ciblant une créature unique, vous pouvez utiliser votre réaction pour répercuter un effet mineur de ce sort sur une seconde créature située à moins de 3 mètres de la première.
* **Eldritch Resonance** (`ULA_2026`) | Niveau 4 | GENERAL | Charisme ou Intelligence 13+. +1 Caractéristique d'incantation (max 20). Vos sorts infligeant des dégâts de force repoussent la cible de 1,5 m et font vibrer les créatures invisibles à 6 m, annulant leur invisibilité jusqu'à la fin de votre tour.
* **Mana Shaper** (`ULA_2026`) | Niveau 4 | GENERAL | Capacité à lancer des sorts. +1 Intelligence ou Charisme (max 20). Permet d'altérer le type de dégâts élémentaires de n'importe quel sort préparé (ex: Feu en Foudre, Froid en Acide) sans coût de sorcellerie (utilisable un nombre de fois égal à votre bonus de maîtrise par repos long).
* **Spellblade Mastery** (`ULA_2026`) | Niveau 4 | GENERAL | Maîtrise des armes de guerre et capacité à lancer des sorts. +1 Force ou Dextérité (max 20). Canalise l'incantation d'un sort d'action dans une arme : votre prochaine frappe martiale réussie délivre les effets du sort en sus des dégâts d'arme sans provoquer d'attaque d'opportunité.
* **Unbounded Conduit** (`ULA_2026`) | Niveau 4 | GENERAL | Niveau 4+. +1 Caractéristique au choix (max 20). Vos attaques de sorts à distance ne subissent aucun désavantage au corps-à-corps, et vous pouvez exclure votre propre case de la zone d'effet de vos sorts sans jet de sauvegarde requis.

### Dons de Bénédiction Épique (Niveau 19+)
* **Boon of the Unleashed Soul** (`ULA_2026`) | Niveau 19 | EPIC_BOON | Niveau 19+. Une fois par repos long, lorsque vous tombez à 0 point de vie, vous libérez une nova d'énergie pure infligeant 8d10 dégâts de force dans un rayon de 9 mètres et récupérez instantanément 50% de vos PV maximum.
* **Boon of Infinite Arcana** (`ULA_2026`) | Niveau 19 | EPIC_BOON | Niveau 19+. Vous débloquez un emplacement de sort universel (jusqu'au niveau 5) qui se recharge après un repos court au lieu d'un repos long.