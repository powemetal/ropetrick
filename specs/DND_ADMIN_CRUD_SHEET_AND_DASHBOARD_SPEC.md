Spécification Technique : CRUD Administrateur, Richesse & Équipement, Feuille Complète, Calepin Réaliste, Calendrier & Dashboard Global
1. Schéma Prisma Complémentaire (prisma/schema.prisma)

model ClassFeature {
id             String       @id @default(cuid())
sourceBookId   String
sourceBook     SourceBook   @relation(fields: [sourceBookId], references: [id], onDelete: Cascade)
dndClassId     String
dndClass       DndClass     @relation(fields: [dndClassId], references: [id], onDelete: Cascade)
dndSubclassId  String?
dndSubclass    DndSubclass? @relation(fields: [dndSubclassId], references: [id], onDelete: Cascade)
level          Int
name           String
description    String       @db.Text
createdAt      DateTime     @default(now())
updatedAt      DateTime     @updatedAt

@@map("class_features")
}

model CampaignNote {
id          String              @id @default(cuid())
campaignId  String
authorId    String
title       String
content     String              @db.Text
imageUrl    String?
isPublic    Boolean             @default(false)
campaign    Campaign            @relation(fields: [campaignId], references: [id], onDelete: Cascade)
shares      CampaignNoteShare[]
createdAt   DateTime            @default(now())
updatedAt   DateTime            @updatedAt

@@map("campaign_notes")
}

model CampaignNoteShare {
id        String       @id @default(cuid())
noteId    String
userId    String
note      CampaignNote @relation(fields: [noteId], references: [id], onDelete: Cascade)

@@unique([noteId, userId])
@@map("campaign_note_shares")
}

Champs obligatoires à ajouter sur le modèle existant Character :

    copperPieces: Int (default: 0)

    silverPieces: Int (default: 0)

    electrumPieces: Int (default: 0)

    goldPieces: Int (default: 0)

    platinumPieces: Int (default: 0)

    personalityTraits: String? (@db.Text)

    ideals: String? (@db.Text)

    bonds: String? (@db.Text)

    flaws: String? (@db.Text)

    appearance: String? (@db.Text)

    backstory: String? (@db.Text)

    alliesOrganizations: String? (@db.Text)

2. Module d'Administration Globale CRUD (/admin/...)

Fournir pour chaque entité la liste paginée avec recherche/filtres, le formulaire de création, le formulaire d'édition et la suppression sécurisée :

    /admin/spells : CRUD complet des sorts. Champs : nom, niveau (0 à 9), école de magie, temps d'incantation, portée, composantes (V, S, M et coût des matériaux), durée, concentration (booléen), rituel (booléen), description officielle intégrale, évolution aux niveaux supérieurs, classes éligibles et livre source associé.

    /admin/items : CRUD complet des armes, armures, boucliers et outils. Champs : nom, type (WEAPON, ARMOR, SHIELD, TOOL, GEAR), coût en pièces d'or, poids en livres, description, formule de dégâts, type de dégâts, propriétés martiales, propriété de Weapon Mastery 2024 liée, CA de base, modificateur max de DEX, prérequis de Force, désavantage en Discrétion, catégorie d'outil et livre source associé.

    /admin/feats : CRUD complet des dons. Champs : nom, catégorie (ORIGIN, FIGHTING_STYLE, GENERAL, EPIC_BOON), niveau requis (1, 4, 19), prérequis textuels, description complète officielle, modificateurs d'attributs au format JSON et livre source associé.

    /admin/monsters : CRUD complet du bestiaire. Champs : nom, taille, type, alignement, Facteur de Puissance (CR de 0 à 30), CA, PV, dés de vie, vitesses de déplacement, 6 caractéristiques, sauvegardes, compétences, vulnérabilités, résistances, immunités aux dégâts et conditions, sens, perception passive, langues, traits passifs, actions d'attaque, actions bonus, réactions, actions légendaires et actions de repaire.

    /admin/class-features : CRUD complet des aptitudes de classe et sous-classe par palier de niveau (1 à 20) avec texte descriptif complet.

