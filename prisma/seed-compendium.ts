import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();

const species = [
  { slug: "human", name: "Humain", traits: ["Versatile", "Resourceful"], subspecies: ["standard", "variant"] },
  { slug: "aasimar", name: "Aasimar", traits: ["Celestial Resistance", "Darkvision"], subspecies: ["celestial", "radiant", "necrotic"] },
  { slug: "dragonborn", name: "Dragonborn", traits: ["Draconic Ancestry", "Breath Weapon"], subspecies: ["chromatic", "metallic", "gem"] },
  { slug: "elf", name: "Elfe", traits: ["Darkvision", "Keen Senses", "Fey Ancestry"], subspecies: ["high", "wood", "drow"] },
  { slug: "dwarf", name: "Nain", traits: ["Darkvision", "Dwarven Resilience"], subspecies: ["hill", "mountain"] },
  { slug: "halfling", name: "Halfelin", traits: ["Brave", "Lucky"], subspecies: ["lightfoot", "stout"] },
  { slug: "gnome", name: "Gnome", traits: ["Gnome Cunning"], subspecies: ["forest", "rock"] },
  { slug: "goliath", name: "Goliath", traits: ["Powerful Build"], subspecies: ["cloud", "hill", "fire", "frost", "stone", "storm"] },
  { slug: "orc", name: "Orc", traits: ["Adrenaline Rush", "Relentless Endurance"], subspecies: ["standard"] },
  { slug: "tiefling", name: "Tieffelin", traits: ["Darkvision", "Fiendish Legacy"], subspecies: ["abyssal", "chthonic", "infernal"] },
  { slug: "gith", name: "Gith", traits: ["Astral Knowledge"], subspecies: ["githyanki", "githzerai"] },
] as const;

const lineageNames: Record<string, string> = {
  standard: "Standard",
  variant: "Variante",
  celestial: "Céleste",
  radiant: "Radieuse",
  necrotic: "Nécrotique",
  chromatic: "Chromatique",
  metallic: "Métallique",
  gem: "Gemme",
  high: "Haut-Elfe",
  wood: "Elfe des Bois",
  drow: "Drow",
  hill: "Des Collines",
  mountain: "Des Montagnes",
  lightfoot: "Pied-léger",
  stout: "Robuste",
  forest: "Des Forêts",
  rock: "Des Roches",
  cloud: "Nuages",
  fire: "Feu",
  frost: "Givre",
  stone: "Pierre",
  storm: "Tempête",
  abyssal: "Abyssal",
  chthonic: "Chthonique",
  infernal: "Infernal",
  githyanki: "Githyanki",
  githzerai: "Githzerai",
};

const feats = [
  ["alert", "Alerte"],
  ["crafter", "Artisan"],
  ["lucky", "Chanceux"],
  ["magic-initiate", "Initiation à la magie"],
  ["savage-attacker", "Attaquant sauvage"],
  ["skilled", "Doué"],
  ["tough", "Robuste"],
  ["healer", "Guérisseur"],
  ["musician", "Musicien"],
  ["tavern-brawler", "Bagarreur de taverne"],
  ["war-caster", "Mage de guerre"],
  ["sentinel", "Sentinelle"],
  ["great-weapon-master", "Maître d'armes"],
  ["sharpshooter", "Tireur d'élite"],
  ["fey-touched", "Touché par les fées"],
  ["shadow-touched", "Touché par les ombres"],
  ["resilient", "Résilient"],
  ["polearm-master", "Maître des armes d'hast"],
  ["mobile", "Mobile"],
  ["actor", "Acteur"],
  ["dual-wielder", "Expert du combat à deux armes"],
] as const;

const backgrounds = [
  ["acolyte", "Acolyte", ["intelligence", "wisdom", "charisma"], "magic-initiate"],
  ["artisan", "Artisan", ["strength", "dexterity", "intelligence"], "crafter"],
  ["criminal", "Criminel", ["dexterity", "constitution", "intelligence"], "alert"],
  ["guide", "Guide", ["dexterity", "constitution", "wisdom"], "magic-initiate"],
  ["soldier", "Soldat", ["strength", "dexterity", "constitution"], "savage-attacker"],
  ["sage", "Érudit", ["constitution", "intelligence", "wisdom"], "magic-initiate"],
  ["noble", "Noble", ["strength", "intelligence", "charisma"], "skilled"],
  ["charlatan", "Charlatan", ["dexterity", "intelligence", "charisma"], "lucky"],
  ["farmer", "Fermier", ["strength", "constitution", "wisdom"], "tough"],
  ["guard", "Garde", ["strength", "intelligence", "wisdom"], "alert"],
  ["merchant", "Marchand", ["constitution", "intelligence", "charisma"], "lucky"],
  ["pilgrim", "Pèlerin", ["constitution", "wisdom", "charisma"], "tough"],
] as const;

