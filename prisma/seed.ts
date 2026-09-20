import { PrismaClient, UserRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

const ids = {
  admin: "seed_admin",
  dm: "seed_dm",
  playerOne: "seed_player_one",
  playerTwo: "seed_player_two",
  playerThree: "seed_player_three",
  campaign: "seed_campaign",
  characterOne: "seed_character_one",
  characterTwo: "seed_character_two",
  characterThree: "seed_character_three",
  notebook: "seed_notebook_one",
  locationPublic: "seed_location_public",
  locationSecret: "seed_location_secret",
  npcPublic: "seed_npc_public",
  npcSecret: "seed_npc_secret",
  shop: "seed_shop",
  rule: "seed_schedule_rule",
  gameOne: "seed_game_one",
  gameTwo: "seed_game_two",
  session: "seed_session_one",
  feedbackPublic: "seed_feedback_public",
  feedbackPrivate: "seed_feedback_private",
  conversation: "seed_conversation",
  messageOne: "seed_message_one",
  messageTwo: "seed_message_two",
  messageThree: "seed_message_three",
  messageFour: "seed_message_four",
  report: "seed_report_pending",
} as const;

const users = [
  { id: ids.admin, email: "admin.seed@rope-trick.test", name: "Ariane Admin", nickname: "admin_seed", role: UserRole.ADMIN },
  { id: ids.dm, email: "dm.seed@rope-trick.test", name: "Maël le Gardien", nickname: "mael_dm", role: UserRole.USER },
  { id: ids.playerOne, email: "nora.seed@rope-trick.test", name: "Nora Forgepierre", nickname: "nora_forgepierre", role: UserRole.USER },
  { id: ids.playerTwo, email: "elena.seed@rope-trick.test", name: "Elena Clairbois", nickname: "elena_clairbois", role: UserRole.USER },
  { id: ids.playerThree, email: "sam.seed@rope-trick.test", name: "Sam Petitpas", nickname: "sam_petitpas", role: UserRole.USER },
] as const;

async function seedUsers() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: { ...user, status: UserStatus.ACTIVE },
      update: { ...user, status: UserStatus.ACTIVE },
    });
  }
}

async function seedCharacters() {
  await prisma.character.upsert({
    where: { id: ids.characterOne },
    create: {
      id: ids.characterOne,
      userId: ids.playerOne,
      name: "Borin Marteau-Sombre",
      race: "Nain",
      class: "Guerrier",
      subclass: "Champion",
      level: 5,
      stats: { abilities: { str: 18, dex: 12, con: 16, int: 10, wis: 13, cha: 8 }, hitPoints: { current: 47, max: 52 }, armorClass: 18, speed: { walk: 25 }, inventory: ["Hache de bataille", "Bouclier", "Potion de soins"] },
    },
    update: { userId: ids.playerOne, name: "Borin Marteau-Sombre", race: "Nain", class: "Guerrier", subclass: "Champion", level: 5, stats: { abilities: { str: 18, dex: 12, con: 16, int: 10, wis: 13, cha: 8 }, hitPoints: { current: 47, max: 52 }, armorClass: 18, speed: { walk: 25 }, inventory: ["Hache de bataille", "Bouclier", "Potion de soins"] } },
  });
  await prisma.character.upsert({
    where: { id: ids.characterTwo },
    create: { id: ids.characterTwo, userId: ids.playerTwo, name: "Lyra Lueur-d’Aube", race: "Elfe", class: "Magicienne", subclass: "Évocation", level: 5, stats: { abilities: { str: 8, dex: 14, con: 12, int: 18, wis: 13, cha: 11 }, hitPoints: { current: 26, max: 28 }, armorClass: 12, speed: { walk: 30 }, inventory: ["Grimoire", "Bâton arcanique", "Composants"] } },
    update: { userId: ids.playerTwo, name: "Lyra Lueur-d’Aube", race: "Elfe", class: "Magicienne", subclass: "Évocation", level: 5, stats: { abilities: { str: 8, dex: 14, con: 12, int: 18, wis: 13, cha: 11 }, hitPoints: { current: 26, max: 28 }, armorClass: 12, speed: { walk: 30 }, inventory: ["Grimoire", "Bâton arcanique", "Composants"] } },
  });
  await prisma.character.upsert({
    where: { id: ids.characterThree },
    create: { id: ids.characterThree, userId: ids.playerThree, name: "Pip Pique-Étoile", race: "Halfelin", class: "Roublard", subclass: "Voleur", level: 5, stats: { abilities: { str: 10, dex: 18, con: 12, int: 14, wis: 10, cha: 14 }, hitPoints: { current: 34, max: 35 }, armorClass: 16, speed: { walk: 25 }, inventory: ["Dague fine", "Outils de voleur", "Cape sombre"] } },
    update: { userId: ids.playerThree, name: "Pip Pique-Étoile", race: "Halfelin", class: "Roublard", subclass: "Voleur", level: 5, stats: { abilities: { str: 10, dex: 18, con: 12, int: 14, wis: 10, cha: 14 }, hitPoints: { current: 34, max: 35 }, armorClass: 16, speed: { walk: 25 }, inventory: ["Dague fine", "Outils de voleur", "Cape sombre"] } },
  });
  await prisma.characterNotebook.upsert({ where: { id: ids.notebook }, create: { id: ids.notebook, characterId: ids.characterOne, title: "Chronique de la mine", subject: "Quêtes", content: "# La mine oubliée\n\n- Retrouver la clé runique.\n- Interroger le vieux cartographe." }, update: { characterId: ids.characterOne, title: "Chronique de la mine", subject: "Quêtes", content: "# La mine oubliée\n\n- Retrouver la clé runique.\n- Interroger le vieux cartographe." } });
}