3. Rigueur du Wizard de Personnage (CharacterWizard.tsx)

    Équipement et Gestion de la Richesse :

    Choix exclusif entre deux modes : dotation par pack de départ officiel OU attribution de la bourse d'or de départ (ex: 5d4 x 10 PO pour guerrier).

    Affichage obligatoire du prix en pièces d'or (PO) et du poids pour chaque équipement affiché.

    Blocage strict : interdiction de sélectionner des équipements non inclus dans le pack sans disposer du montant d'or requis.

    Enregistrement des pièces de monnaie initiales dans les champs copperPieces, silverPieces, electrumPieces, goldPieces, platinumPieces.

    Sélection et Affichage des Sorts :

    Séparation visuelle obligatoire et nette entre les Tours de magie (Niveau 0) et les Sorts de Niveau 1.

    Affichage pour chaque sort de sa fiche descriptive intégrale (École, Portée, Composantes, Durée, Description complète sans troncature).

    Écran Récapitulatif Final :

    Affichage des caractéristiques complètes et des modificateurs finaux calculés.

    Détail de la bourse (PC, PA, PE, PO, PP).

    Inventaire complet avec calcul automatique de la Classe d'Armure (CA) selon l'armure et le bouclier équipés.

    Liste détaillée des aptitudes de classe accordées au niveau 1 chargées depuis la table ClassFeature.

    Liste complète des sorts choisis et préparés.

    Don d'origine accordé avec description intégrale.

4. Feuille de Personnage Complète (/characters/[id])

    Onglet Grimoire / Sorts :

    Affichage hiérarchisé des sorts par niveau d'emplacement.

    Calculateur automatique du Degré de Difficulté (DD) des sorts : 8 + Bonus de Maîtrise + Modificateur de Caractéristique d'Incantation.

    Calculateur automatique du Bonus d'Attaque de Sort : Bonus de Maîtrise + Modificateur de Caractéristique d'Incantation.

    Fiches descriptives complètes consultables au clic ou au survol.

    Onglet Inventaire et Richesse :

    Affichage et modification directe des réserves de monnaie (PC, PA, PE, PO, PP).

    Calcul du poids total transporté et comparaison avec la capacité de charge maximale (Force x 7,5 kg).

    Bouton pour équiper ou déséquiper instantanément armures, boucliers et armes, recalculant immédiatement la CA et les jets d'attaque.

    Onglet Dons et Aptitudes :

    Liste exhaustive des dons possédés avec description officielle complète.

    Liste des aptitudes de classe débloquées selon le niveau actuel du personnage.

    Onglet Biographie Style Grimoire Ancien :

    Présentation visuelle soignée sous forme de tome relié.

    Champs modifiables et persistés : Traits de personnalité, Idéaux, Liens, Défauts, Apparence physique (Âge, Taille, Poids, Yeux, Peau, Cheveux), Histoire personnelle (Backstory), et Alliés & Organisations.

5. Calepin de Notes Réaliste (/campaigns/[id]/notes)

    Esthétique : habillage graphique type parchemin vieilli avec typographie élégante.

    Fonctionnalités :

        Création, modification sur place et suppression avec modale de confirmation.

        Ajout d'images par téléversement direct ou capture d'écran via stockage S3/Blob.

        Visibilité paramétrable par note : Privée (auteur seul), Publique (tous les participants de la campagne), ou Partagée sélectivement avec des joueurs ciblés via CampaignNoteShare.

6. Dashboard Centralisé et Calendrier Global (/dashboard)

    Section Mes Personnages : cartes de personnages affichant l'avatar, le niveau, la classe, les PV et la campagne rattachée.

    Section Mes Campagnes : cartes interactives des campagnes actives en tant que Maître du Jeu ou Joueur.

    Section Calendrier Global Unifié :

        Vue calendrier interactive regroupant l'ensemble des sessions prévues à travers toutes les campagnes de l'utilisateur.

        Code couleur distinct par campagne.

        Clic sur une session : affichage de la date, de l'heure, des participants confirmés, du bouton de présence (Présent/Absent) et du lien d'accès direct à la campagne.