const classes = [
  ["barbarian", "Barbare", 12, ["strength", "constitution"], 2, ["athletics", "animalHandling", "intimidation", "nature", "perception", "survival"]],
  ["bard", "Barde", 8, ["dexterity", "charisma"], 3, ["acrobatics", "deception", "history", "insight", "intimidation", "investigation", "perception", "performance", "persuasion", "sleightOfHand", "stealth"]],
  ["cleric", "Clerc", 8, ["wisdom", "charisma"], 2, ["history", "insight", "medicine", "persuasion", "religion"]],
  ["druid", "Druide", 8, ["intelligence", "wisdom"], 2, ["arcana", "animalHandling", "insight", "medicine", "nature", "perception", "religion", "survival"]],
  ["fighter", "Guerrier", 10, ["strength", "constitution"], 2, ["acrobatics", "animalHandling", "athletics", "history", "insight", "intimidation", "perception", "survival"]],
  ["monk", "Moine", 8, ["strength", "dexterity"], 2, ["acrobatics", "athletics", "history", "insight", "religion", "stealth"]],
  ["paladin", "Paladin", 10, ["wisdom", "charisma"], 2, ["athletics", "insight", "intimidation", "medicine", "persuasion", "religion"]],
  ["ranger", "Rôdeur", 10, ["strength", "dexterity"], 3, ["animalHandling", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"]],
  ["rogue", "Roublard", 8, ["dexterity", "intelligence"], 4, ["acrobatics", "athletics", "deception", "insight", "intimidation", "investigation", "perception", "performance", "persuasion", "sleightOfHand", "stealth"]],
  ["sorcerer", "Ensorceleur", 6, ["constitution", "charisma"], 2, ["arcana", "deception", "insight", "intimidation", "persuasion", "religion"]],
  ["warlock", "Occultiste", 8, ["wisdom", "charisma"], 2, ["arcana", "deception", "history", "intimidation", "investigation", "nature", "religion"]],
  ["wizard", "Magicien", 6, ["intelligence", "wisdom"], 2, ["arcana", "history", "insight", "investigation", "medicine", "religion"]],
  ["artificer", "Artificier", 8, ["constitution", "intelligence"], 2, ["arcana", "history", "investigation", "medicine", "nature", "perception", "sleightOfHand"]],
] as const;

const skillDefinitions = [
  ["ATHLETICS", "Athlétisme", "STRENGTH", "Escalader des parois escarpées, sauter par-dessus un gouffre, nager à contre-courant, lutter au corps-à-corps ou forcer une porte bloquée.", "Escalade, saut, nage, lutte et épreuves de force appliquée."],
  ["ACROBATICS", "Acrobaties", "DEXTERITY", "Garder l'équilibre sur une corniche étroite ou une corde, réaliser des cabrioles et atterrir gracieusement après une chute.", "Équilibre, réception, roulade et mouvements aériens."],
  ["SLEIGHT_OF_HAND", "Escamotage", "DEXTERITY", "Faire disparaître un objet dans sa manche, dérober une bourse à la ceinture, crocheter discrètement ou dissimuler une dague.", "Dissimulation, larcin, manipulation fine et tours de passe-passe."],
  ["STEALTH", "Discrétion", "DEXTERITY", "Se déplacer sans bruit, se faufiler dans les ombres et échapper aux gardes en évitant d'être vu ou entendu.", "Infiltration, camouflage, filature et déplacement silencieux."],
  ["ARCANA", "Arcanes", "INTELLIGENCE", "Connaissance des sorts, des objets magiques, des symboles arcaniques, des traditions magiques et des plans d'existence.", "Identifier un sort, comprendre un rituel ou reconnaître un objet magique."],
  ["HISTORY", "Histoire", "INTELLIGENCE", "Connaissance des événements historiques, légendes anciennes, dynasties régnantes, guerres passées et civilisations disparues.", "Se souvenir d'une guerre, d'une lignée, d'un royaume ou d'une tradition ancienne."],
  ["INVESTIGATION", "Investigation", "INTELLIGENCE", "Déduire un mécanisme caché, repérer des indices dissimulés, déterminer le point de rupture d'un mur et fouiller méthodiquement.", "Recherche d'indices, déduction, fouille et analyse d'un dispositif."],
  ["NATURE", "Nature", "INTELLIGENCE", "Connaissance de la faune, de la flore, des climats, des terrains sauvages et des créatures naturelles.", "Identifier une plante, prévoir la météo ou reconnaître une trace animale."],
  ["RELIGION", "Religion", "INTELLIGENCE", "Connaissance des divinités, panthéons, rituels sacrés, hiérarchies cléricales et symboles religieux.", "Reconnaître un symbole, comprendre un rite ou se rappeler une doctrine."],
  ["ANIMAL_HANDLING", "Dressage", "WISDOM", "Calmer une bête sauvage paniquée, contrôler sa monture lors d'un combat ou entraîner un animal familier.", "Apaiser, guider, dresser ou contrôler un animal."],
  ["INSIGHT", "Intuition", "WISDOM", "Détecter le mensonge et évaluer les intentions réelles d'un interlocuteur par son langage corporel et le ton de sa voix.", "Lire une émotion, repérer une omission ou jauger la sincérité."],
  ["MEDICINE", "Médecine", "WISDOM", "Stabiliser un mourant aux portes de la mort, diagnostiquer une maladie et identifier un poison mortel.", "Premiers secours, diagnostic, autopsie et identification d'un mal."],
  ["PERCEPTION", "Perception", "WISDOM", "Voir ou entendre des créatures en embuscade, repérer un danger avant qu'il ne frappe et remarquer un détail sensoriel.", "Vigilance, écoute, observation et détection des dangers."],
  ["SURVIVAL", "Survie", "WISDOM", "Suivre des pistes dans la boue ou la neige, trouver de l'eau et de la nourriture en milieu hostile et s'orienter sans repères.", "Pistage, orientation, recherche de ressources et adaptation au terrain."],
  ["DECEPTION", "Tromperie", "CHARISMA", "Raconter un mensonge crédible, dissimuler ses véritables motifs et négocier sous une fausse identité.", "Mensonge, déguisement social, bluff et faux-semblant."],
  ["INTIMIDATION", "Intimidation", "CHARISMA", "Menacer physiquement ou verbalement un prisonnier et forcer un garde à reculer par sa simple présence.", "Menace, coercition, pression et démonstration de puissance."],
  ["PERFORMANCE", "Représentation", "CHARISMA", "Raconter une épopée dans une taverne, jouer d'un instrument, émouvoir une foule ou captiver l'attention d'une cour.", "Musique, théâtre, danse, récit et expression publique."],
  ["PERSUASION", "Persuasion", "CHARISMA", "Négocier une alliance diplomatique, convaincre un marchand réticent et rallier des alliés avec bienveillance.", "Diplomatie, négociation, argumentation et influence honnête."],
] as const;

const subclassNames: Record<string, string[]> = {
  barbarian: ["Berserker", "Magie sauvage", "Bête", "Zélote", "Gardien ancestral", "Guerrier totem"],
  bard: ["Savoir", "Courage", "Glamour", "Épées", "Éloquence", "Création"],
  cleric: ["Vie", "Lumière", "Tromperie", "Guerre", "Forge", "Tombe", "Paix", "Crépuscule"],
  druid: ["Terre", "Lune", "Berger", "Spores", "Étoiles", "Feu sauvage"],
  fighter: ["Champion", "Maître de bataille", "Chevalier occulte", "Samouraï", "Archer arcanique", "Guerrier psi", "Chevalier runique"],
  monk: ["Main ouverte", "Ombre", "Quatre éléments", "Kensei", "Âme solaire", "Miséricorde", "Moi astral"],
  paladin: ["Dévotion", "Anciens", "Vengeance", "Conquête", "Rédemption", "Gloire", "Veilleurs"],
  ranger: ["Chasseur", "Maître des bêtes", "Traqueur des ténèbres", "Marcheur de l'horizon", "Tueur de monstres", "Voyageur féerique", "Gardien d'essaim"],
  rogue: ["Voleur", "Assassin", "Filou arcanique", "Inquisiteur", "Maître espion", "Éclaireur", "Scélérat", "Fantôme", "Âme acérée"],
  sorcerer: ["Lignée draconique", "Magie sauvage", "Âme divine", "Ombre", "Esprit aberrant", "Âme mécanique"],
  warlock: ["Fiélon", "Grand Ancien", "Archifée", "Céleste", "Lame maudite", "Abysses", "Génie"],
  wizard: ["Abjuration", "Évocation", "Divination", "Nécromancie", "Transmutation", "Magie de guerre", "Lames dansantes", "Chronurgie", "Graviturgy"],
  artificer: ["Alchimiste", "Armurier", "Artilleur", "Forgeron de bataille"],
};

const sourceBooks = [
  ["PHB_2014", "Player's Handbook 2014", true],
  ["PHB_2024", "Player's Handbook 2024", true],
  ["XGE", "Xanathar's Guide to Everything", true],
  ["TCE", "Tasha's Cauldron of Everything", true],
  ["MPMM", "Monsters of the Multiverse", true],
  ["UA_2024", "Unearthed Arcana 2024", false],
  ["UA_PLAYTEST", "Unearthed Arcana Playtests", false],
  ["ULA_2026", "Unleashed Arcana", false],
  ["SCAG", "Sword Coast Adventurer's Guide", true],
  ["ERLW", "Eberron: Rising from the Last War", true],
  ["MoT", "Mythic Odysseys of Theros", true],
  ["DSotDQ", "Dragonlance: Shadow of the Dragon Queen", true],
  ["BoMT", "The Book of Many Things", true],
  ["PS_A", "Plane Shift: Amonkhet", false],
  ["PS_K", "Plane Shift: Kaladesh", false],
  ["FToD", "Fizban's Treasury of Dragons", true],
  ["SCC", "Strixhaven: A Curriculum of Chaos", true],
  ["BGG", "Bigby Presents: Glory of the Giants", true],
  ["AU_2026", "Arcana Unleashed", false],
] as const;

const supplementalFeats = [
  ["chef", "Chef", "GENERAL", 4, "", "Améliore les soins et permet de préparer des friandises nourrissantes."],
  ["crusher", "Écraseur", "GENERAL", 4, "Force ou Constitution 13+", "Les coups contondants peuvent déplacer une cible et les coups critiques ouvrent une opportunité aux alliés."],
  ["piercer", "Perforateur", "GENERAL", 4, "Force ou Dextérité 13+", "Les dégâts perforants peuvent être relancés et les coups critiques gagnent un dé supplémentaire."],
  ["slasher", "Trancheur", "GENERAL", 4, "Force ou Dextérité 13+", "Les dégâts tranchants ralentissent une cible et un coup critique la gêne davantage."],
  ["telekinetic", "Télékinésiste", "GENERAL", 4, "Intelligence, Sagesse ou Charisme 13+", "Une poussée télékinétique et une main invisible étendent les possibilités d'interaction à distance."],
  ["telepathic", "Télépathe", "GENERAL", 4, "Intelligence, Sagesse ou Charisme 13+", "La pensée permet une communication silencieuse et une perception accrue des esprits."],
  ["skill-expert", "Expert des compétences", "GENERAL", 4, "Aucun", "Une compétence supplémentaire devient maîtrisée et l'une des maîtrises gagne l'expertise."],
  ["poisoner", "Empoisonneur", "GENERAL", 4, "Aucun", "La création et l'utilisation de poisons deviennent plus efficaces en combat."],
  ["ritual-caster", "Lanceur de rituels", "GENERAL", 4, "Intelligence ou Sagesse 13+", "Un grimoire de rituels permet de lancer certains sorts sans emplacement."],
  ["inspiring-leader", "Chef inspirant", "GENERAL", 4, "Charisme 13+", "Un discours prépare plusieurs créatures à encaisser des dégâts temporaires."],
] as const;

const supplementalSpells = [
  ["alarm", "Alarme", 1, "Abjuration", "1 minute", "9 m", ["V", "S", "M"], "8 heures", "Une zone protégée avertit l'incantateur lorsqu'une intrusion survient.", ["ranger", "wizard"], "PHB_2014"],
  ["entangle", "Enchevêtrement", 1, "Invocation", "1 action", "27 m", ["V", "S"], "Concentration, 1 minute", "Des plantes entravantes couvrent une zone et retiennent les créatures qui y échouent.", ["druid"], "PHB_2014"],
  ["heroism", "Héroïsme", 1, "Enchantement", "1 action", "Contact", ["V", "S"], "Concentration, 1 minute", "Une créature devient courageuse et reçoit une réserve de vitalité temporaire.", ["bard", "paladin"], "PHB_2014"],
  ["longstrider", "Pattes longues", 1, "Transmutation", "1 action", "Contact", ["V", "S", "M"], "1 heure", "La vitesse d'une créature augmente pendant la durée.", ["bard", "druid", "ranger", "wizard"], "PHB_2014"],
  ["purify-food-and-drink", "Purification de nourriture et de boisson", 1, "Transmutation", "1 action", "3 m", ["V", "S"], "Instantanée", "La nourriture et la boisson non magiques d'une zone sont débarrassées des poisons et maladies.", ["cleric", "druid", "paladin"], "PHB_2014"],
  ["animal-friendship", "Amitié avec les animaux", 1, "Enchantement", "1 action", "9 m", ["V", "S", "M"], "24 heures", "Une bête comprend que l'incantateur ne lui veut pas de mal.", ["bard", "druid", "ranger"], "PHB_2014"],
  ["invisibility", "Invisibilité", 2, "Illusion", "1 action", "Contact", ["V", "S", "M"], "Concentration, 1 heure", "Une créature devient invisible jusqu'à ce qu'elle attaque ou incante.", ["bard", "sorcerer", "warlock", "wizard"], "PHB_2014"],
  ["lesser-restoration", "Restauration partielle", 2, "Abjuration", "1 action", "Contact", ["V", "S"], "Instantanée", "Une maladie ou condition affaiblissante est supprimée d'une créature.", ["bard", "cleric", "druid", "paladin", "ranger"], "PHB_2014"],
  ["pass-without-trace", "Passage sans trace", 2, "Abjuration", "1 action", "Personnel", ["V", "S", "M"], "Concentration, 1 heure", "Une aura masque les traces et aide le groupe à se déplacer discrètement.", ["druid", "ranger"], "PHB_2014"],
  ["web", "Toile d'araignée", 2, "Invocation", "1 action", "18 m", ["V", "S", "M"], "Concentration, 1 heure", "Une masse de toiles adhésives ralentit et entrave les créatures dans la zone.", ["sorcerer", "wizard"], "PHB_2014"],
  ["dispel-magic", "Dissipation de la magie", 3, "Abjuration", "1 action", "36 m", ["V", "S"], "Instantanée", "Un effet magique présent sur une créature, un objet ou une zone est interrompu.", ["bard", "cleric", "druid", "paladin", "sorcerer", "warlock", "wizard"], "PHB_2014"],
  ["fly", "Vol", 3, "Transmutation", "1 action", "Contact", ["V", "S", "M"], "Concentration, 10 minutes", "Une créature gagne une vitesse de vol importante.", ["sorcerer", "warlock", "wizard"], "PHB_2014"],
  ["hypnotic-pattern", "Motif hypnotique", 3, "Illusion", "1 action", "36 m", ["S", "M"], "Concentration, 1 minute", "Un motif coloré fascine et neutralise temporairement les créatures qui le voient.", ["bard", "sorcerer", "warlock", "wizard"], "PHB_2014"],
  ["plant-growth", "Croissance végétale", 3, "Transmutation", "1 action", "45 m", ["V", "S"], "Instantanée", "La végétation d'une zone croît rapidement ou devient difficile à traverser.", ["bard", "druid", "ranger"], "PHB_2014"],
  ["dimension-door", "Porte dimensionnelle", 4, "Invocation", "1 action", "150 m", ["V"], "Instantanée", "L'incantateur se téléporte avec une créature consentante vers un lieu connu ou décrit.", ["bard", "sorcerer", "warlock", "wizard"], "PHB_2014"],
  ["freedom-of-movement", "Liberté de mouvement", 4, "Abjuration", "1 action", "Contact", ["V", "S", "M"], "1 heure", "Une créature ignore les terrains difficiles et les entraves ordinaires.", ["bard", "cleric", "druid", "ranger"], "PHB_2014"],
  ["greater-invisibility", "Invisibilité supérieure", 4, "Illusion", "1 action", "Contact", ["V", "S"], "Concentration, 1 minute", "Une créature reste invisible même après avoir attaqué ou incanté.", ["bard", "sorcerer", "wizard"], "PHB_2014"],
  ["raise-dead", "Rappel à la vie", 5, "Nécromancie", "1 heure", "Contact", ["V", "S", "M"], "Instantanée", "Une créature morte depuis peu revient à la vie avec des limites liées au traumatisme.", ["bard", "cleric", "paladin"], "PHB_2014"],
  ["scrying", "Scrutation", 5, "Divination", "10 minutes", "Personnel", ["V", "S", "M"], "Concentration, 10 minutes", "Un capteur invisible permet d'observer une créature ou un lieu à distance.", ["bard", "cleric", "druid", "wizard"], "PHB_2014"],
  ["true-seeing", "Vision véritable", 6, "Divination", "1 action", "Contact", ["V", "S", "M"], "1 heure", "Une créature perçoit les illusions, formes cachées et plans voisins avec une clarté surnaturelle.", ["bard", "cleric", "sorcerer", "warlock", "wizard"], "PHB_2014"],
  ["plane-shift", "Changement de plan", 7, "Invocation", "1 action", "Contact", ["V", "S", "M"], "Instantanée", "L'incantateur et des créatures consentantes passent vers un autre plan d'existence.", ["cleric", "druid", "sorcerer", "warlock", "wizard"], "PHB_2014"],
  ["power-word-kill", "Mot de pouvoir mortel", 9, "Enchantement", "1 action", "18 m", ["V"], "Instantanée", "Une créature affaiblie est tuée par une parole de pouvoir.", ["bard", "sorcerer", "warlock", "wizard"], "PHB_2014"],
] as const;

const tashaSpells = [
  ["booming-blade", "Lame tonnante", 0, "Évocation", "1 action", "Personnel", ["S", "M"], "1 round", "Une attaque d'arme enveloppée d'énergie menace la cible si elle se déplace.", ["sorcerer", "warlock", "wizard", "artificer"], "TCE"],
  ["green-flame-blade", "Lame de feu vert", 0, "Évocation", "1 action", "Personnel", ["S", "M"], "Instantanée", "Une attaque d'arme projette des flammes vers une seconde créature proche.", ["sorcerer", "warlock", "wizard", "artificer"], "TCE"],
  ["sword-burst", "Explosion de lames", 0, "Invocation", "1 action", "Personnel", ["V"], "Instantanée", "Des lames spectrales apparaissent autour de l'incantateur et frappent les créatures proches.", ["sorcerer", "warlock", "wizard", "artificer"], "TCE"],
  ["tashas-mind-whip", "Fouet mental de Tasha", 2, "Enchantement", "1 action", "27 m", ["V"], "1 round", "Une attaque psychique inflige des dégâts et limite les choix d'action de la cible.", ["sorcerer", "wizard"], "TCE"],
  ["summon-aberration", "Invocation d'aberration", 4, "Invocation", "1 action", "27 m", ["V", "S", "M"], "Concentration, 1 heure", "Une aberration invoquée combat aux côtés de l'incantateur.", ["warlock", "wizard"], "TCE"],
  ["summon-undead", "Invocation de mort-vivant", 3, "Invocation", "1 action", "27 m", ["V", "S", "M"], "Concentration, 1 heure", "Un esprit mort-vivant prend forme et obéit aux ordres de l'incantateur.", ["warlock", "wizard"], "TCE"],
  ["spirit-shroud", "Linceul spirituel", 3, "Nécromancie", "Bonus action", "Personnel", ["V", "S"], "Concentration, 1 minute", "Des esprits hostiles entourent l'incantateur et renforcent ses attaques.", ["cleric", "paladin", "warlock", "wizard"], "TCE"],
  ["tashas-otherworldly-guise", "Déguisement surnaturel de Tasha", 6, "Transmutation", "1 action", "Personnel", ["V", "S", "M"], "Concentration, 1 minute", "L'incantateur adopte temporairement une forme extraplanaire puissante.", ["sorcerer", "warlock", "wizard"], "TCE"],
] as const;

const weaponMasteries = [
  ["CLEAVE", "Fendoir", "Après une attaque de corps à corps réussie avec une arme lourde, une seconde attaque gratuite peut viser une autre créature à portée."],
  ["GRAZE", "Éraflure", "Même sur une attaque manquée avec une arme lourde, la cible subit au moins 1 dégât égal au modificateur utilisé."],
  ["NICK", "Coup vif", "L'attaque supplémentaire d'une arme légère peut être effectuée dans l'action Attaquer sans utiliser l'action bonus."],
  ["PUSH", "Repousser", "Une attaque réussie repousse une créature de taille G ou inférieure jusqu'à 3 mètres."],
  ["SAP", "Affaiblir", "Une cible touchée subit un désavantage à son prochain jet d'attaque avant le début de votre prochain tour."],
  ["SLOW", "Ralentir", "Une attaque qui inflige des dégâts réduit la vitesse de la cible de 3 mètres jusqu'au début de votre prochain tour."],
  ["TOPPLE", "Renverser", "Une cible touchée doit réussir une sauvegarde de Constitution ou tomber à terre."],
  ["VEX", "Harceler", "Une attaque qui inflige des dégâts donne l'avantage à votre prochaine attaque contre la même cible."],
] as const;

const equipment = [
  ["dagger", "Dague", "WEAPON", 2, 0.5, "1d4", "PIERCING", ["FINESSE", "LIGHT", "THROWN"], 6, 18, "NICK"],
  ["shortsword", "Épée courte", "WEAPON", 10, 1, "1d6", "PIERCING", ["FINESSE", "LIGHT"], null, null, "VEX"],
  ["scimitar", "Cimeterre", "WEAPON", 25, 1.5, "1d6", "SLASHING", ["FINESSE", "LIGHT"], null, null, "NICK"],
  ["rapier", "Rapière", "WEAPON", 25, 1, "1d8", "PIERCING", ["FINESSE"], null, null, "VEX"],
  ["longsword", "Épée longue", "WEAPON", 15, 1.5, "1d8", "SLASHING", ["VERSATILE"], null, null, "SAP"],
  ["greatsword", "Grande épée", "WEAPON", 50, 3, "2d6", "SLASHING", ["HEAVY", "TWO_HANDED"], null, null, "GRAZE"],
  ["battleaxe", "Hache d'armes", "WEAPON", 10, 2, "1d8", "SLASHING", ["VERSATILE"], null, null, "TOPPLE"],
  ["greataxe", "Grande hache", "WEAPON", 30, 3.5, "1d12", "SLASHING", ["HEAVY", "TWO_HANDED"], null, null, "CLEAVE"],
  ["mace", "Masse d'armes", "WEAPON", 5, 2, "1d6", "BLUDGEONING", [], null, null, "SAP"],
  ["warhammer", "Marteau de guerre", "WEAPON", 15, 1, "1d8", "BLUDGEONING", ["VERSATILE"], null, null, "PUSH"],
  ["maul", "Grand marteau", "WEAPON", 10, 5, "2d6", "BLUDGEONING", ["HEAVY", "TWO_HANDED"], null, null, "TOPPLE"],
  ["halberd", "Hallebarde", "WEAPON", 20, 3, "1d10", "SLASHING", ["HEAVY", "TWO_HANDED", "REACH"], null, null, "CLEAVE"],
  ["glaive", "Pique", "WEAPON", 20, 3, "1d10", "SLASHING", ["HEAVY", "TWO_HANDED", "REACH"], null, null, "GRAZE"],
  ["spear", "Lance", "WEAPON", 1, 1.5, "1d6", "PIERCING", ["VERSATILE", "THROWN"], 6, 18, "SAP"],
  ["shortbow", "Arc court", "WEAPON", 25, 1, "1d6", "PIERCING", ["TWO_HANDED", "AMMUNITION"], 24, 96, "VEX"],
  ["longbow", "Arc long", "WEAPON", 50, 1, "1d8", "PIERCING", ["HEAVY", "TWO_HANDED", "AMMUNITION"], 45, 180, "SLOW"],
  ["light-crossbow", "Arbalète légère", "WEAPON", 25, 2.5, "1d8", "PIERCING", ["TWO_HANDED", "LOADING"], 24, 96, "SLOW"],
  ["heavy-crossbow", "Arbalète lourde", "WEAPON", 50, 8, "1d10", "PIERCING", ["HEAVY", "TWO_HANDED", "LOADING"], 30, 120, "PUSH"],
  ["hand-crossbow", "Arbalète de poing", "WEAPON", 75, 1.5, "1d6", "PIERCING", ["LIGHT", "LOADING"], 9, 36, "VEX"],
] as const;

const armor = [
  ["padded", "Matelassée", "LIGHT", 5, 4, 11, null, true],
  ["leather", "Cuir", "LIGHT", 10, 5, 11, null, false],
  ["studded-leather", "Cuir clouté", "LIGHT", 45, 6.5, 12, null, false],
  ["chain-shirt", "Chemise de mailles", "MEDIUM", 50, 10, 13, 2, false],
  ["scale-mail", "Écailles", "MEDIUM", 50, 20, 14, 2, true],
  ["breastplate", "Cuirasse", "MEDIUM", 400, 10, 14, 2, false],
  ["half-plate", "Demi-plate", "MEDIUM", 750, 20, 15, 2, true],
  ["ring-mail", "Broigne", "HEAVY", 30, 20, 14, 0, true],
  ["chain-mail", "Cotte de mailles", "HEAVY", 75, 25, 16, 0, true],
  ["splint", "Clibanion", "HEAVY", 200, 30, 17, 0, true],
  ["plate", "Harnois", "HEAVY", 1500, 32, 18, 0, true],
  ["shield", "Bouclier", "SHIELD", 10, 3, null, null, false],
] as const;

const languages = [
  ["Commun", "Commun", false],
  ["Nain", "Nain", false],
  ["Elfique", "Elfique", false],
  ["Géant", "Nain", false],
  ["Gnome", "Nain", false],
  ["Gobelin", "Nain", false],
  ["Halfelin", "Commun", false],
  ["Orc", "Nain", false],
  ["Abyssien", "Infernal", true],
  ["Céleste", "Céleste", true],
  ["Draconique", "Draconique", true],
  ["Profond", "Elfique", true],
  ["Infernal", "Infernal", true],
  ["Primordial", "Nain", true],
  ["Sylvain", "Elfique", true],
  ["Télépathie", "Aucun", true],
] as const;

const classResources = [
  ["barbarian", "Rages", "SHORT_REST", { "1": 2, "3": 3, "6": 4, "12": 5, "17": 6, "20": 999 }, null],
  ["fighter", "Second souffle", "SHORT_REST", { "1": 2, "4": 3, "10": 4, "17": 5 }, null],
  ["fighter", "Sursaut", "SHORT_REST", { "2": 1, "17": 2 }, null],
  ["monk", "Points de ki", "SHORT_REST", { "2": 2, "3": 3, "4": 4, "20": 20 }, null],
  ["bard", "Inspiration bardique", "LONG_REST", { "1": 2, "5": 3, "10": 4 }, "1d6"],
  ["sorcerer", "Points de sorcellerie", "LONG_REST", { "2": 2, "3": 3, "20": 20 }, null],
] as const;

const spells = [
  ["acid-splash", "Projection acide", 0, "Invocation", "1 action", "18 m", ["V", "S"], "Instantanée", "Deux créatures proches peuvent être visées; chacune tente d'éviter l'éclaboussure.", ["wizard", "sorcerer", "artificer"]],
  ["blade-ward", "Protection contre les lames", 0, "Abjuration", "1 action", "Personnel", ["V", "S"], "1 minute", "Une garde magique réduit les dommages physiques reçus pendant sa durée.", ["bard", "sorcerer", "warlock", "wizard"]],
  ["chill-touch", "Toucher glacial", 0, "Nécromancie", "1 action", "36 m", ["V", "S"], "1 round", "Un contact spectral inflige des dégâts nécrotiques et gêne les soins de la cible.", ["sorcerer", "warlock", "wizard"]],
  ["dancing-lights", "Lumières dansantes", 0, "Évocation", "1 action", "36 m", ["V", "S", "M"], "1 minute", "Jusqu'à quatre lumières flottantes éclairent ou distraient dans la zone choisie.", ["bard", "sorcerer", "wizard"]],
  ["fire-bolt", "Trait de feu", 0, "Évocation", "1 action", "36 m", ["V", "S"], "Instantanée", "Un trait de feu frappe une créature ou un objet inflammable à portée.", ["sorcerer", "wizard", "artificer"]],
  ["light", "Lumière", 0, "Évocation", "1 action", "Contact", ["V", "M"], "1 hour", "Un objet touché diffuse une lumière vive autour de lui.", ["bard", "cleric", "sorcerer", "wizard"]],
  ["mage-hand", "Main de mage", 0, "Invocation", "1 action", "9 m", ["V", "S"], "1 minute", "Une main invisible manipule de petits objets et accomplit des gestes simples à distance.", ["bard", "sorcerer", "warlock", "wizard", "artificer"]],
  ["message", "Message", 0, "Transmutation", "1 action", "36 m", ["V", "S", "M"], "1 round", "Un bref message est transmis à une créature qui peut répondre à voix basse.", ["bard", "sorcerer", "wizard", "artificer"]],
  ["minor-illusion", "Illusion mineure", 0, "Illusion", "1 action", "9 m", ["S", "M"], "1 minute", "Un son ou une image immobile apparaît dans un espace proche.", ["bard", "sorcerer", "warlock", "wizard"]],
  ["ray-of-frost", "Rayon de givre", 0, "Évocation", "1 action", "18 m", ["V", "S"], "Instantanée", "Un rayon froid inflige des dégâts et ralentit brièvement la cible.", ["sorcerer", "wizard"]],
  ["sacred-flame", "Flamme sacrée", 0, "Évocation", "1 action", "18 m", ["V", "S"], "Instantanée", "Une flamme descend sur une créature; elle tente d'éviter l'effet lumineux.", ["cleric"]],
  ["shillelagh", "Gourdin magique", 0, "Transmutation", "Bonus action", "Contact", ["V", "S", "M"], "1 minute", "Une arme naturelle en bois devient magique et utilise la Sagesse pour ses attaques.", ["druid"]],
  ["spare-the-dying", "Stabiliser", 0, "Nécromancie", "1 action", "Contact", ["V", "S"], "Instantanée", "Une créature inconsciente et mourante est stabilisée.", ["cleric"]],
  ["thaumaturgy", "Thaumaturgie", 0, "Transmutation", "1 action", "9 m", ["V"], "1 minute", "Un petit phénomène surnaturel produit un effet visuel ou sonore choisi.", ["cleric"]],
  ["vicious-mockery", "Moquerie cruelle", 0, "Enchantement", "1 action", "18 m", ["V"], "Instantanée", "Une insulte magique trouble une créature qui l'entend.", ["bard"]],
  ["eldritch-blast", "Décharge occulte", 0, "Évocation", "1 action", "36 m", ["V", "S"], "Instantanée", "Un rayon d'énergie occulte frappe une créature à portée.", ["warlock"]],
  ["prestidigitation", "Prestidigitation", 0, "Transmutation", "1 action", "3 m", ["V", "S"], "Jusqu'à 1 heure", "De petits effets magiques mineurs produisent des changements sensoriels ou des manipulations simples.", ["bard", "sorcerer", "warlock", "wizard", "artificer"]],
  ["guidance", "Guidance", 0, "Divination", "1 action", "Contact", ["V", "S"], "Concentration, 1 minute", "Une créature touchée reçoit un encouragement magique pour une épreuve de caractéristique.", ["cleric", "druid"]],
  ["toll-the-dead", " glas funèbre", 0, "Nécromancie", "1 action", "18 m", ["V", "S"], "Instantanée", "Une cloche funèbre inflige des dégâts nécrotiques à une créature visible.", ["cleric", "warlock", "wizard"]],
  ["mind-sliver", "Éclat mental", 0, "Enchantement", "1 action", "18 m", ["V"], "1 round", "Une pointe psychique inflige des dégâts et gêne le prochain jet de sauvegarde de la cible.", ["sorcerer", "warlock", "wizard"]],
  ["shocking-grasp", "Poigne électrique", 0, "Évocation", "1 action", "Contact", ["V", "S"], "Instantanée", "Une attaque de contact électrique inflige des dégâts et prive brièvement la cible de ses réactions.", ["sorcerer", "wizard", "artificer"]],
  ["poison-spray", "Aspersion de poison", 0, "Invocation", "1 action", "9 m", ["V", "S"], "Instantanée", "Un nuage toxique vise une créature à portée.", ["druid", "sorcerer", "warlock", "wizard", "artificer"]],
  ["bless", "Bénédiction", 1, "Enchantement", "1 action", "9 m", ["V", "S", "M"], "1 minute", "Jusqu'à trois créatures gagnent un bonus à leurs jets pendant la durée.", ["cleric"]],
  ["burning-hands", "Mains brûlantes", 1, "Évocation", "1 action", "Personnel", ["V", "S"], "Instantanée", "Des flammes jaillissent en cône et embrasent la zone touchée.", ["sorcerer", "wizard"]],
  ["charm-person", "Charme-personne", 1, "Enchantement", "1 action", "9 m", ["V", "S"], "1 hour", "Une créature humanoïde devient temporairement plus disposée envers l'incantateur.", ["bard", "sorcerer", "warlock", "wizard"]],
  ["cure-wounds", "Soins", 1, "Évocation", "1 action", "Contact", ["V", "S"], "Instantanée", "Le contact rend des points de vie à une créature vivante.", ["bard", "cleric", "druid"]],
  ["detect-magic", "Détection de la magie", 1, "Divination", "1 action", "Personnel", ["V", "S"], "Concentration, 10 minutes", "Les effets magiques proches deviennent perceptibles à travers les obstacles ordinaires.", ["bard", "cleric", "druid", "sorcerer", "wizard"]],
  ["faerie-fire", "Lueurs féeriques", 1, "Évocation", "1 action", "18 m", ["V"], "Concentration, 1 minute", "Les créatures et objets dans la zone se détachent visuellement et deviennent plus faciles à toucher.", ["bard", "druid"]],
  ["find-familiar", "Appel de familier", 1, "Invocation", "1 hour", "3 m", ["V", "S", "M"], "Instantanée", "Un esprit prend une forme animale et sert de compagnon magique.", ["wizard"]],
  ["healing-word", "Mot de guérison", 1, "Évocation", "Bonus action", "18 m", ["V"], "Instantanée", "Une parole restaure des points de vie à une créature visible.", ["bard", "cleric", "druid"]],
  ["hex", "Maléfice", 1, "Enchantement", "Bonus action", "27 m", ["V", "S", "M"], "Concentration, 1 hour", "Une cible subit un désavantage dans une caractéristique choisie et reçoit davantage de dégâts.", ["warlock"]],
  ["magic-missile", "Projectile magique", 1, "Évocation", "1 action", "36 m", ["V", "S"], "Instantanée", "Des traits d'énergie frappent automatiquement les créatures choisies.", ["sorcerer", "wizard"]],
  ["shield", "Bouclier", 1, "Abjuration", "Reaction", "Personnel", ["V", "S"], "1 round", "Une barrière invisible augmente instantanément la défense contre une attaque.", ["sorcerer", "wizard"]],
  ["sleep", "Sommeil", 1, "Enchantement", "1 action", "27 m", ["V", "S", "M"], "1 minute", "Une réserve d'énergie magique endort des créatures dans une zone.", ["bard", "sorcerer", "wizard"]],
  ["thunderwave", "Vague tonnante", 1, "Évocation", "1 action", "Personnel", ["V", "S"], "Instantanée", "Une onde sonore repousse les créatures et les objets proches.", ["bard", "druid", "sorcerer", "wizard"]],
  ["magic-armor", "Armure de mage", 1, "Abjuration", "1 action", "Contact", ["V", "S", "M"], "8 heures", "Une protection magique améliore la défense d'une créature qui ne porte pas d'armure.", ["sorcerer", "wizard"]],
  ["guiding-bolt", "Trait directeur", 1, "Évocation", "1 action", "36 m", ["V", "S"], "1 round", "Un trait lumineux inflige des dégâts et facilite la prochaine attaque contre la cible.", ["cleric"]],
  ["bane", "Fléau", 1, "Enchantement", "1 action", "9 m", ["V", "S", "M"], "Concentration, 1 minute", "Des créatures ciblées subissent un malus à leurs jets d'attaque et de sauvegarde.", ["bard", "cleric"]],
  ["hunters-mark", "Marque du chasseur", 1, "Divination", "Bonus action", "27 m", ["V"], "Concentration, 1 hour", "Une cible marquée est plus facile à suivre et subit des dégâts supplémentaires.", ["ranger"]],
  ["dissonant-whispers", "Murmures dissonants", 1, "Enchantement", "1 action", "18 m", ["V"], "Instantanée", "Une mélodie psychique inflige des dégâts et pousse la cible à fuir.", ["bard"]],
  ["absorb-elements", "Absorption des éléments", 1, "Abjuration", "Reaction", "Personnel", ["S"], "1 round", "Une énergie élémentaire reçue est réduite puis canalisée dans la prochaine attaque.", ["druid", "ranger", "sorcerer", "wizard"]],
  ["silvery-barbs", "Barbes argentées", 1, "Enchantement", "Reaction", "18 m", ["V"], "Instantanée", "Une réussite adverse est perturbée et un allié reçoit un avantage bref.", ["bard", "sorcerer", "wizard"]],
  ["inflict-wounds", "Infliger des blessures", 1, "Nécromancie", "1 action", "Contact", ["V", "S"], "Instantanée", "Une attaque de contact inflige des dégâts nécrotiques importants.", ["cleric"]],
  ["sanctuary", "Sanctuaire", 1, "Abjuration", "Bonus action", "9 m", ["V", "S", "M"], "1 minute", "Une protection décourage les attaques contre la créature protégée.", ["cleric"]],
  ["fog-cloud", " nappe de brouillard", 1, "Invocation", "1 action", "36 m", ["V", "S"], "Concentration, 1 hour", "Un brouillard dense obscurcit une zone choisie.", ["druid", "ranger", "sorcerer", "wizard"]],
  ["grease", "Graisse", 1, "Invocation", "1 action", "18 m", ["V", "S", "M"], "1 minute", "Une surface glissante apparaît et peut faire tomber les créatures qui la traversent.", ["wizard", "artificer"]],
  ["misty-step", "Pas brumeux", 2, "Invocation", "Bonus action", "Personnel", ["V"], "Instantanée", "L'incantateur se téléporte vers un espace visible proche.", ["sorcerer", "warlock", "wizard"]],
  ["spiritual-weapon", "Arme spirituelle", 2, "Évocation", "Bonus action", "18 m", ["V", "S"], "1 minute", "Une arme spectrale attaque les ennemis à distance.", ["cleric"]],
  ["scorching-ray", "Rayons ardents", 2, "Évocation", "1 action", "36 m", ["V", "S"], "Instantanée", "Plusieurs rayons de feu peuvent viser des créatures à portée.", ["sorcerer", "wizard"]],
  ["hold-person", "Immobilisation de personne", 2, "Enchantement", "1 action", "18 m", ["V", "S", "M"], "Concentration, 1 minute", "Une créature humanoïde est paralysée si elle échoue à son jet de sauvegarde.", ["bard", "cleric", "druid", "sorcerer", "warlock", "wizard"]],
  ["fireball", "Boule de feu", 3, "Évocation", "1 action", "45 m", ["V", "S", "M"], "Instantanée", "Une explosion de feu ravage une sphère et touche les créatures dans la zone.", ["sorcerer", "wizard"]],
  ["counterspell", "Contresort", 3, "Abjuration", "Reaction", "18 m", ["S"], "Instantanée", "Une magie en cours est interrompue par une réaction arcanique.", ["sorcerer", "warlock", "wizard"]],
  ["lightning-bolt", "Éclair", 3, "Évocation", "1 action", "Personnel", ["V", "S", "M"], "Instantanée", "Un éclair parcourt une ligne et frappe les créatures sur son passage.", ["sorcerer", "wizard"]],
  ["revivify", "Rappel à la vie", 3, "Nécromancie", "1 action", "Contact", ["V", "S", "M"], "Instantanée", "Une créature morte récemment revient à la vie avec une réserve de vitalité limitée.", ["cleric", "druid", "paladin", "ranger"]],
  ["spirit-guardians", "Gardiens spirituels", 3, "Invocation", "1 action", "Personnel", ["V", "S", "M"], "Concentration, 10 minutes", "Des esprits protecteurs entourent l'incantateur et gênent les ennemis proches.", ["cleric"]],
  ["haste", "Hâte", 3, "Transmutation", "1 action", "9 m", ["V", "S", "M"], "Concentration, 1 minute", "Une créature gagne vitesse et possibilités d'action supplémentaires.", ["sorcerer", "wizard"]],
  ["polymorph", "Métamorphose", 4, "Transmutation", "1 action", "18 m", ["V", "S", "M"], "Concentration, 1 hour", "Une créature est transformée en bête selon les limites du sort.", ["bard", "druid", "sorcerer", "wizard"]],
  ["banishment", " Bannissement", 4, "Abjuration", "1 action", "18 m", ["V", "S", "M"], "Concentration, 1 minute", "Une créature est temporairement exilée hors de son plan.", ["cleric", "sorcerer", "warlock", "wizard"]],
  ["greater-restoration", "Restauration supérieure", 5, "Abjuration", "1 action", "Contact", ["V", "S", "M"], "Instantanée", "Une altération magique ou physique importante est supprimée.", ["bard", "cleric", "druid"]],
  ["wall-of-force", "Mur de force", 5, "Évocation", "1 action", "36 m", ["V", "S", "M"], "Concentration, 10 minutes", "Une paroi invisible et résistante sépare la zone choisie.", ["wizard"]],
  ["chain-lightning", "Chaîne d'éclairs", 6, "Évocation", "1 action", "45 m", ["V", "S", "M"], "Instantanée", "Un éclair se divise pour frapper plusieurs créatures.", ["sorcerer", "wizard"]],
  ["heal", "Guérison", 6, "Évocation", "1 action", "18 m", ["V", "S"], "Instantanée", "Une grande quantité de points de vie est rendue à une créature visible.", ["cleric", "druid"]],
  ["disintegrate", "Désintégration", 6, "Transmutation", "1 action", "18 m", ["V", "S", "M"], "Instantanée", "Un rayon destructeur désagrège une créature ou un objet qui échoue à son jet.", ["sorcerer", "wizard"]],
  ["teleport", "Téléportation", 7, "Invocation", "1 action", "3 m", ["V"], "Instantanée", "L'incantateur et des créatures consentantes se déplacent vers une destination lointaine.", ["bard", "sorcerer", "wizard"]],
  ["wish", "Souhait", 9, "Invocation", "1 action", "Personnel", ["V"], "Instantanée", "La magie la plus puissante permet de reproduire un sort ou de formuler un effet exceptionnel.", ["sorcerer", "wizard"]],
] as const;

const monsters = [
  { slug: "goblin", name: "Gobelin", type: "Humanoïde", cr: "1/4", ac: 15, hp: 7, hitDice: "2d6", legendary: false },
  { slug: "young-dragon", name: "Jeune dragon", type: "Dragon", cr: "5", ac: 18, hp: 75, hitDice: "10d10+20", legendary: false },
  { slug: "ancient-dragon", name: "Dragon ancien", type: "Dragon", cr: "24", ac: 22, hp: 546, hitDice: "28d20+252", legendary: true },
] as const;

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function seedSpecCatalog(sourceBookIds: Map<string, string>, fallbackSourceBookId: string | undefined) {
  const specs = [readFileSync("specs/DND_ALL_SPELLS_SPEC.md", "utf8"), readFileSync("specs/DND_ALL_MISSING_FEATS_SPEC.md", "utf8")];
  let kind: "spell" | "feat" | null = null;
  let sourceCode = "PHB_2024";
  const spellRows = await prisma.spell.findMany({ select: { name: true, slug: true } });
  const featRows = await prisma.feat.findMany({ select: { name: true, slug: true } });
  const knownSpells = new Set(spellRows.flatMap((row) => [row.name, row.slug].map((value) => slugify(value))));
  const knownFeats = new Set(featRows.flatMap((row) => [row.name, row.slug].map((value) => slugify(value))));
  const sourceId = () => sourceBookIds.get(sourceCode) ?? fallbackSourceBookId;
  const sourceFromHeading = (line: string) => {
    const match = line.match(/`([^`]+)`/);
    if (match?.[1]) sourceCode = match[1].split(" / ")[0];
    if (line.includes("Arcana Unleashed")) sourceCode = "AU_2026";
  };

  for (const spec of specs)
    for (const line of spec.split(/\r?\n/)) {
      if (line.startsWith("## 2. Inventaire Exhaustif des Dons") || line.startsWith("## 1. Dons (Feats)") || line.startsWith("## 2. Dons")) kind = "feat";
      if (line.startsWith("## 3. Inventaire Exhaustif des Sorts") || line.startsWith("## 2. Sorts (Spells)")) kind = "spell";
      if (line.startsWith("### ")) sourceFromHeading(line);
      const bullet = line.match(/^\* \*\*(.*?)\*\*(?:\s+\([^)]*\))?\s*\|/);
      if (!bullet || !kind) continue;
      const name = bullet[1].replace(/\s*\((?:UA|UA Modern)\)$/i, "").trim();
      const slug = slugify(name);
      const bulletSourceCode = line.match(/`([^`]+)`/)?.[1];
      if (bulletSourceCode && sourceBookIds.has(bulletSourceCode)) sourceCode = bulletSourceCode;
      const sourceBookId = sourceId();
      const levelMatch = line.match(/Niv(?:eau)?\s*(\d+)/i);
      const level = levelMatch ? Number(levelMatch[1]) : 0;
      if (kind === "spell" && !knownSpells.has(slug)) {
        await prisma.spell.create({ data: { slug, name, level, school: "Invocation", castingTime: "1 action", range: "Personnel", components: [], duration: "Instantanée", description: `Référence de compendium importée depuis ${sourceCode}.`, classes: [], sourceBookId } });
        knownSpells.add(slug);
      }
      if (kind === "feat" && !knownFeats.has(slug)) {
        const category = line.includes("Épique") || line.includes("Epic") ? "EPIC_BOON" : line.includes("Origine") || line.includes("Origin") ? "ORIGIN" : "GENERAL";
        await prisma.feat.create({ data: { slug, name, category, levelRequirement: level || 1, description: `Référence de don importée depuis ${sourceCode}.`, sourceBookId } });
        knownFeats.add(slug);
      }
    }
}

async function main() {
  const sourceBookIds = new Map<string, string>();
  for (const [code, title, isOfficial] of sourceBooks) {
    const sourceBook = await prisma.sourceBook.upsert({ where: { code }, create: { code, title, isOfficial, enabledByDefault: isOfficial }, update: { title, isOfficial, enabledByDefault: isOfficial } });
    sourceBookIds.set(code, sourceBook.id);
  }
  const phbId = sourceBookIds.get("PHB_2024");
  const masteryIds = new Map<string, string>();
  for (const [code, name, description] of weaponMasteries) {
    const mastery = await prisma.weaponMasteryProperty.upsert({ where: { code }, create: { code, name, description }, update: { name, description } });
    masteryIds.set(code, mastery.id);
  }
  for (const [slug, name, type, costGp, weightLb, damageFormula, damageType, properties, rangeNormal, rangeLong, masteryCode] of equipment) {
    const masteryPropertyId = masteryCode ? masteryIds.get(masteryCode) : undefined;
    await prisma.equipmentItem.upsert({ where: { slug }, create: { slug, name, category: type, description: `${name}, équipement PHB 2024.`, sourceBookId: phbId, type, costGp, weightLb, damageFormula, damageType, properties: [...properties], rangeNormal, rangeLong, weaponMastery: masteryCode, masteryPropertyId }, update: { name, category: type, description: `${name}, équipement PHB 2024.`, sourceBookId: phbId, type, costGp, weightLb, damageFormula, damageType, properties: [...properties], rangeNormal, rangeLong, weaponMastery: masteryCode, masteryPropertyId } });
  }
  for (const [slug, name, armorCategory, costGp, weightLb, baseAc, dexterityBonusMax, stealthDisadvantage] of armor) {
    await prisma.equipmentItem.upsert({ where: { slug }, create: { slug, name, category: armorCategory === "SHIELD" ? "SHIELD" : "ARMOR", description: `${name}, protection PHB 2024.`, sourceBookId: phbId, type: armorCategory === "SHIELD" ? "SHIELD" : "ARMOR", costGp, weightLb, armorCategory, armorClass: baseAc, dexterityCap: dexterityBonusMax, dexterityBonusMax, shieldBonus: armorCategory === "SHIELD" ? 2 : null, stealthDisadvantage }, update: { name, category: armorCategory === "SHIELD" ? "SHIELD" : "ARMOR", description: `${name}, protection PHB 2024.`, sourceBookId: phbId, type: armorCategory === "SHIELD" ? "SHIELD" : "ARMOR", costGp, weightLb, armorCategory, armorClass: baseAc, dexterityCap: dexterityBonusMax, dexterityBonusMax, shieldBonus: armorCategory === "SHIELD" ? 2 : null, stealthDisadvantage } });
  }
  for (const [name, script, isExotic] of languages) await prisma.language.upsert({ where: { name }, create: { name, script, isExotic }, update: { script, isExotic } });
  for (const [classSlug, name, resetCondition, formulaByLevel, diceFormula] of classResources) {
    const dndClass = await prisma.dndClass.findUnique({ where: { slug: classSlug }, select: { id: true } });
    if (!dndClass) continue;
    const resourceKey = `${classSlug}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const existing = await prisma.classResourceDefinition.findFirst({ where: { dndClassId: dndClass.id, name } });
    if (existing) await prisma.classResourceDefinition.update({ where: { id: existing.id }, data: { resetCondition, formulaByLevel, diceFormula } });
    else await prisma.classResourceDefinition.create({ data: { dndClassId: dndClass.id, name, resetCondition, formulaByLevel, diceFormula } });
    void resourceKey;
  }
  for (const [code, name, ability, description, examples] of skillDefinitions) {
    await prisma.skillDefinition.upsert({ where: { code }, create: { code, name, ability, description, examples, sourceBookId: phbId }, update: { name, ability, description, examples, sourceBookId: phbId } });
  }
  for (const [slug, name, level, school, castingTime, range, components, duration, description, classes] of spells) {
    await prisma.spell.upsert({ where: { slug }, create: { slug, name, level, school, castingTime, range, components, duration, description, classes, sourceBookId: phbId }, update: { name, level, school, castingTime, range, components, duration, description, classes, sourceBookId: phbId } });
  }
  for (const [slug, name, level, school, castingTime, range, components, duration, description, classes, sourceCode] of supplementalSpells) {
    const sourceBookId = sourceBookIds.get(sourceCode) ?? phbId;
    await prisma.spell.upsert({ where: { slug }, create: { slug, name, level, school, castingTime, range, components, duration, description, classes, sourceBookId }, update: { name, level, school, castingTime, range, components, duration, description, classes, sourceBookId } });
  }
  for (const [slug, name, level, school, castingTime, range, components, duration, description, classes, sourceCode] of tashaSpells) {
    const sourceBookId = sourceBookIds.get(sourceCode) ?? phbId;
    await prisma.spell.upsert({ where: { slug }, create: { slug, name, level, school, castingTime, range, components, duration, description, classes, sourceBookId }, update: { name, level, school, castingTime, range, components, duration, description, classes, sourceBookId } });
  }
  const featIds = new Map<string, string>();
  for (const [slug, name] of feats) {
    const category = ["war-caster", "sentinel", "great-weapon-master", "sharpshooter", "fey-touched", "shadow-touched", "resilient", "polearm-master", "mobile", "actor", "dual-wielder"].includes(slug) ? "GENERAL" : "ORIGIN";
    const levelRequirement = category === "GENERAL" ? 4 : 1;
    const feat = await prisma.feat.upsert({ where: { slug }, create: { slug, name, category, levelRequirement, description: `${name}: don de personnage et bénéfices associés.`, sourceBookId: phbId }, update: { name, category, levelRequirement, description: `${name}: don de personnage et bénéfices associés.`, sourceBookId: phbId } });
    featIds.set(slug, feat.id);
  }
  for (const [slug, name, category, levelRequirement, prerequisite, description] of supplementalFeats) {
    const sourceBookId = sourceBookIds.get(["chef", "crusher", "piercer", "slasher", "telekinetic", "telepathic", "skill-expert", "poisoner"].includes(slug) ? "TCE" : "XGE") ?? phbId;
    const feat = await prisma.feat.upsert({ where: { slug }, create: { slug, name, category, levelRequirement, prerequisite: prerequisite || null, description, sourceBookId }, update: { name, category, levelRequirement, prerequisite: prerequisite || null, description, sourceBookId } });
    featIds.set(slug, feat.id);
  }

  for (const entry of species) {
    const record = await prisma.species.upsert({ where: { slug: entry.slug }, create: { slug: entry.slug, name: entry.name, speed: 30, size: "MEDIUM", traits: entry.traits, sourceBookId: phbId }, update: { name: entry.name, traits: entry.traits, sourceBookId: phbId } });
    for (const slug of entry.subspecies) {
      await prisma.subspecies.upsert({ where: { slug: `${entry.slug}-${slug}` }, create: { speciesId: record.id, slug: `${entry.slug}-${slug}`, name: `${entry.name} ${lineageNames[slug]}`, traits: [], sourceBookId: phbId }, update: { speciesId: record.id, name: `${entry.name} ${lineageNames[slug]}`, sourceBookId: phbId } });
    }
  }

  for (const [slug, name, abilityChoices, featSlug] of backgrounds) {
    await prisma.background.upsert({ where: { slug }, create: { slug, name, abilityChoices, originFeatId: featIds.get(featSlug), skillProficiencies: ["insight", "persuasion"], toolProficiencies: [], startingEquipment: [], sourceBookId: phbId }, update: { name, abilityChoices, originFeatId: featIds.get(featSlug), skillProficiencies: ["insight", "persuasion"], toolProficiencies: [], startingEquipment: [], sourceBookId: phbId } });
  }

  for (const [slug, name, hitDie, savingThrows, skillChoices, skillOptions] of classes) {
    const dndClass = await prisma.dndClass.upsert({ where: { slug }, create: { slug, name, hitDie, savingThrows, skillChoices, skillOptions, sourceBookId: phbId, spellcastingProgression: slug === "warlock" ? "PACT" : ["cleric", "druid", "bard", "sorcerer", "wizard"].includes(slug) ? "FULL" : "NONE" }, update: { name, hitDie, savingThrows, skillChoices, skillOptions, sourceBookId: phbId, spellcastingProgression: slug === "warlock" ? "PACT" : ["cleric", "druid", "bard", "sorcerer", "wizard"].includes(slug) ? "FULL" : "NONE" } });
    for (const subclassName of subclassNames[slug]) {
      const subclassSlug = `${slug}-${subclassName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      await prisma.dndSubclass.upsert({ where: { slug: subclassSlug }, create: { dndClassId: dndClass.id, slug: subclassSlug, name: subclassName, description: `Sous-classe ${subclassName} de ${name}.`, sourceBookId: phbId }, update: { dndClassId: dndClass.id, name: subclassName, description: `Sous-classe ${subclassName} de ${name}.`, sourceBookId: phbId } });
    }
    const starterFeature = await prisma.classFeature.findFirst({ where: { dndClassId: dndClass.id, level: 1, name: "Aptitude de classe" } });
    if (phbId && starterFeature) await prisma.classFeature.update({ where: { id: starterFeature.id }, data: { sourceBookId: phbId, description: `Aptitudes de niveau 1 du ${name}.` } });
    else if (phbId) await prisma.classFeature.create({ data: { dndClassId: dndClass.id, sourceBookId: phbId, level: 1, name: "Aptitude de classe", description: `Aptitudes de niveau 1 du ${name}.` } });
  }
  for (const monster of monsters) {
    await prisma.monster.upsert({ where: { slug: monster.slug }, create: { slug: monster.slug, name: monster.name, creatureType: monster.type, challengeRating: monster.cr, armorClass: monster.ac, hitPoints: monster.hp, hitDice: monster.hitDice, speed: { walk: 30 }, sourceBookId: phbId, isLegendary: monster.legendary, legendaryResistances: monster.legendary ? 3 : 0 }, update: { name: monster.name, creatureType: monster.type, challengeRating: monster.cr, armorClass: monster.ac, hitPoints: monster.hp, hitDice: monster.hitDice, sourceBookId: phbId, isLegendary: monster.legendary, legendaryResistances: monster.legendary ? 3 : 0 } });
  }
  await seedSpecCatalog(sourceBookIds, phbId);
  console.log(`Compendium seeded: ${species.length} species and ${backgrounds.length} backgrounds.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