async function seedCampaignAndLore() {
  await prisma.campaign.upsert({ where: { id: ids.campaign }, create: { id: ids.campaign, dmId: ids.dm, title: "Les Cendres de Valombre", description: "Une expédition aux frontières d’un royaume oublié.", inviteCode: "VALOMBRE7" }, update: { dmId: ids.dm, title: "Les Cendres de Valombre", description: "Une expédition aux frontières d’un royaume oublié.", inviteCode: "VALOMBRE7" } });
  const members = [
    { userId: ids.dm, role: "DM" as const },
    { userId: ids.playerOne, role: "PLAYER" as const },
    { userId: ids.playerTwo, role: "PLAYER" as const },
    { userId: ids.playerThree, role: "PLAYER" as const },
  ];
  for (const member of members) await prisma.campaignMember.upsert({ where: { campaignId_userId: { campaignId: ids.campaign, userId: member.userId } }, create: { campaignId: ids.campaign, ...member }, update: { role: member.role } });
  for (const character of [
    { characterId: ids.characterOne, playerId: ids.playerOne },
    { characterId: ids.characterTwo, playerId: ids.playerTwo },
    { characterId: ids.characterThree, playerId: ids.playerThree },
  ])
    await prisma.campaignCharacter.upsert({ where: { campaignId_characterId: { campaignId: ids.campaign, characterId: character.characterId } }, create: { campaignId: ids.campaign, ...character, isActive: true }, update: { playerId: character.playerId, isActive: true } });
  await prisma.location.upsert({ where: { id: ids.locationPublic }, create: { id: ids.locationPublic, campaignId: ids.campaign, name: "Port-Éclat", description: "Un port marchand bâti sur des falaises blanches.", isSecretDm: false }, update: { campaignId: ids.campaign, name: "Port-Éclat", description: "Un port marchand bâti sur des falaises blanches.", isSecretDm: false } });
  await prisma.location.upsert({ where: { id: ids.locationSecret }, create: { id: ids.locationSecret, campaignId: ids.campaign, name: "Crypte de l’Aube", description: "Une crypte cachée sous le phare.", isSecretDm: true }, update: { campaignId: ids.campaign, name: "Crypte de l’Aube", description: "Une crypte cachée sous le phare.", isSecretDm: true } });
  await prisma.nPC.upsert({ where: { id: ids.npcPublic }, create: { id: ids.npcPublic, campaignId: ids.campaign, name: "Mara la Navigatrice", race: "Humaine", occupation: "Capitaine", appearance: "Une capitaine au manteau bleu nuit.", isSecretDm: false }, update: { campaignId: ids.campaign, name: "Mara la Navigatrice", race: "Humaine", occupation: "Capitaine", appearance: "Une capitaine au manteau bleu nuit.", isSecretDm: false, secretsDm: null } });
  await prisma.nPC.upsert({ where: { id: ids.npcSecret }, create: { id: ids.npcSecret, campaignId: ids.campaign, name: "Le Veilleur Cendré", race: "Inconnu", occupation: "Gardien", appearance: "Une silhouette encapuchonnée.", secretsDm: "Il sert le dragon sous la montagne.", isSecretDm: true }, update: { campaignId: ids.campaign, name: "Le Veilleur Cendré", race: "Inconnu", occupation: "Gardien", appearance: "Une silhouette encapuchonnée.", secretsDm: "Il sert le dragon sous la montagne.", isSecretDm: true } });
  await prisma.shop.upsert({ where: { id: ids.shop }, create: { id: ids.shop, campaignId: ids.campaign, locationId: ids.locationPublic, keeperNpcId: ids.npcPublic, name: "La Bourse du Marin", shopType: "Équipement" }, update: { campaignId: ids.campaign, locationId: ids.locationPublic, keeperNpcId: ids.npcPublic, name: "La Bourse du Marin", shopType: "Équipement" } });
  for (const item of [
    { id: "seed_item_potion", name: "Potion de soins", priceCp: 500, rarity: "COMMON" as const, description: "Restaure 2d4+2 PV." },
    { id: "seed_item_rope", name: "Corde de chanvre", priceCp: 100, rarity: "MUNDANE" as const, description: "Une corde solide de 15 mètres." },
    { id: "seed_item_sword", name: "Épée longue", priceCp: 1500, rarity: "MUNDANE" as const, description: "Une lame équilibrée pour aventurier." },
  ])
    await prisma.shopItem.upsert({ where: { id: item.id }, create: { ...item, shopId: ids.shop, isMagic: false, stockQuantity: 5 }, update: { ...item, shopId: ids.shop, isMagic: false, stockQuantity: 5 } });
}

