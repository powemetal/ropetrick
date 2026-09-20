# Registre Exhaustif des Sorts et Dons par Livre Source (D&D 5e, 5.5 & Unearthed Arcana)

Ce registre répertorie chaque sort et don avec son code de livre source (`sourceBookCode`), son niveau/catégorie, ses métadonnées et prérequis afin d'alimenter le script de peuplement (`prisma/seed-compendium.ts`) et les tables Prisma sans omission.

---

## 1. Table des Livres Sources (SourceBooks)

* `PHB_2024` : Player's Handbook (Édition 2024 / 5.5)
* `PHB_2014` : Player's Handbook (Édition 2014 / 5e)
* `XGE` : Xanathar's Guide to Everything
* `TCE` : Tasha's Cauldron of Everything
* `SCAG` : Sword Coast Adventurer's Guide
* `FToD` : Fizban's Treasury of Dragons
* `SCC` : Strixhaven: A Curriculum of Chaos
* `BGG` : Bigby Presents: Glory of the Giants
* `UA_PLAYTEST` : Unearthed Arcana (Playtests officiels One D&D, 2024/2025/2026, Héros planaires et options expérimentales)
* `AU_2026` : Arcana Unleashed

---

## 2. Inventaire Exhaustif des Dons (Feats) par Livre

### A. Unearthed Arcana Playtests (`UA_PLAYTEST`)

#### Dons d'Origine (Niveau 1)
* **Cartomancer (UA)** | Niveau 1 | Origine | Aucun prérequis. Permet d'utiliser un jeu de cartes comme focalisateur arcanique, d'apprendre le tour de magie *Guidance* façon tirage divinatoire, et d'imprégner une carte d'un sort pour le lancer par action bonus.
* **Rune Carver Apprentice (UA)** | Niveau 1 | Origine | Aucun prérequis. Apprend à graver une rune sur un objet après un repos long, accordant l'accès à un sort de niveau 1 lié à la rune sans dépenser d'emplacement.
* **Scion of the Outer Planes (UA)** | Niveau 1 | Origine | Aucun prérequis. Harmonisation avec un plan extérieur (Chaotique, Loyal, Bon, Mauvais, ou Outlands). Confère une résistance à un type de dégât élémentaire/planaire et un tour de magie thématique.
* **Squire of Solamnia (UA)** | Niveau 1 | Origine | Aucun prérequis. Maîtrise des armures moyennes et des armes de guerre. Permet d'ajouter +1d8 de dégâts à une attaque avec avantage plusieurs fois par repos long.
* **Strike of the Giants (UA)** | Niveau 1 | Origine | Aucun prérequis. Maîtrise des armes de guerre. Confère une frappe élémentaire selon le géant choisi (Collines : renversement, Nuages : téléportation, Feu : +1d10 feu, Givre : entrave glacée, Pierre : recul 3m, Tempête : désavantage aux attaques ennemies).
* **Tandem Tactician (UA)** | Niveau 1 | Origine | Aucun prérequis. L'action Aider (Help) peut être utilisée en tant qu'action bonus à une portée de 9 mètres et peut assister deux alliés simultanément.

#### Dons Généraux, Raciaux & Psioniques (Niveau 4+)
* **Acrobat (UA)** | Niveau 4 | Général | Maîtrise ou expertise en Acrobaties. Permet de se relever sans coût de déplacement et de traverser un terrain difficile sans pénalité d'action.
* **Adept of the Black Robes (UA)** | Niveau 4 | Général | Prérequis : don Initié de la Haute Sorcellerie (Nuitari). Accès à des sorts de nécromancie/enchantement de niveau 2 et possibilité de sacrifier des PV pour accroître les dégâts des sorts.
* **Adept of the Red Robes (UA)** | Niveau 4 | Général | Prérequis : don Initié de la Haute Sorcellerie (Lunitari). Accès à des sorts d'illusion/transmutation de niveau 2 et maîtrise de l'équilibre magique pour transformer un d20 inférieur à 10 en 10.
* **Adept of the White Robes (UA)** | Niveau 4 | Général | Prérequis : don Initié de la Haute Sorcellerie (Solinari). Accès à des sorts d'abjuration/divination de niveau 2 et barrière de protection protectrice réduisant les dégâts subis par vous ou un allié.
* **Agent of Order (UA)** | Niveau 4 | Général | Prérequis : Scion of the Outer Planes (Plan Loyal). +1 Caractéristique. Permet d'entraver les mouvements ennemis et d'infliger des dégâts de force supplémentaires.
* **Brawny (UA)** | Niveau 4 | Général | +1 Force. Maîtrise/Expertise en Athlétisme. Votre capacité de transport et de charge est doublée comme si vous étiez d'une catégorie de taille supérieure.
* **Cohort of Chaos (UA)** | Niveau 4 | Général | Prérequis : Scion of the Outer Planes (Plan Chaotique). +1 Caractéristique. Déclenche une onde d'effets chaotiques imprévisibles sur coup critique ou sauvegarde manquée.
* **Diplomat (UA)** | Niveau 4 | Général | +1 Charisme. Maîtrise/Expertise en Persuasion. Passer 1 minute à parlementer force un jet d'opposition : charme la cible tant qu'aucune hostilité n'est commise.
* **Historian (UA)** | Niveau 4 | Général | +1 Intelligence. Maîtrise/Expertise en Histoire. Permet d'offrir des conseils historiques en réaction via l'action Aider pour ajouter votre bonus de maîtrise au d20 d'un allié.
* **Investigator (UA)** | Niveau 4 | Général | +1 Intelligence. Maîtrise/Expertise en Investigation. Permet d'effectuer l'action Chercher (Search) en tant qu'action bonus.
* **Knight of the Crown (UA)** | Niveau 4 | Général | Prérequis : Squire of Solamnia. +1 Force ou Constitution. Ordre de commandement permettant à un allié d'utiliser sa réaction pour attaquer immédiatement.
* **Knight of the Rose (UA)** | Niveau 4 | Général | Prérequis : Squire of Solamnia. +1 Constitution ou Charisme. Présence encourageante conférant des PV temporaires et l'avantage contre la peur.
* **Knight of the Sword (UA)** | Niveau 4 | Général | Prérequis : Squire of Solamnia. +1 Intelligence, Sagesse ou Charisme. Frappe démoralisante effrayant la cible touchée sans jet de sauvegarde initial.
* **Medic (UA)** | Niveau 4 | Général | +1 Sagesse. Maîtrise/Expertise en Médecine. Permet lors d'un repos court de soigner jusqu'à 6 alliés en maximisant la valeur du premier dé de vie dépensé.
* **Menacing (UA)** | Niveau 4 | Général | +1 Charisme. Maîtrise/Expertise en Intimidation. Remplace une attaque par un regard terrifiant : la cible est effrayée jusqu'à la fin de votre prochain tour.
* **Naturalist (UA)** | Niveau 4 | Général | +1 Intelligence. Maîtrise/Expertise en Nature. Apprend *Druidcraft* et *Detect Poison and Disease* (lancement gratuit 1x/repos long).
* **Outlands Envoy (UA)** | Niveau 4 | Général | Prérequis : Scion of the Outer Planes (Outlands). +1 Caractéristique. Apprend *Misty Step* et un sort de communication planaire.
* **Perceptive (UA)** | Niveau 4 | Général | +1 Sagesse. Maîtrise/Expertise en Perception. Être dans une zone à visibilité réduite n'impose aucun désavantage à vos tests de Perception.
* **Planar Wanderer (UA)** | Niveau 4 | Général | +1 Caractéristique. Détection naturelle des portails planaires, résistance aux altérations environnementales des plans extérieurs.
* **Quick-Fingered (UA)** | Niveau 4 | Général | +1 Dextérité. Maîtrise/Expertise en Escamotage. Permet d'effectuer un test d'Escamotage, de voler ou de planter un objet par une simple action bonus.
* **Righteous Heritor (UA)** | Niveau 4 | Général | Prérequis : Scion of the Outer Planes (Plan Bon). +1 Caractéristique. Soins radiants accrus et intervention céleste réduisant les dégâts mortels subis.
* **Silver-Tongued (UA)** | Niveau 4 | Général | +1 Charisme. Maîtrise/Expertise en Tromperie. Permet de feinter en combat par action bonus pour empêcher les attaques d'opportunité contre vous.
* **Stealthy (UA)** | Niveau 4 | Général | +1 Dextérité. Maîtrise/Expertise en Discrétion. Se cacher ne nécessite qu'un abri partiel ou une ombre légère, et votre position n'est pas révélée si vous manquez une attaque à distance.
* **Survivalist (UA)** | Niveau 4 | Général | +1 Sagesse. Maîtrise/Expertise en Survie. Apprend *Alarm* rituel et ignore les pénalités de climat extrême (froid ou chaleur intenses).
* **Theologian (UA)** | Niveau 4 | Général | +1 Intelligence. Maîtrise/Expertise en Religion. Apprend *Thaumaturgy* et *Detect Evil and Good* (lancement 1x/repos long sans emplacement).
* **Wild Talent (UA)** | Niveau 4 | Psionique | +1 Caractéristique. Débloque un dé de puissance psionique (d6/d8) utilisable pour doper ses jets d'attaque, sauvegardes ou dégâts.

