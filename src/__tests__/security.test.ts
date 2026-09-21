import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  campaignMemberFindUnique: vi.fn(),
  campaignFindUnique: vi.fn(),
  userFindUnique: vi.fn(),
  locationFindMany: vi.fn(),
  npcFindMany: vi.fn(),
  shopFindMany: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    campaignMember: { findUnique: mocks.campaignMemberFindUnique },
    campaign: { findUnique: mocks.campaignFindUnique },
    user: { findUnique: mocks.userFindUnique },
    location: { findMany: mocks.locationFindMany },
    nPC: { findMany: mocks.npcFindMany },
    shop: { findMany: mocks.shopFindMany },
  },
}));

import { getCampaignDetails } from "@/modules/campaigns/server/campaign-service";
import { parseFoundryActor } from "@/modules/characters/server/foundry-parser";
import { updateUserStatus } from "@/modules/users/server/admin-service";
import { AdminAuthorizationError } from "@/modules/users/server/admin-types";
import { getLoreDirectory } from "@/modules/lore/server/lore-service";

describe("security-critical business rules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not expose DM campaign notes to a player", async () => {
    mocks.campaignMemberFindUnique.mockResolvedValue({ role: "PLAYER" });
    mocks.campaignFindUnique.mockResolvedValue({
      id: "campaign-1",
      dmId: "dm-1",
      title: "Test campaign",
      description: "Test",
      inviteCode: "TEST123",
      members: [{ id: "member-1", role: "PLAYER", dmPrivateNotes: "Private note", joinedAt: new Date(), user: { id: "player-1", name: "Player", nickname: "player", avatarUrl: null } }],
      characters: [],
    });

    const result = await getCampaignDetails("campaign-1", "player-1");

    expect(result.members[0]).not.toHaveProperty("dmPrivateNotes");
  });

  it("filters secret locations, NPCs and secret fields for a player", async () => {
    mocks.campaignMemberFindUnique.mockResolvedValue({ role: "PLAYER" });
    mocks.locationFindMany.mockResolvedValue([{ id: "public-location", name: "Port", description: "Public", isSecretDm: false }]);
    mocks.npcFindMany.mockResolvedValue([{ id: "public-npc", campaignId: "campaign-1", name: "Mara", race: "Human", occupation: "Captain", appearance: "Public", isSecretDm: false }]);
    mocks.shopFindMany.mockResolvedValue([]);

    const result = await getLoreDirectory("campaign-1", "player-1");

    expect(result.locations.every((location) => !location.isSecretDm)).toBe(true);
    expect(result.npcs.every((npc) => !npc.isSecretDm && !Object.hasOwn(npc, "secretsDm"))).toBe(true);
  });

  it("rejects an administrator attempting to suspend themselves", async () => {
    mocks.auth.mockResolvedValue({ userId: "admin-1" });
    mocks.userFindUnique.mockResolvedValue({ id: "admin-1", role: "ADMIN", status: "ACTIVE" });

    await expect(updateUserStatus("admin-1", "SUSPENDED", "self-test")).rejects.toBeInstanceOf(AdminAuthorizationError);
  });

  it("extracts Foundry v12 actor data and preserves the raw payload", () => {
    const rawActor = {
      _id: "foundry-actor-1",
      name: "Borin Marteau-Sombre",
      img: "https://example.test/borin.webp",
      system: {
        details: { race: { name: "Nain" }, class: { name: "Guerrier" }, level: 5 },
        abilities: { str: { value: 18 }, dex: { value: 12 } },
        attributes: { hp: { value: 42, max: 50 }, ac: { value: 18 }, movement: { walk: 25 } },
      },
      flags: { core: { version: "12.331" } },
      items: [{ name: "Hache de bataille", type: "weapon", system: { quantity: 1, equipped: true } }],
    };

    const parsed = parseFoundryActor(rawActor);

    expect(parsed.name).toBe("Borin Marteau-Sombre");
    expect(parsed.race).toBe("Nain");
    expect(parsed.class).toBe("Guerrier");
    expect(parsed.level).toBe(5);
    expect(parsed.stats).toMatchObject({ hitPoints: { current: 42, max: 50 }, armorClass: 18, speed: { walk: 25 } });
    expect(parsed.rawImportData).toEqual(rawActor);
  });
});