async function seedScheduleAndSessions() {
  await prisma.scheduleRule.upsert({ where: { id: ids.rule }, create: { id: ids.rule, campaignId: ids.campaign, frequency: "WEEKLY", dayOfWeek: 5, startTime: "19:00", durationMinutes: 180 }, update: { campaignId: ids.campaign, frequency: "WEEKLY", dayOfWeek: 5, startTime: "19:00", durationMinutes: 180 } });
  const now = new Date();
  for (const game of [
    { id: ids.gameOne, dateTime: new Date(now.getTime() + 7 * 86400000), title: "La piste des cendres" },
    { id: ids.gameTwo, dateTime: new Date(now.getTime() + 14 * 86400000), title: "Le phare silencieux" },
  ]) {
    await prisma.scheduledGame.upsert({ where: { id: game.id }, create: { ...game, campaignId: ids.campaign, scheduleRuleId: ids.rule, status: "SCHEDULED" }, update: { ...game, campaignId: ids.campaign, scheduleRuleId: ids.rule, status: "SCHEDULED" } });
  }
  for (const attendance of [
    { gameId: ids.gameOne, userId: ids.playerOne, status: "ATTENDING" as const },
    { gameId: ids.gameOne, userId: ids.playerTwo, status: "TENTATIVE" as const },
    { gameId: ids.gameOne, userId: ids.playerThree, status: "NOT_ATTENDING" as const },
    { gameId: ids.gameTwo, userId: ids.playerOne, status: "TENTATIVE" as const },
  ])
    await prisma.gameAttendance.upsert({ where: { gameId_userId: { gameId: attendance.gameId, userId: attendance.userId } }, create: { ...attendance }, update: { status: attendance.status } });
  const playedAt = new Date(now.getTime() - 7 * 86400000);
  await prisma.sessionLog.upsert({ where: { id: ids.session }, create: { id: ids.session, campaignId: ids.campaign, sessionNumber: 1, title: "Les lanternes de Port-Éclat", playedAt, summary: "Le groupe arrive à Port-Éclat et découvre la piste d’un convoi disparu.", dmNotes: "Le Veilleur Cendré observait les héros depuis le phare." }, update: { campaignId: ids.campaign, sessionNumber: 1, title: "Les lanternes de Port-Éclat", playedAt, summary: "Le groupe arrive à Port-Éclat et découvre la piste d’un convoi disparu.", dmNotes: "Le Veilleur Cendré observait les héros depuis le phare." } });
  for (const attendee of [
    { userId: ids.playerOne, characterId: ids.characterOne },
    { userId: ids.playerTwo, characterId: ids.characterTwo },
    { userId: ids.playerThree, characterId: ids.characterThree },
  ])
    await prisma.sessionAttendee.upsert({ where: { sessionId_userId: { sessionId: ids.session, userId: attendee.userId } }, create: { sessionId: ids.session, ...attendee }, update: { characterId: attendee.characterId } });
  await prisma.sessionVisitedLocation.upsert({ where: { sessionId_locationId: { sessionId: ids.session, locationId: ids.locationPublic } }, create: { sessionId: ids.session, locationId: ids.locationPublic }, update: {} });
  await prisma.sessionMetNPC.upsert({ where: { sessionId_npcId: { sessionId: ids.session, npcId: ids.npcPublic } }, create: { sessionId: ids.session, npcId: ids.npcPublic }, update: {} });
  await prisma.sessionFeedback.upsert({ where: { id: ids.feedbackPublic }, create: { id: ids.feedbackPublic, sessionId: ids.session, userId: ids.playerOne, rating: 5, comment: "Une excellente ouverture de campagne.", isPublic: true }, update: { sessionId: ids.session, userId: ids.playerOne, rating: 5, comment: "Une excellente ouverture de campagne.", isPublic: true } });
  await prisma.sessionFeedback.upsert({ where: { id: ids.feedbackPrivate }, create: { id: ids.feedbackPrivate, sessionId: ids.session, userId: ids.playerTwo, rating: 3, comment: "Le rythme était parfois difficile à suivre.", isPublic: false }, update: { sessionId: ids.session, userId: ids.playerTwo, rating: 3, comment: "Le rythme était parfois difficile à suivre.", isPublic: false } });
}