#### Dons de Bénédiction Épique Expérimentaux (Niveau 19+ UA)
* **Boon of the Solar Flare (UA)** | Niveau 19 | Épique | Niveau 19+. Éclat aveuglant permanent rendant les ennemis adjacents aveuglés lorsqu'ils vous frappent, et téléportation lumineuse de 9 mètres par action bonus.
* **Boon of Spell Mastery (UA)** | Niveau 19 | Épique | Niveau 19+. Choix d'un sort de niveau 1 et d'un sort de niveau 2 : lancement à volonté sans dépenser d'emplacement de sort.

---

### B. Player's Handbook 2024 (`PHB_2024`)

#### Dons d'Origine (Niveau 1)
* **Alert** | Niveau 1 | Origine | Aucun prérequis.
* **Crafter** | Niveau 1 | Origine | Aucun prérequis.
* **Healer** | Niveau 1 | Origine | Aucun prérequis.
* **Lucky** | Niveau 1 | Origine | Aucun prérequis.
* **Magic Initiate (Cleric)** | Niveau 1 | Origine | Aucun prérequis.
* **Magic Initiate (Druid)** | Niveau 1 | Origine | Aucun prérequis.
* **Magic Initiate (Wizard)** | Niveau 1 | Origine | Aucun prérequis.
* **Musician** | Niveau 1 | Origine | Aucun prérequis.
* **Savage Attacker** | Niveau 1 | Origine | Aucun prérequis.
* **Skilled** | Niveau 1 | Origine | Aucun prérequis.
* **Tavern Brawler** | Niveau 1 | Origine | Aucun prérequis.
* **Tough** | Niveau 1 | Origine | Aucun prérequis.

#### Dons Généraux (Niveau 4+)
* **Actor** | Niveau 4 | Général | Charisme 13+.
* **Athlete** | Niveau 4 | Général | Force 13+ ou Dextérité 13+.
* **Charger** | Niveau 4 | Général | Force 13+ ou Dextérité 13+.
* **Crossbow Expert** | Niveau 4 | Général | Dextérité 13+.
* **Crusher** | Niveau 4 | Général | Force 13+ ou Constitution 13+.
* **Defensive Duelist** | Niveau 4 | Général | Dextérité 13+.
* **Dual Wielder** | Niveau 4 | Général | Force 13+ ou Dextérité 13+.
* **Dungeon Delver** | Niveau 4 | Général | Sagesse 13+ ou Intelligence 13+.
* **Durable** | Niveau 4 | Général | Constitution 13+.
* **Elemental Adept** | Niveau 4 | Général | Capacité à lancer au moins un sort.
* **Grappler** | Niveau 4 | Général | Force 13+ ou Dextérité 13+.
* **Great Weapon Master** | Niveau 4 | Général | Force 13+.
* **Heavy Armor Master** | Niveau 4 | Général | Maîtrise des armures lourdes.
* **Inspiring Leader** | Niveau 4 | Général | Sagesse 13+ ou Charisme 13+.
* **Mage Slayer** | Niveau 4 | Général | Force 13+ ou Dextérité 13+.
* **Medium Armor Master** | Niveau 4 | Général | Maîtrise des armures moyennes.
* **Mounted Combatant** | Niveau 4 | Général | Aucun prérequis.
* **Observant** | Niveau 4 | Général | Intelligence 13+ ou Sagesse 13+.
* **Piercer** | Niveau 4 | Général | Force 13+ ou Dextérité 13+.
* **Polearm Master** | Niveau 4 | Général | Force 13+ ou Dextérité 13+.
* **Resilient** | Niveau 4 | Général | Aucun prérequis.
* **Ritual Caster** | Niveau 4 | Général | Intelligence 13+ ou Sagesse 13+.
* **Sentinel** | Niveau 4 | Général | Force 13+ ou Dextérité 13+.
* **Sharpshooter** | Niveau 4 | Général | Dextérité 13+.
* **Shield Master** | Niveau 4 | Général | Maîtrise des boucliers.
* **Slasher** | Niveau 4 | Général | Force 13+ ou Dextérité 13+.
* **Speedy** | Niveau 4 | Général | Dextérité 13+ ou Constitution 13+.
* **Spell Sniper** | Niveau 4 | Général | Capacité à lancer au moins un sort.
* **War Caster** | Niveau 4 | Général | Capacité à lancer au moins un sort.
* **Weapon Master** | Niveau 4 | Général | Aucun prérequis.

#### Dons de Bénédiction Épique (Niveau 19+)
* **Boon of Combat Prowess** | Niveau 19 | Épique | Niveau 19+.
* **Boon of Dimensional Travel** | Niveau 19 | Épique | Niveau 19+.
* **Boon of Energy Evasion** | Niveau 19 | Épique | Niveau 19+.
* **Boon of Fate** | Niveau 19 | Épique | Niveau 19+.
* **Boon of Fortitude** | Niveau 19 | Épique | Niveau 19+.
* **Boon of Irresistible Offense** | Niveau 19 | Épique | Niveau 19+.
* **Boon of Recovery** | Niveau 19 | Épique | Niveau 19+.
* **Boon of Skill Proficiency** | Niveau 19 | Épique | Niveau 19+.
* **Boon of Speed** | Niveau 19 | Épique | Niveau 19+.
* **Boon of Spell Recall** | Niveau 19 | Épique | Niveau 19+.
* **Boon of the Night Spirit** | Niveau 19 | Épique | Niveau 19+.
* **Boon of Truesight** | Niveau 19 | Épique | Niveau 19+.

### C. Player's Handbook 2014 (`PHB_2014`)
* **Heavily Armored** | Niveau 4 | Général | Maîtrise des armures moyennes.
* **Keen Mind** | Niveau 4 | Général | Intelligence 13+.
* **Lightly Armored** | Niveau 4 | Général | Aucune maîtrise d'armure requise.
* **Linguist** | Niveau 4 | Général | Intelligence 13+.
* **Moderately Armored** | Niveau 4 | Général | Maîtrise des armures légères.
* **Skulker** | Niveau 4 | Général | Dextérité 13+.

### D. Xanathar's Guide to Everything (`XGE`)
* **Bountiful Luck** | Niveau 4 | Racial | Espèce Halfelin.
* **Dragon Fear** | Niveau 4 | Racial | Espèce Dragonborn.
* **Dragon Hide** | Niveau 4 | Racial | Espèce Dragonborn.
* **Drow High Magic** | Niveau 4 | Racial | Sous-espèce Drow.
* **Dwarven Fortitude** | Niveau 4 | Racial | Espèce Nain.
* **Elven Accuracy** | Niveau 4 | Racial | Espèce Elfe ou Demi-Elfe.
* **Fade Away** | Niveau 4 | Racial | Espèce Gnome.
* **Fey Teleportation** | Niveau 4 | Racial | Espèce Haut-Elfe.
* **Flames of Phlegethos** | Niveau 4 | Racial | Espèce Tieffelin.
* **Infernal Constitution** | Niveau 4 | Racial | Espèce Tieffelin.
* **Orcish Fury** | Niveau 4 | Racial | Espèce Demi-Orc ou Orc.
* **Prodigy** | Niveau 4 | Racial | Espèce Humain, Demi-Elfe ou Demi-Orc.
* **Second Chance** | Niveau 4 | Racial | Espèce Halfelin.
* **Squat Nimbleness** | Niveau 4 | Racial | Espèce Nain, Gnome ou Halfelin.
* **Wood Elf Magic** | Niveau 4 | Racial | Sous-espèce Elfe des bois.

### E. Tasha's Cauldron of Everything (`TCE`)
* **Artificer Initiate** | Niveau 4 | Général | Aucun prérequis.
* **Chef** | Niveau 4 | Général | Constitution ou Sagesse 13+.
* **Eldritch Adept** | Niveau 4 | Général | Lancement de sorts ou Invocations Occultes.
* **Fey Touched** | Niveau 4 | Général | Intelligence, Sagesse ou Charisme 13+.
* **Fighting Initiate** | Niveau 4 | Général | Maîtrise d'une arme de guerre.
* **Gunner** | Niveau 4 | Général | Dextérité 13+.
* **Metamagic Adept** | Niveau 4 | Général | Capacité à lancer au moins un sort.
* **Poisoner** | Niveau 4 | Général | Aucun prérequis.
* **Shadow Touched** | Niveau 4 | Général | Intelligence, Sagesse ou Charisme 13+.
* **Skill Expert** | Niveau 4 | Général | Aucun prérequis.
* **Telekinetic** | Niveau 4 | Général | Intelligence, Sagesse ou Charisme 13+.
* **Telepathic** | Niveau 4 | Général | Intelligence, Sagesse ou Charisme 13+.

### F. Fizban's Treasury of Dragons (`FToD`)
* **Gift of the Chromatic Dragon** | Niveau 4 | Général | Aucun prérequis.
* **Gift of the Gem Dragon** | Niveau 4 | Général | Aucun prérequis.
* **Gift of the Metallic Dragon** | Niveau 4 | Général | Aucun prérequis.

### G. Strixhaven: A Curriculum of Chaos (`SCC`)
* **Strixhaven Initiate** | Niveau 1 | Origine | Aucun prérequis.
* **Strixhaven Mascot** | Niveau 4 | Général | Niveau 4+, don Strixhaven Initiate.

### H. Bigby Presents: Glory of the Giants (`BGG`)
* **Fury of the Frost Giant** | Niveau 4 | Général | Niveau 4+, don Strike of the Giants.
* **Guile of the Cloud Giant** | Niveau 4 | Général | Niveau 4+, don Strike of the Giants.
* **Keenness of the Stone Giant** | Niveau 4 | Général | Niveau 4+, don Strike of the Giants.
* **Outsize Might** | Niveau 4 | Général | Niveau 4+.
* **Rune Carver Adept** | Niveau 4 | Général | Niveau 4+, don Rune Carver Apprentice.
* **Soul of the Storm Giant** | Niveau 4 | Général | Niveau 4+, don Strike of the Giants.
* **Vigor of the Hill Giant** | Niveau 4 | Général | Niveau 4+, don Strike of the Giants.

---

## 3. Inventaire Exhaustif des Sorts (Spells) par Livre

### A. Unearthed Arcana Playtests (`UA_PLAYTEST`)

#### Tours de magie (Niveau 0)
* **Hand of Radiance (UA)** | Niv 0 | Évocation | 1 action | Personnelle (rayon 1,5m) | V, S | Instantanée | Non | Non | Éclat lumineux brûlant les ennemis à 1,5m : sauvegarde Con sous peine de subir 1d6 dégâts radiants. Évolution : 2d6, 3d6, 4d6. | Clerc
* **On/Off (UA Modern)** | Niv 0 | Transmutation | 1 action | 9m | V, S | Instantanée | Non | Non | Allume ou éteint instantanément un appareil électronique ou mécanique non magique. | Artificier, Ensorceleur, Magicien, Occultiste
* **Sorcerous Burst (UA)** | Niv 0 | Évocation | 1 action | 36m | V, S | Instantanée | Non | Non | Projette un éclat d'énergie brute infligeant 1d8 dégâts du type élémentaire choisi (Acide, Froid, Feu, Foudre, Poison, Psychique, Tonnerre). Si le d8 affiche un 8, lancez un d8 supplémentaire qui s'ajoute aux dégâts. Évolution : 2d8, 3d8, 4d8. | Ensorceleur
* **Starry Wisp (UA)** | Niv 0 | Évocation | 1 action | 18m | V, S | Instantanée | Non | Non | Faisceau de poussière d'étoiles infligeant 1d8 dégâts radiants sur attaque de sort à distance réussie et faisant émettre à la cible une faible lueur annulant l'invisibilité jusqu'à la fin de votre prochain tour. Évolution : 2d8, 3d8, 4d8. | Barde, Druide

#### Niveau 1
* **Guiding Hand (UA)** | Niv 1 | Divination | 1 minute (Rituel) | 1,5m | V, S | Concentration jusqu'à 8 heures | Oui | Oui | Invoque une main spectrale lumineuse qui flotte devant vous et trace le chemin le plus sûr vers un repère géographique majeur nommé sur le même plan. | Barde, Clerc, Druide, Magicien
* **Healing Elixir (UA)** | Niv 1 | Invocation | 1 minute | Contact | V, S, M (une fiole) | 24 heures | Non | Non | Crée une potion lumineuse dans une fiole. Toute créature qui la boit par une action récupère 2d4 + 2 points de vie. La potion perd ses vertus après 24 heures. | Druide, Magicien, Occultiste
* **Infallible Relay (UA Modern)** | Niv 1 | Divination | 1 minute | Personnelle | V, S, M (un fil de cuivre) | Concentration jusqu'à 10 minutes | Oui | Non | Permet d'établir une communication mentale sécurisée et inaltérable avec un téléphone ou terminal technologique distant. | Artificier, Ensorceleur, Magicien
* **Puppet (UA)** | Niv 1 | Enchantement | 1 action | 36m | S | Instantanée | Non | Non | Force une créature humanoïde échouant une sauvegarde de Constitution à lâcher immédiatement ce qu'elle tient et à se déplacer de jusqu'à 6 mètres dans la direction de votre choix en utilisant sa réaction. | Barde, Ensorceleur, Magicien, Occultiste
* **Sense Emotion (UA)** | Niv 1 | Divination | 1 action | Personnelle | V, S | Concentration jusqu'à 10 minutes | Oui | Non | Révèle l'état émotionnel, les peurs sous-jacentes et les impulsions dominantes de toute créature visible à moins de 9 mètres. | Barde, Occultiste, Magicien
* **Sudden Awakening (UA)** | Niv 1 | Enchantement | 1 action bonus | 3m | V | Instantanée | Non | Non | Réveille instantanément toutes les créatures endormies de votre choix dans un rayon de 3 mètres, leur permettant de se relever sans dépenser de mouvement. | Barde, Clerc, Druide, Ensorceleur, Magicien, Paladin, Rôdeur
* **Wild Cunning (UA)** | Niv 1 | Divination | 1 action (Rituel) | Personnelle | V, S | Instantanée | Non | Oui | Invoque les esprits de la nature pour localiser immédiatement la source d'eau potable la plus proche, un abri sûr, ou la présence de prédateurs à moins de 1,5 km. | Druide, Rôdeur

#### Niveaux 2 à 9
* **Arcane Eruption (UA)** | Niv 4 | Invocation | 1 action | 36m | V, S | Instantanée | Non | Non | Fait jaillir une colonne d'énergie chaotique de 6m de rayon infligeant 6d6 dégâts d'un type aléatoire (sauvegarde Dex) et imposant une condition néfaste (aveuglé, assourdi, ou entravé) pendant 1 round. | Ensorceleur
* **Fount of Moonlight (UA)** | Niv 4 | Évocation | 1 action | Personnelle | V, S | Concentration jusqu'à 10 minutes | Oui | Non | Vous rayonnez d'une lumière lunaire vive : résistance aux dégâts radiants, vos attaques de corps-à-corps infligent 2d6 dégâts radiants supplémentaires, et toute créature qui vous frappe doit réussir une sauvegarde de Con sous peine d'être aveuglée pour 1 tour. | Barde, Druide
* **Power Word Fortify (UA)** | Niv 7 | Enchantement | 1 action | 18m | V | Instantanée | Non | Non | Vous prononcez un mot de pouvoir réconfortant accordant une réserve collective de 120 points de vie temporaires répartie à votre guise entre jusqu'à 6 créatures visibles à portée. | Barde, Clerc
* **Sorcerous Vitality (UA)** | Niv 3 | Évocation | 1 action | Personnelle | V, S | Instantanée | Non | Non | Vous canalisez votre propre magie innée pour régénérer 2d6 + modificateur de Charisme PV et vous débarrasser immédiatement de l'état aveuglé, assourdi ou empoisonné. | Ensorceleur
* **Spirit of Death (UA)** | Niv 4 | Nécromancie | 1 action | 27m | V, S, M (un médaillon en argent de 400 PO) | Concentration jusqu'à 1 heure | Oui | Non | Invoque un faucheur spectral impitoyable attaquant vos ennemis avec sa faux funeste, infligeant des dégâts nécrotiques et terrorisant les cibles mourantes. | Ensorceleur, Magicien, Occultiste