async function seedChat() {
  await prisma.conversation.upsert({ where: { id: ids.conversation }, create: { id: ids.conversation, isGroup: true, title: "Table de Valombre" }, update: { isGroup: true, title: "Table de Valombre" } });
  for (const userId of [ids.dm, ids.playerOne, ids.playerTwo, ids.playerThree]) await prisma.conversationParticipant.upsert({ where: { conversationId_userId: { conversationId: ids.conversation, userId } }, create: { conversationId: ids.conversation, userId, isAdmin: userId === ids.dm }, update: { isAdmin: userId === ids.dm } });
  const messages = [
    { id: ids.messageOne, senderId: ids.dm, content: "Bienvenue à Port-Éclat !" },
    { id: ids.messageTwo, senderId: ids.playerOne, content: "Borin est prêt à explorer les quais." },
    { id: ids.messageThree, senderId: ids.playerTwo, content: "Lyra a préparé ses sorts de lumière." },
    { id: ids.messageFour, senderId: ids.playerThree, content: "SPAM : ce message déplacé doit être modéré." },
  ];
  for (const message of messages) await prisma.chatMessage.upsert({ where: { id: message.id }, create: { ...message, conversationId: ids.conversation }, update: { ...message, conversationId: ids.conversation, isDeleted: false } });
  await prisma.messageReport.upsert({ where: { id: ids.report }, create: { id: ids.report, reporterId: ids.playerOne, messageId: ids.messageFour, reason: "SPAM", status: "PENDING" }, update: { reporterId: ids.playerOne, messageId: ids.messageFour, reason: "SPAM", status: "PENDING" } });
}

async function main() {
  await seedUsers();
  await seedCharacters();
  await seedCampaignAndLore();
  await seedScheduleAndSessions();
  await seedChat();
  console.log("Seed completed: Rope Trick demo data is ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