---

### B. Player's Handbook 2024 / 2014 (`PHB_2024` / `PHB_2014`)

#### Tours de magie (Niveau 0)
* **Acid Splash** | Niv 0 | Invocation | Artificier, Ensorceleur, Magicien
* **Blade Ward** | Niv 0 | Abjuration | Barde, Ensorceleur, Magicien, Occultiste
* **Chill Touch** | Niv 0 | Nécromancie | Ensorceleur, Magicien, Occultiste
* **Dancing Lights** | Niv 0 | Évocation | Artificier, Barde, Ensorceleur, Magicien
* **Druidcraft** | Niv 0 | Transmutation | Druide
* **Eldritch Blast** | Niv 0 | Évocation | Occultiste
* **Fire Bolt** | Niv 0 | Évocation | Artificier, Ensorceleur, Magicien
* **Friends** | Niv 0 | Enchantement | Barde, Ensorceleur, Magicien, Occultiste
* **Guidance** | Niv 0 | Divination | Artificier, Clerc, Druide
* **Light** | Niv 0 | Évocation | Artificier, Barde, Clerc, Ensorceleur, Magicien
* **Mage Hand** | Niv 0 | Invocation | Artificier, Barde, Ensorceleur, Magicien, Occultiste
* **Mending** | Niv 0 | Transmutation | Artificier, Barde, Clerc, Druide, Ensorceleur, Magicien
* **Message** | Niv 0 | Transmutation | Artificier, Barde, Ensorceleur, Magicien
* **Minor Illusion** | Niv 0 | Illusion | Barde, Ensorceleur, Magicien, Occultiste
* **Poison Spray** | Niv 0 | Invocation | Artificier, Druide, Ensorceleur, Magicien, Occultiste
* **Prestidigitation** | Niv 0 | Transmutation | Artificier, Barde, Ensorceleur, Magicien, Occultiste
* **Produce Flame** | Niv 0 | Invocation | Druide
* **Ray of Frost** | Niv 0 | Évocation | Artificier, Ensorceleur, Magicien
* **Resistance** | Niv 0 | Abjuration | Artificier, Clerc, Druide
* **Sacred Flame** | Niv 0 | Évocation | Clerc
* **Shillelagh** | Niv 0 | Transmutation | Druide
* **Shocking Grasp** | Niv 0 | Évocation | Artificier, Ensorceleur, Magicien
* **Spare the Dying** | Niv 0 | Nécromancie | Artificier, Clerc
* **Thaumaturgy** | Niv 0 | Transmutation | Clerc
* **Thorn Whip** | Niv 0 | Transmutation | Artificier, Druide
* **True Strike** | Niv 0 | Divination | Barde, Ensorceleur, Magicien, Occultiste
* **Vicious Mockery** | Niv 0 | Enchantement | Barde

#### Niveau 1
* **Alarm** | Niv 1 | Abjuration | Artificier, Magicien, Rôdeur (Rituel)
* **Animal Friendship** | Niv 1 | Enchantement | Barde, Druide, Rôdeur
* **Armor of Agathys** | Niv 1 | Abjuration | Occultiste
* **Arms of Hadar** | Niv 1 | Invocation | Occultiste
* **Bane** | Niv 1 | Enchantement | Barde, Clerc
* **Bless** | Niv 1 | Enchantement | Clerc, Paladin
* **Burning Hands** | Niv 1 | Évocation | Ensorceleur, Magicien
* **Charm Person** | Niv 1 | Enchantement | Barde, Druide, Ensorceleur, Magicien, Occultiste
* **Color Spray** | Niv 1 | Illusion | Ensorceleur, Magicien
* **Command** | Niv 1 | Enchantement | Clerc, Paladin
* **Compelled Duel** | Niv 1 | Enchantement | Paladin
* **Comprehend Languages** | Niv 1 | Divination | Barde, Ensorceleur, Magicien, Occultiste (Rituel)
* **Create or Destroy Water** | Niv 1 | Transmutation | Clerc, Druide
* **Cure Wounds** | Niv 1 | Évocation | Artificier, Barde, Clerc, Druide, Paladin, Rôdeur
* **Detect Evil and Good** | Niv 1 | Divination | Clerc, Paladin
* **Detect Magic** | Niv 1 | Divination | Artificier, Barde, Clerc, Druide, Ensorceleur, Magicien, Paladin, Rôdeur (Rituel)
* **Detect Poison and Disease** | Niv 1 | Divination | Clerc, Druide, Paladin, Rôdeur (Rituel)
* **Disguise Self** | Niv 1 | Illusion | Artificier, Barde, Ensorceleur, Magicien
* **Dissonant Whispers** | Niv 1 | Enchantement | Barde
* **Divine Favor** | Niv 1 | Évocation | Paladin
* **Ensnaring Strike** | Niv 1 | Invocation | Rôdeur
* **Entangle** | Niv 1 | Invocation | Druide
* **Expeditious Retreat** | Niv 1 | Transmutation | Artificier, Ensorceleur, Magicien, Occultiste
* **Faerie Fire** | Niv 1 | Évocation | Artificier, Barde, Druide
* **False Life** | Niv 1 | Nécromancie | Artificier, Ensorceleur, Magicien
* **Feather Fall** | Niv 1 | Transmutation | Artificier, Barde, Ensorceleur, Magicien
* **Find Familiar** | Niv 1 | Invocation | Magicien (Rituel)
* **Floating Disk** | Niv 1 | Invocation | Artificier, Magicien (Rituel)
* **Fog Cloud** | Niv 1 | Invocation | Druide, Ensorceleur, Magicien, Rôdeur
* **Goodberry** | Niv 1 | Transmutation | Druide, Rôdeur
* **Grease** | Niv 1 | Invocation | Artificier, Magicien
* **Guiding Bolt** | Niv 1 | Évocation | Clerc
* **Hail of Thorns** | Niv 1 | Invocation | Rôdeur
* **Healing Word** | Niv 1 | Évocation | Barde, Clerc, Druide
* **Hellish Rebuke** | Niv 1 | Évocation | Occultiste
* **Heroism** | Niv 1 | Enchantement | Barde, Paladin
* **Hex** | Niv 1 | Enchantement | Occultiste
* **Hideous Laughter** | Niv 1 | Enchantement | Barde, Magicien
* **Hunter's Mark** | Niv 1 | Divination | Rôdeur
* **Identify** | Niv 1 | Divination | Artificier, Barde, Magicien (Rituel)
* **Illusory Script** | Niv 1 | Illusion | Barde, Magicien, Occultiste (Rituel)
* **Inflict Wounds** | Niv 1 | Nécromancie | Clerc
* **Jump** | Niv 1 | Transmutation | Artificier, Druide, Magicien, Rôdeur
* **Longstrider** | Niv 1 | Transmutation | Artificier, Barde, Druide, Magicien, Rôdeur
* **Mage Armor** | Niv 1 | Abjuration | Ensorceleur, Magicien
* **Magic Missile** | Niv 1 | Évocation | Ensorceleur, Magicien
* **Protection from Evil and Good** | Niv 1 | Abjuration | Clerc, Magicien, Occultiste, Paladin
* **Purify Food and Drink** | Niv 1 | Transmutation | Artificier, Clerc, Druide, Paladin (Rituel)
* **Ray of Sickness** | Niv 1 | Nécromancie | Ensorceleur, Magicien
* **Sanctuary** | Niv 1 | Abjuration | Artificier, Clerc
* **Searing Smite** | Niv 1 | Évocation | Paladin
* **Shield** | Niv 1 | Abjuration | Ensorceleur, Magicien
* **Shield of Faith** | Niv 1 | Abjuration | Clerc, Paladin
* **Silent Image** | Niv 1 | Illusion | Barde, Ensorceleur, Magicien
* **Sleep** | Niv 1 | Enchantement | Barde, Ensorceleur, Magicien
* **Speak with Animals** | Niv 1 | Divination | Barde, Druide, Rôdeur (Rituel)
* **Thunderous Smite** | Niv 1 | Évocation | Paladin
* **Thunderwave** | Niv 1 | Évocation | Barde, Druide, Ensorceleur, Magicien
* **Unseen Servant** | Niv 1 | Invocation | Barde, Magicien, Occultiste (Rituel)
* **Witch Bolt** | Niv 1 | Évocation | Ensorceleur, Magicien, Occultiste
* **Wrathful Smite** | Niv 1 | Évocation | Paladin

#### Niveaux 2 à 9 (Sélection PHB)
* **Aid** | Niv 2 | Abjuration | Artificier, Clerc, Paladin
* **Barkskin** | Niv 2 | Transmutation | Druide, Rôdeur
* **Blindness/Deafness** | Niv 2 | Nécromancie | Barde, Clerc, Ensorceleur, Magicien
* **Blur** | Niv 2 | Illusion | Artificier, Ensorceleur, Magicien
* **Darkness** | Niv 2 | Évocation | Ensorceleur, Magicien, Occultiste
* **Darkvision** | Niv 2 | Transmutation | Artificier, Druide, Ensorceleur, Magicien, Rôdeur
* **Enhance Ability** | Niv 2 | Transmutation | Artificier, Barde, Clerc, Druide, Ensorceleur, Magicien
* **Flaming Sphere** | Niv 2 | Invocation | Druide, Magicien
* **Hold Person** | Niv 2 | Enchantement | Barde, Clerc, Druide, Ensorceleur, Magicien, Occultiste
* **Invisibility** | Niv 2 | Illusion | Artificier, Barde, Ensorceleur, Magicien, Occultiste
* **Knock** | Niv 2 | Transmutation | Barde, Ensorceleur, Magicien
* **Lesser Restoration** | Niv 2 | Abjuration | Artificier, Barde, Clerc, Druide, Paladin, Rôdeur
* **Levitate** | Niv 2 | Transmutation | Artificier, Ensorceleur, Magicien
* **Mirror Image** | Niv 2 | Illusion | Ensorceleur, Magicien, Occultiste
* **Misty Step** | Niv 2 | Invocation | Ensorceleur, Magicien, Occultiste
* **Pass without Trace** | Niv 2 | Abjuration | Druide, Rôdeur
* **Scorching Ray** | Niv 2 | Évocation | Ensorceleur, Magicien
* **See Invisibility** | Niv 2 | Divination | Artificier, Barde, Ensorceleur, Magicien
* **Shatter** | Niv 2 | Évocation | Barde, Ensorceleur, Magicien, Occultiste
* **Silence** | Niv 2 | Illusion | Barde, Clerc, Rôdeur (Rituel)
* **Spiritual Weapon** | Niv 2 | Évocation | Clerc
* **Suggestion** | Niv 2 | Enchantement | Barde, Ensorceleur, Magicien, Occultiste
* **Web** | Niv 2 | Invocation | Artificier, Ensorceleur, Magicien
* **Counterspell** | Niv 3 | Abjuration | Ensorceleur, Magicien, Occultiste
* **Dispel Magic** | Niv 3 | Abjuration | Artificier, Barde, Clerc, Druide, Ensorceleur, Magicien, Paladin
* **Fireball** | Niv 3 | Évocation | Ensorceleur, Magicien
* **Fly** | Niv 3 | Transmutation | Artificier, Ensorceleur, Magicien, Occultiste
* **Haste** | Niv 3 | Transmutation | Artificier, Ensorceleur, Magicien
* **Hypnotic Pattern** | Niv 3 | Illusion | Barde, Ensorceleur, Magicien, Occultiste
* **Lightning Bolt** | Niv 3 | Évocation | Ensorceleur, Magicien
* **Major Image** | Niv 3 | Illusion | Barde, Ensorceleur, Magicien, Occultiste
* **Mass Healing Word** | Niv 3 | Évocation | Clerc
* **Revivify** | Niv 3 | Nécromancie | Artificier, Clerc, Druide, Paladin, Rôdeur
* **Slow** | Niv 3 | Transmutation | Ensorceleur, Magicien
* **Spirit Guardians** | Niv 3 | Invocation | Clerc
* **Tiny Hut (Leomund's)** | Niv 3 | Évocation | Barde, Magicien (Rituel)
* **Water Breathing** | Niv 3 | Transmutation | Artificier, Druide, Magicien, Rôdeur (Rituel)
* **Banishment** | Niv 4 | Abjuration | Clerc, Ensorceleur, Magicien, Occultiste, Paladin
* **Blight** | Niv 4 | Nécromancie | Druide, Ensorceleur, Magicien, Occultiste
* **Dimension Door** | Niv 4 | Invocation | Barde, Ensorceleur, Magicien, Occultiste
* **Greater Invisibility** | Niv 4 | Illusion | Barde, Ensorceleur, Magicien
* **Ice Storm** | Niv 4 | Évocation | Druide, Ensorceleur, Magicien
* **Polymorph** | Niv 4 | Transmutation | Barde, Druide, Ensorceleur, Magicien
* **Stone Shape** | Niv 4 | Transmutation | Artificier, Clerc, Druide, Magicien
* **Stoneskin** | Niv 4 | Abjuration | Artificier, Druide, Ensorceleur, Magicien, Rôdeur
* **Wall of Fire** | Niv 4 | Évocation | Druide, Ensorceleur, Magicien
* **Cloudkill** | Niv 5 | Invocation | Ensorceleur, Magicien
* **Cone of Cold** | Niv 5 | Évocation | Ensorceleur, Magicien
* **Flame Strike** | Niv 5 | Évocation | Clerc
* **Greater Restoration** | Niv 5 | Abjuration | Artificier, Barde, Clerc, Druide
* **Hold Monster** | Niv 5 | Enchantement | Barde, Ensorceleur, Magicien, Occultiste
* **Mass Cure Wounds** | Niv 5 | Évocation | Barde, Clerc, Druide
* **Raise Dead** | Niv 5 | Nécromancie | Barde, Clerc, Paladin
* **Scrying** | Niv 5 | Divination | Barde, Clerc, Druide, Occultiste, Magicien
* **Telekinesis** | Niv 5 | Transmutation | Ensorceleur, Magicien
* **Wall of Force** | Niv 5 | Évocation | Magicien
* **Chain Lightning** | Niv 6 | Évocation | Ensorceleur, Magicien
* **Disintegrate** | Niv 6 | Transmutation | Ensorceleur, Magicien
* **Globe of Invulnerability** | Niv 6 | Abjuration | Ensorceleur, Magicien
* **Harm** | Niv 6 | Nécromancie | Clerc
* **Heal** | Niv 6 | Évocation | Clerc, Druide
* **Heroes' Feast** | Niv 6 | Invocation | Clerc, Druide
* **True Seeing** | Niv 6 | Divination | Barde, Clerc, Ensorceleur, Magicien, Occultiste
* **Delayed Blast Fireball** | Niv 7 | Évocation | Ensorceleur, Magicien
* **Finger of Death** | Niv 7 | Nécromancie | Ensorceleur, Magicien, Occultiste
* **Fire Storm** | Niv 7 | Évocation | Clerc, Druide, Ensorceleur
* **Plane Shift** | Niv 7 | Invocation | Clerc, Druide, Ensorceleur, Magicien, Occultiste
* **Resurrection** | Niv 7 | Nécromancie | Barde, Clerc
* **Teleport** | Niv 7 | Invocation | Barde, Ensorceleur, Magicien
* **Antimagic Field** | Niv 8 | Abjuration | Clerc, Magicien
* **Demiplane** | Niv 8 | Invocation | Magicien, Occultiste
* **Dominate Monster** | Niv 8 | Enchantement | Barde, Ensorceleur, Magicien, Occultiste
* **Earthquake** | Niv 8 | Évocation | Clerc, Druide, Ensorceleur
* **Feeblemind / Befuddle** | Niv 8 | Enchantement | Barde, Druide, Occultiste, Magicien
* **Holy Aura** | Niv 8 | Abjuration | Clerc
* **Maze** | Niv 8 | Invocation | Magicien
* **Power Word Stun** | Niv 8 | Enchantement | Barde, Ensorceleur, Magicien, Occultiste
* **Sunburst** | Niv 8 | Évocation | Clerc, Druide, Ensorceleur, Magicien
* **Foresight** | Niv 9 | Divination | Barde, Druide, Occultiste, Magicien
* **Gate** | Niv 9 | Invocation | Clerc, Ensorceleur, Magicien
* **Mass Heal** | Niv 9 | Évocation | Clerc
* **Meteor Swarm** | Niv 9 | Évocation | Ensorceleur, Magicien
* **Power Word Kill** | Niv 9 | Enchantement | Barde, Ensorceleur, Magicien, Occultiste
* **Shapechange** | Niv 9 | Transmutation | Druide, Magicien
* **Time Stop** | Niv 9 | Transmutation | Ensorceleur, Magicien
* **True Polymorph** | Niv 9 | Transmutation | Barde, Occultiste, Magicien
* **Wish** | Niv 9 | Invocation | Ensorceleur, Magicien

### C. Xanathar's Guide to Everything (`XGE`)

#### Tours de magie (Niveau 0)
* **Control Flames** | Niv 0 | Transmutation | Druide, Ensorceleur, Magicien
* **Create Bonfire** | Niv 0 | Invocation | Artificier, Druide, Ensorceleur, Magicien, Occultiste
* **Frostbite** | Niv 0 | Évocation | Artificier, Druide, Ensorceleur, Magicien, Occultiste
* **Gust** | Niv 0 | Transmutation | Druide, Ensorceleur, Magicien
* **Infestation** | Niv 0 | Invocation | Druide, Ensorceleur, Magicien, Occultiste
* **Magic Stone** | Niv 0 | Transmutation | Artificier, Druide, Occultiste
* **Mold Earth** | Niv 0 | Transmutation | Druide, Ensorceleur, Magicien
* **Primal Savagery** | Niv 0 | Transmutation | Druide
* **Shape Water** | Niv 0 | Transmutation | Druide, Ensorceleur, Magicien
* **Thunderclap** | Niv 0 | Évocation | Artificier, Barde, Druide, Ensorceleur, Magicien, Occultiste
* **Toll the Dead** | Niv 0 | Nécromancie | Clerc, Magicien, Occultiste
* **Word of Radiance** | Niv 0 | Évocation | Clerc

#### Niveau 1
* **Absorb Elements** | Niv 1 | Abjuration | Artificier, Druide, Magicien, Rôdeur
* **Beast Bond** | Niv 1 | Divination | Druide, Rôdeur
* **Catapult** | Niv 1 | Transmutation | Artificier, Ensorceleur, Magicien
* **Cause Fear** | Niv 1 | Nécromancie | Magicien, Occultiste
* **Ceremony** | Niv 1 | Évocation | Clerc, Paladin (Rituel)
* **Chaos Bolt** | Niv 1 | Évocation | Ensorceleur
* **Ice Knife** | Niv 1 | Invocation | Druide, Ensorceleur, Magicien
* **Snare** | Niv 1 | Abjuration | Artificier, Druide, Magicien, Rôdeur
* **Unearthly Chorus** | Niv 1 | Illusion | Barde
* **Zephyr Strike** | Niv 1 | Transmutation | Rôdeur

#### Niveaux 2 à 9
* **Dragon's Breath** | Niv 2 | Transmutation | Ensorceleur, Magicien
* **Healing Spirit** | Niv 2 | Invocation | Druide, Rôdeur
* **Mind Spike** | Niv 2 | Divination | Ensorceleur, Occultiste, Magicien
* **Shadow Blade** | Niv 2 | Illusion | Ensorceleur, Occultiste, Magicien
* **Warding Wind** | Niv 2 | Évocation | Barde, Druide, Ensorceleur
* **Catnap** | Niv 3 | Enchantement | Artificier, Barde, Ensorceleur, Magicien
* **Enemies Abound** | Niv 3 | Enchantement | Barde, Ensorceleur, Occultiste, Magicien
* **Life Transference** | Niv 3 | Nécromancie | Clerc, Magicien
* **Thunder Step** | Niv 3 | Invocation | Ensorceleur, Occultiste, Magicien
* **Tiny Servant** | Niv 3 | Transmutation | Artificier, Magicien
* **Charm Monster** | Niv 4 | Enchantement | Barde, Druide, Ensorceleur, Occultiste, Magicien
* **Shadow of Moil** | Niv 4 | Nécromancie | Occultiste
* **Sickening Radiance** | Niv 4 | Évocation | Ensorceleur, Occultiste, Magicien
* **Synaptic Static** | Niv 5 | Enchantement | Barde, Ensorceleur, Occultiste, Magicien
* **Dawn** | Niv 5 | Évocation | Clerc, Magicien
* **Danse Macabre** | Niv 5 | Nécromancie | Occultiste, Magicien
* **Mental Prison** | Niv 6 | Illusion | Ensorceleur, Occultiste, Magicien
* **Scatter** | Niv 6 | Invocation | Ensorceleur, Occultiste, Magicien
* **Soul Cage** | Niv 6 | Nécromancie | Occultiste, Magicien
* **Crown of Stars** | Niv 7 | Évocation | Ensorceleur, Occultiste, Magicien
* **Temple of the Gods** | Niv 7 | Invocation | Clerc
* **Whirlwind** | Niv 7 | Évocation | Druide, Magicien
* **Abi-Dalzim's Horrid Wilting** | Niv 8 | Nécromancie | Ensorceleur, Magicien
* **Illusionary Dragon** | Niv 8 | Illusion | Magicien
* **Maddening Darkness** | Niv 8 | Évocation | Occultiste, Magicien
* **Mass Polymorph** | Niv 9 | Transmutation | Barde, Ensorceleur, Magicien
* **Psychic Scream** | Niv 9 | Enchantement | Barde, Ensorceleur, Occultiste, Magicien

### D. Tasha's Cauldron of Everything (`TCE`)

#### Tours de magie (Niveau 0)
* **Booming Blade** | Niv 0 | Évocation | Artificier, Ensorceleur, Magicien, Occultiste
* **Green-Flame Blade** | Niv 0 | Évocation | Artificier, Ensorceleur, Magicien, Occultiste
* **Lightning Lure** | Niv 0 | Évocation | Artificier, Ensorceleur, Magicien, Occultiste
* **Mind Sliver** | Niv 0 | Enchantement | Ensorceleur, Magicien, Occultiste
* **Sword Burst** | Niv 0 | Invocation | Artificier, Ensorceleur, Magicien, Occultiste

#### Niveau 1
* **Tasha's Caustic Brew** | Niv 1 | Évocation | Artificier, Ensorceleur, Magicien

#### Niveaux 2 à 9
* **Summon Beast** | Niv 2 | Invocation | Druide, Rôdeur
* **Tasha's Mind Whip** | Niv 2 | Enchantement | Ensorceleur, Magicien
* **Summon Fey** | Niv 3 | Invocation | Druide, Rôdeur, Occultiste, Magicien
* **Summon Shadowspawn** | Niv 3 | Invocation | Occultiste, Magicien
* **Summon Undead** | Niv 3 | Nécromancie | Occultiste, Magicien
* **Summon Aberration** | Niv 4 | Invocation | Occultiste, Magicien
* **Summon Construct** | Niv 4 | Invocation | Artificier, Magicien
* **Summon Elemental** | Niv 4 | Invocation | Druide, Rôdeur, Magicien
* **Summon Celestial** | Niv 5 | Invocation | Clerc, Paladin
* **Summon Fiend** | Niv 6 | Invocation | Occultiste, Magicien
* **Tasha's Otherworldly Guise** | Niv 6 | Transmutation | Ensorceleur, Occultiste, Magicien
* **Dream of the Blue Veil** | Niv 7 | Invocation | Barde, Ensorceleur, Magicien
* **Blade of Disaster** | Niv 9 | Invocation | Ensorceleur, Occultiste, Magicien

### E. Fizban's Treasury of Dragons (`FToD`)
* **Draconic Transformation** | Niv 7 | Transmutation | Druide, Ensorceleur, Magicien
* **Fizban's Platinum Shield** | Niv 6 | Abjuration | Ensorceleur, Magicien
* **Nathair's Mischief** | Niv 2 | Illusion | Barde, Ensorceleur, Magicien
* **Raulothim's Psychic Lance** | Niv 4 | Enchantement | Barde, Ensorceleur, Occultiste, Magicien
* **Rime's Binding Ice** | Niv 2 | Évocation | Ensorceleur, Magicien
* **Summon Draconic Spirit** | Niv 5 | Invocation | Druide, Ensorceleur, Magicien

### F. Strixhaven: A Curriculum of Chaos (`SCC`)
* **Borrow Experience** | Niv 2 | Divination | Barde, Clerc, Druide, Ensorceleur, Magicien
* **Kinetic Jaunt** | Niv 2 | Transmutation | Artificier, Barde, Ensorceleur, Magicien
* **Silvery Barbs** | Niv 1 | Enchantement | Barde, Ensorceleur, Magicien
* **Vortex Warp** | Niv 2 | Invocation | Artificier, Ensorceleur, Magicien
* **Wither and Bloom** | Niv 2 | Nécromancie | Druide, Ensorceleur, Magicien

## 1. Dons (Feats) - Arcana Unleashed

### Dons d'Origine (Origin Feats - Niveau 1)
* **Arcane Infiltrator** | Niveau 1 | Origine | Aucun prérequis. Lié à la faction Ninth Quill. Maîtrise de la compétence Discrétion ou Escamotage et des outils de voleur. Permet d'étouffer les composantes verbales des sorts de niveau 1 ou des tours de magie pour les lancer sans bruit perceptible.
* **Bejeweled Courtier** | Niveau 1 | Origine | Aucun prérequis. Lié au Bejeweled Conclave. Avantage aux jets d'Intuition et de Persuasion contre les créatures sous l'influence d'un enchantement, et résistance aux états Charmé.
* **Cosmic Touched** | Niveau 1 | Origine | Aucun prérequis. Issu des Bringers of Cosmic Dawn. Déplacement augmenté de 1,5 m et résistance aux dégâts radiants ou de force.
* **Crypt Initiate** | Niveau 1 | Origine | Aucun prérequis. Lié au Covenant of the Grave. Vous apprenez le cantrip *Chill Touch* ou *Spare the Dying*, et gagnez l'avantage aux sauvegardes contre les maladies et les effets nécrotiques.
* **Familiar Bonded** | Niveau 1 | Origine | Aucun prérequis. Vous apprenez le sort *Find Familiar* et pouvez le lancer comme rituel sans consommer de composantes matérielles. Votre familier gagne des PV temporaires égaux à votre bonus de maîtrise après un repos.
* **Planar Seeker** | Niveau 1 | Origine | Aucun prérequis. Lié aux Horizon Weavers. Vous connaissez toujours la direction du portail ou de la faille planaire la plus proche à moins de 1,5 km et gagnez la résistance aux dégâts de force.
* **Storm Chaser** | Niveau 1 | Origine | Aucun prérequis. Lié aux Crucible Keepers. Résistance aux dégâts de foudre ou de tonnerre, et votre vitesse ne peut être réduite par des vents magiques ou non magiques.
* **Tenebrous Trickster** | Niveau 1 | Origine | Aucun prérequis. Lié au Phantasmic Circus. Vous apprenez le cantrip *Minor Illusion*. Lorsque vous lancez une illusion, vous pouvez vous désengager en action bonus.
* **Tide & Sky Diviner** | Niveau 1 | Origine | Aucun prérequis. Lié aux Seers of Sea and Sky. Prévision météo et avantage sur les jets de Survie et Perception en mer ou sous ciel ouvert.
* **Sheltering Ward** | Niveau 1 | Origine | Aucun prérequis. Lié aux Sheltering Hands. Action bonus pour conférer un abri protecteur accordant des PV temporaires (1d4 + bonus de maîtrise) à un allié adjacent.

### Style de Combat (Fighting Style Feat)
* **Arcane Warrior** | Niveau 1 | Style de Combat | Aptitude de Style de Combat requise. Vous apprenez deux cantrips de la liste du Magicien. Ils comptent comme des sorts de votre classe de combattant et utilisent votre caractéristique d'incantation ou de combat pour le jet.

### Dons Généraux (General Feats - Niveau 4+)
* **Battle Familiar Master** | Niveau 4 | Général | Capacité à invoquer un familier. +1 Intelligence, Sagesse ou Charisme. Permet à votre familier d'attaquer directement en utilisant votre bonus d'attaque et de délivrer des sorts avec une portée allant jusqu'à 9 mètres au lieu du contact strict.
* **Chain-Cast Specialist** | Niveau 4 | Général | Capacité à lancer des sorts. +1 Caractéristique d'incantation. Lorsque vous ciblez une créature unique avec un sort de niveau 1 à 3, vous pouvez dépenser votre réaction pour propager une décharge secondaire sur une cible adjacente à 3m.
* **Eldritch Resonance** | Niveau 4 | Général | Charisme ou Intelligence 13+. +1 Caractéristique. Vos sorts infligeant des dégâts de force repoussent la cible de 1,5 m et font vibrer les créatures invisibles à 6m, annulant leur invisibilité jusqu'à la fin de votre tour.
* **Fulgurant Striker** | Niveau 4 | Général | Maîtrise des armes de guerre. +1 Force ou Dextérité. Vos attaques avec une arme infligent 1d4 dégâts de foudre ou tonnerre supplémentaires, et sur un coup critique la cible est assourdie et ne peut utiliser de réactions.
* **Grave Walker** | Niveau 4 | Général | +1 Sagesse ou Intelligence. Vous ignorez les terrains difficiles causés par des ossements, tombes ou sorts de nécromancie. Vous êtes immunisé contre la peur infligée par les morts-vivants.
* **High-Magic Adept** | Niveau 4 | Général | Niveau 4+, lanceur de sorts. +1 Caractéristique d'incantation. Vous apprenez un sort de niveau 1 et un sort de niveau 2 de l'école de magie associée à votre faction que vous pouvez lancer une fois sans dépenser d'emplacement par repos long.
* **Living Spell Binder** | Niveau 4 | Général | Capacité à lancer des sorts de niveau 3+. +1 Intelligence ou Charisme. Vous gagnez l'avantage aux sauvegardes contre les sorts de zone et pouvez capturer l'énergie d'un sort contré pour regagner un emplacement de niveau 1.
* **Mana Shaper** | Niveau 4 | Général | Capacité à lancer des sorts. +1 Caractéristique d'incantation. Permet de modifier le type de dégâts élémentaires d'un sort préparé (ex: Feu en Foudre ou Froid en Acide) un nombre de fois égal à votre bonus de maîtrise par repos long.
* **Ninth Quill Operative** | Niveau 4 | Général | Dextérité ou Intelligence 13+. +1 DEX ou INT. Avantage aux tests pour déjouer les glyphes, pièges magiques et alarmes. Les sorts de détection ne révèlent pas votre aura magique.
* **Resilient Concentration** | Niveau 4 | Général | Capacité à lancer des sorts. +1 Constitution. Lorsque vous subissez des dégâts inférieurs ou égaux à 20, le DD de votre jet de sauvegarde de Constitution pour maintenir la concentration est fixé au minimum à 10 sans augmenter.
* **Spellblade Mastery** | Niveau 4 | Général | Maîtrise d'une arme de guerre et sorts. +1 Force ou Dextérité. Permet de canaliser un sort d'action en une attaque d'arme unique dans le même tour.
* **Unbounded Conduit** | Niveau 4 | Général | Capacité à lancer des sorts. +1 Caractéristique d'incantation. Vos sorts à distance ne souffrent d'aucun désavantage au corps-à-corps, et vous pouvez exclure votre propre case de la zone d'effet de vos sorts.
* **Veil Piercer** | Niveau 4 | Général | Sagesse ou Intelligence 13+. +1 Sagesse ou Intelligence. Vous détectez automatiquement les illusions visuelles à moins de 9 mètres sans nécessiter de test d'Investigation préalable.
* **Vestige Conduit** | Niveau 4 | Général | Niveau 4+. +1 Caractéristique. Harmonisation avec des entités déchues accordant une réserve d'énergie nécrotique ou psychique réutilisable après un repos court.
* **Weave Sentinel** | Niveau 4 | Général | Niveau 4+, capacité à lancer des sorts. +1 Caractéristique d'incantation. Vous pouvez lancer *Counterspell* ou *Dispel Magic* avec une portée accrue de 9 mètres.

### Dons de Bénédiction Épique (Epic Boons - Niveau 19+)
* **Boon of the Archmage** | Niveau 19 | Épique | Niveau 19+, lanceur de sorts. Le DD de vos sorts et votre bonus d'attaque de sort augmentent de +1. Vous gagnez un emplacement de sort additionnel de niveau 5.
* **Boon of Living Weave** | Niveau 19 | Épique | Niveau 19+. Vous devenez un conduit vivant : vous régénérez 10 PV au début de chacun de vos tours tant que vous maintenez votre concentration sur un sort.
* **Boon of the Spell Sovereign** | Niveau 19 | Épique | Niveau 19+. Une fois par repos long, vous pouvez maintenir votre concentration sur deux sorts simultanément pendant un maximum de 1 minute.

---

## 2. Sorts (Spells) - Arcana Unleashed

### Tours de magie (Niveau 0)
* **Aetheric Dart** | Niv 0 | Évocation | 1 action | 36m | V, S | Instantanée | Non | Non | Flèche d'énergie pure infligeant 1d8 dégâts de force sur attaque à distance. Ignore les abris partiels. Évolution : 2d8 (niv 5), 3d8 (niv 11), 4d8 (niv 17). | Artificier, Ensorceleur, Magicien
* **Echoing Slash** | Niv 0 | Évocation | 1 action | 1,5m | S, M (une arme) | 1 round | Non | Non | Frappe avec une arme. Si la cible bouge ou lance un sort avant votre prochain tour, vibration résiduelle infligeant 1d6 dégâts de tonnerre. Évolution : dégâts accrus aux niveaux 5, 11 et 17. | Barde, Occultiste, Magicien
* **Festering Blast** | Niv 0 | Nécromancie | 1 action | 18m | V, S | Instantanée | Non | Non | Éclat morbide infligeant 1d8 dégâts nécrotiques. Si la cible a déjà subi des dégâts ce tour, elle ne peut pas utiliser de réaction jusqu'à son prochain tour. Évolution : 2d8, 3d8, 4d8. | Clerc, Occultiste, Magicien
* **Glacial Grasp** | Niv 0 | Transmutation | 1 action | Contact | V, S | Instantanée | Non | Non | Frappe de givre au corps-à-corps infligeant 1d10 dégâts de froid et réduisant la vitesse ennemie de 4,5 mètres. Évolution : 2d10, 3d10, 4d10. | Druide, Ensorceleur, Magicien
* **Radiant Tether** | Niv 0 | Évocation | 1 action | 18m | V, S | Concentration 1 min | Oui | Non | Rayon d'or sacré infligeant 1d6 dégâts radiants. Empêche la cible d'emprunter une téléportation sans subir 1d6 dégâts supplémentaires. Évolution : 2d6, 3d6, 4d6. | Clerc, Paladin

### Niveau 1
* **Aegis of the Unleashed** | Niv 1 | Abjuration | 1 action bonus | Personnelle | V, S | 1 minute | Non | Non | Barrière cinétique absorbant 10 dégâts physiques avant d'exploser dans une onde de choc repoussant les créatures adjacentes de 1,5m (sauvegarde For). | Artificier, Ensorceleur, Magicien, Paladin
* **Chrono-Flicker** | Niv 1 | Transmutation | 1 réaction | Personnelle | S | Instantanée | Non | Non | Déphasage temporel bref : ajoute +1d6 au résultat d'une sauvegarde ou à votre CA contre une attaque unique. | Ensorceleur, Magicien
* **Gravitic Well** | Niv 1 | Transmutation | 1 action | 27m | V, S, M | Concentration 1 min | Oui | Non | Puits gravitationnel de 4,5m de rayon. Vitesse divisée par deux et 2d6 dégâts contondants si une créature saute ou chute dans la zone. | Magicien, Occultiste
* **Luminescent Ward** | Niv 1 | Abjuration | 1 action | Contact | V, S | 8 heures | Non | Non | Protège un allié : la première attaque réussie contre lui inflige 2d8 dégâts radiants à l'assaillant et l'aveugle pour 1 round (sauvegarde Con). | Barde, Clerc, Druide
* **Sylvan Surge** | Niv 1 | Invocation | 1 action bonus | Contact | V, S | Instantanée | Non | Non | Rend 1d6 + modificateur d'incantation PV et permet à la cible de se désengager immédiatement sans dépenser d'action. | Druide, Rôdeur

### Niveaux 2 à 4
* **Battle Familiar** | Niv 2 | Invocation | 1 action | 9m | V, S, M | Concentration 1 heure | Oui | Non | Invoque ou renforce un familier de combat capable d'attaquer directement en utilisant votre caractéristique d'incantation et de subir des dégâts à votre place. | Druide, Occultiste, Magicien
* **Distorted Distance** | Niv 4 | Illusion | 1 action | 36m | V, S, M | Concentration 1 min | Oui | Non | Sphère de 18m altérant l'espace. Vous choisissez par créature : soit élongation (sauvegarde Int, 2d10 dégâts psychiques et terrain difficile), soit raccourcissement (+6m de vitesse). | Barde, Ensorceleur, Magicien
* **Maelstrom of Blades** | Niv 4 | Invocation | 1 action | 18m | V, S, M | Concentration 1 min | Oui | Non | Cyclone de lames d'acier magiques de 6m de rayon infligeant 5d10 dégâts tranchants magiques aux créatures entrant ou y commençant leur tour. | Barde, Magicien, Occultiste
* **Rupture Arcana** | Niv 3 | Évocation | 1 action | 36m | V, S | Instantanée | Non | Non | Explosion arcanique de 6m de rayon : 6d6 dégâts de force (sauvegarde Dex) et annule tout effet de sort de niveau 2 ou inférieur sur les cibles touchées. | Ensorceleur, Magicien

### Niveaux 5 à 9
* **Aura of Evasion** | Niv 7 | Abjuration | 1 action | Personnelle (rayon 9m) | V, S | Concentration 10 min | Oui | Non | Aura protectrice conférant l'aptitude Évasion (aucun dégât sur sauvegarde Dex réussie, demi-dégâts sur échec) à vous et à tous vos alliés dans le rayon. | Ensorceleur, Occultiste, Magicien
* **Cataclysmic Rift** | Niv 9 | Invocation | 1 action | 90m | V, S | Concentration 1 min | Oui | Non | Déchire la réalité sur une faille de 18m : 10d10 force + 10d10 nécrotique (sauvegarde Dex) et interdiction totale de magie planaire ou de téléportation dans la zone. | Ensorceleur, Magicien, Occultiste
* **Detonate** | Niv 6 | Évocation | 1 action | 36m | V, S, M | Instantanée | Non | Non | Surcharge l'énergie interne d'une créature ou d'un objet magique : 8d8 dégâts de force + 4d8 dégâts de feu en sphère de 6m (sauvegarde Con). | Ensorceleur, Magicien
* **Fractured Awareness** | Niv 6 | Enchantement | 1 action | 27m | V, S | Concentration 1 min | Oui | Non | Fragmente l'esprit de jusqu'à 3 cibles : sauvegarde Int sous peine de ne pouvoir entreprendre qu'une action ou un mouvement (pas les deux), sans action bonus ni réaction. | Barde, Ensorceleur, Magicien
* **Grave Ground** | Niv 5 | Nécromancie | 1 action | 36m | V, S, M | Concentration 1 min | Oui | Non | Quatre zones carrées de 3m où des mains squelettiques agrippent les ennemis (sauvegarde For, entravé, terrain difficile) et infligent 4d6 dégâts nécrotiques par tour. | Clerc, Occultiste, Magicien
* **Iron Body** | Niv 8 | Transmutation | 1 action | Personnelle | V, S, M | Concentration 1 heure | Oui | Non | Votre corps devient de l'acier vivant : immunité aux dégâts de poison/foudre, résistance aux dégâts physiques non magiques, +4 en Force et frappes à mains nues infligeant 2d10. | Magicien, Ensorceleur
* **Spirit Lantern** | Niv 5 | Nécromancie | 1 action | 18m | V, S, M | Concentration 10 min | Oui | Non | Lanterne spectrale aspirant l'énergie vitale ennemie (3d8 nécrotique par round) tout en soignant les alliés ou serviteurs morts-vivants dans son rayon lumineux. | Clerc, Occultiste, Magicien
* **Wail of the Banshee** | Niv 9 | Nécromancie | 1 action | Personnelle (rayon 9m) | V | Instantanée | Non | Non | Cri spectral terrifiant : toutes les créatures hostiles dans le rayon doivent réussir une sauvegarde de Con sous peine de tomber instantanément à 0 PV (ou subir 10d10 nécrotique sur réussite). | Occultiste, Magicien
* **Waves of Exhaustion** | Niv 5 | Nécromancie | 1 action bonus | Personnelle | V, S | Concentration 1 min | Oui | Non | Active une aura permettant d'émettre par action magique un cône de 18m imposant un niveau d'épuisement et divisant la vitesse par deux (sauvegarde Con). | Ensorceleur, Occultiste, Magicien

---

## 4. Instructions de Déploiement pour l'Agent

1. Mettre à jour `SourceBook` avec les 9 codes répertoriés (`PHB_2024`, `PHB_2014`, `XGE`, `TCE`, `SCAG`, `FToD`, `SCC`, `BGG`, `UA_PLAYTEST`).
2. Pour chaque don : persister dans la table `Feat` en liant son `sourceBookId` respectif.
3. Pour chaque sort : persister dans la table `Spell` en liant son `sourceBookId` respectif et le tableau `classes: string[]`.
4. Dans `CharacterWizard.tsx`, l'étape de sélection des sorts au niveau 1 filtre les sorts via `spell.classes.includes(selectedClass) && (campaignActiveSourceBooks.includes(spell.sourceBookId))`.
5. Valider avec `npm run typecheck`, `npm test` et `npm run build`.