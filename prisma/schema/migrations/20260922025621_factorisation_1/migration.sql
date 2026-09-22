-- CreateEnum
CREATE TYPE "Alignment" AS ENUM ('LAWFUL_GOOD', 'NEUTRAL_GOOD', 'CHAOTIC_GOOD', 'LAWFUL_NEUTRAL', 'TRUE_NEUTRAL', 'CHAOTIC_NEUTRAL', 'LAWFUL_EVIL', 'NEUTRAL_EVIL', 'CHAOTIC_EVIL', 'UNALIGNED');

-- CreateEnum
CREATE TYPE "AbilityScore" AS ENUM ('STRENGTH', 'DEXTERITY', 'CONSTITUTION', 'INTELLIGENCE', 'WISDOM', 'CHARISMA');

-- CreateEnum
CREATE TYPE "CreatureSize" AS ENUM ('TINY', 'SMALL', 'MEDIUM', 'LARGE', 'HUGE', 'GARGANTUAN');

-- CreateEnum
CREATE TYPE "ResetCondition" AS ENUM ('SHORT_REST', 'LONG_REST', 'SPECIAL');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'ARMOR', 'SHIELD', 'TOOL', 'GEAR', 'CONSUMABLE', 'AMMUNITION');

-- CreateEnum
CREATE TYPE "ItemRarity" AS ENUM ('MUNDANE', 'COMMON', 'UNCOMMON', 'RARE', 'VERY_RARE', 'LEGENDARY', 'ARTIFACT');

-- CreateEnum
CREATE TYPE "ArmorCategory" AS ENUM ('NONE', 'LIGHT', 'MEDIUM', 'HEAVY', 'SHIELD');

-- CreateEnum
CREATE TYPE "SpellcastingProgression" AS ENUM ('NONE', 'FULL', 'HALF', 'THIRD', 'PACT', 'ARTIFICER');

-- CreateEnum
CREATE TYPE "SkillProficiency" AS ENUM ('NONE', 'PROFICIENT', 'EXPERTISE');

-- CreateEnum
CREATE TYPE "CampaignRole" AS ENUM ('DM', 'CO_DM', 'PLAYER');

-- CreateEnum
CREATE TYPE "ScheduleFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ScheduledGameStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('ATTENDING', 'NOT_ATTENDING', 'TENTATIVE', 'NO_REPLY');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "MessageReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'OTHER');

-- CreateEnum
CREATE TYPE "MessageReportStatus" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "dm_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "invite_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_source_books" (
    "campaign_id" TEXT NOT NULL,
    "source_book_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "campaign_source_books_pkey" PRIMARY KEY ("campaign_id","source_book_id")
);

-- CreateTable
CREATE TABLE "campaign_members" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "CampaignRole" NOT NULL,
    "dm_private_notes" TEXT,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_characters" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "campaign_characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_secret_dm" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "npcs" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT,
    "occupation" TEXT,
    "appearance" TEXT NOT NULL,
    "secrets_dm" TEXT,
    "is_secret_dm" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "npcs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "location_id" TEXT,
    "keeper_npc_id" TEXT,
    "name" TEXT NOT NULL,
    "shop_type" TEXT NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_items" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" "ItemRarity" NOT NULL,
    "is_magic" BOOLEAN NOT NULL DEFAULT false,
    "price_cp" INTEGER NOT NULL,
    "stock_quantity" INTEGER NOT NULL DEFAULT -1,

    CONSTRAINT "shop_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_rules" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "frequency" "ScheduleFrequency" NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,

    CONSTRAINT "schedule_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_games" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "schedule_rule_id" TEXT,
    "date_time" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ScheduledGameStatus" NOT NULL,

    CONSTRAINT "scheduled_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_attendance" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "comment" TEXT,

    CONSTRAINT "game_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_notes" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "is_shared" BOOLEAN NOT NULL,
    "image_url" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_note_shares" (
    "id" TEXT NOT NULL,
    "note_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "campaign_note_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_logs" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "scheduled_game_id" TEXT,
    "session_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "played_at" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "dm_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_attendees" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "character_id" TEXT,

    CONSTRAINT "session_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_visited_locations" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,

    CONSTRAINT "session_visited_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_met_npcs" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "npc_id" TEXT NOT NULL,

    CONSTRAINT "session_met_npcs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_feedback" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_notes" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "character_id" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "alignment" "Alignment" DEFAULT 'TRUE_NEUTRAL',
    "race" TEXT,
    "class" TEXT,
    "subclass" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience_points" INTEGER NOT NULL DEFAULT 0,
    "stats" JSONB NOT NULL,
    "foundry_actor_id" TEXT,
    "foundry_version" TEXT,
    "raw_import_data" JSONB,
    "species_id" TEXT,
    "subspecies_id" TEXT,
    "background_id" TEXT,
    "dnd_class_id" TEXT,
    "subclass_id" TEXT,
    "strength" INTEGER NOT NULL DEFAULT 10,
    "dexterity" INTEGER NOT NULL DEFAULT 10,
    "constitution" INTEGER NOT NULL DEFAULT 10,
    "intelligence" INTEGER NOT NULL DEFAULT 10,
    "wisdom" INTEGER NOT NULL DEFAULT 10,
    "charisma" INTEGER NOT NULL DEFAULT 10,
    "strength_mod" INTEGER NOT NULL DEFAULT 0,
    "dexterity_mod" INTEGER NOT NULL DEFAULT 0,
    "constitution_mod" INTEGER NOT NULL DEFAULT 0,
    "intelligence_mod" INTEGER NOT NULL DEFAULT 0,
    "wisdom_mod" INTEGER NOT NULL DEFAULT 0,
    "charisma_mod" INTEGER NOT NULL DEFAULT 0,
    "saving_throws" JSONB NOT NULL DEFAULT '{}',
    "skill_proficiencies" JSONB NOT NULL DEFAULT '{}',
    "spell_slots" JSONB DEFAULT '{}',
    "max_hit_points" INTEGER NOT NULL DEFAULT 1,
    "current_hit_points" INTEGER NOT NULL DEFAULT 1,
    "temporary_hit_points" INTEGER NOT NULL DEFAULT 0,
    "death_saves" JSONB NOT NULL DEFAULT '{"successes":0,"failures":0}',
    "exhaustion_level" INTEGER NOT NULL DEFAULT 0,
    "hit_die" INTEGER NOT NULL DEFAULT 8,
    "hit_dice_total" INTEGER NOT NULL DEFAULT 1,
    "hit_dice_current" INTEGER NOT NULL DEFAULT 1,
    "armor_class" INTEGER NOT NULL DEFAULT 10,
    "initiative" INTEGER NOT NULL DEFAULT 0,
    "speed" INTEGER NOT NULL DEFAULT 30,
    "spell_save_dc" INTEGER,
    "spell_attack_bonus" INTEGER,
    "inspiration" BOOLEAN NOT NULL DEFAULT false,
    "theme_key" TEXT NOT NULL DEFAULT 'warrior',
    "armor_category" "ArmorCategory" NOT NULL DEFAULT 'NONE',
    "armor_base_class" INTEGER,
    "armor_dex_cap" INTEGER,
    "shield_bonus" INTEGER NOT NULL DEFAULT 0,
    "selected_feats" JSONB NOT NULL DEFAULT '[]',
    "copper_pieces" INTEGER NOT NULL DEFAULT 0,
    "silver_pieces" INTEGER NOT NULL DEFAULT 0,
    "electrum_pieces" INTEGER NOT NULL DEFAULT 0,
    "gold_pieces" INTEGER NOT NULL DEFAULT 0,
    "platinum_pieces" INTEGER NOT NULL DEFAULT 0,
    "personality_traits" TEXT,
    "ideals" TEXT,
    "bonds" TEXT,
    "flaws" TEXT,
    "appearance" TEXT,
    "backstory" TEXT,
    "allies_organizations" TEXT,
    "notebook_theme" TEXT DEFAULT 'parchment',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_spells" (
    "character_id" TEXT NOT NULL,
    "spell_id" TEXT NOT NULL,
    "prepared" BOOLEAN NOT NULL DEFAULT false,
    "learned" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "character_spells_pkey" PRIMARY KEY ("character_id","spell_id")
);

-- CreateTable
CREATE TABLE "character_inventory_items" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "equipment_id" TEXT,
    "custom_name" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "is_attuned" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "character_inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_weapon_masteries" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "mastery_id" TEXT NOT NULL,

    CONSTRAINT "character_weapon_masteries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_resource_trackers" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "current_value" INTEGER NOT NULL,
    "max_value" INTEGER NOT NULL,
    "dice_formula" TEXT,
    "reset_condition" "ResetCondition" NOT NULL,

    CONSTRAINT "character_resource_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_languages" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,

    CONSTRAINT "character_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_notebooks" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_shared" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_notebooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_attachments" (
    "id" TEXT NOT NULL,
    "notebook_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_books" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "is_official" BOOLEAN NOT NULL DEFAULT true,
    "enabled_by_default" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "species" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "speed" INTEGER NOT NULL DEFAULT 30,
    "size" "CreatureSize" NOT NULL DEFAULT 'MEDIUM',
    "darkvision" INTEGER,
    "traits" JSONB NOT NULL DEFAULT '[]',
    "innate_spell_ids" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "source_book_id" TEXT,

    CONSTRAINT "species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subspecies" (
    "id" TEXT NOT NULL,
    "species_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "speed" INTEGER,
    "traits" JSONB NOT NULL DEFAULT '[]',
    "source_book_id" TEXT,

    CONSTRAINT "subspecies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backgrounds" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'XPHB',
    "page" TEXT,
    "description" TEXT,
    "ability_choices" JSONB NOT NULL DEFAULT '[]',
    "origin_feat_id" TEXT,
    "skill_proficiencies" JSONB NOT NULL DEFAULT '[]',
    "tool_proficiencies" JSONB NOT NULL DEFAULT '[]',
    "starting_equipment" JSONB NOT NULL DEFAULT '[]',
    "source_book_id" TEXT,

    CONSTRAINT "backgrounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feats" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'XPHB',
    "category" TEXT,
    "level_requirement" INTEGER NOT NULL DEFAULT 0,
    "prerequisite" TEXT,
    "description" TEXT,
    "repeatable" BOOLEAN NOT NULL DEFAULT false,
    "source_book_id" TEXT,

    CONSTRAINT "feats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dnd_classes" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hit_die" INTEGER NOT NULL,
    "saving_throws" JSONB NOT NULL DEFAULT '[]',
    "skill_choices" INTEGER NOT NULL DEFAULT 2,
    "skill_options" JSONB NOT NULL DEFAULT '[]',
    "spellcasting_ability" "AbilityScore",
    "spellcasting_progression" "SpellcastingProgression" NOT NULL DEFAULT 'NONE',
    "cantrip_progression" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "prepared_spells_progression" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "spell_slot_progression" JSONB,
    "class_table_groups" JSONB,
    "description" TEXT,
    "source_book_id" TEXT,

    CONSTRAINT "dnd_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dnd_subclasses" (
    "id" TEXT NOT NULL,
    "dnd_class_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "spellcasting_ability" "AbilityScore",
    "additional_spells" JSONB,
    "description" TEXT,
    "source_book_id" TEXT,

    CONSTRAINT "dnd_subclasses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_level_features" (
    "id" TEXT NOT NULL,
    "dnd_class_id" TEXT NOT NULL,
    "subclass_id" TEXT,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "class_level_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_features" (
    "id" TEXT NOT NULL,
    "source_book_id" TEXT NOT NULL,
    "dnd_class_id" TEXT NOT NULL,
    "dnd_subclass_id" TEXT,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_resource_definitions" (
    "id" TEXT NOT NULL,
    "dnd_class_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reset_condition" "ResetCondition" NOT NULL,
    "formula_by_level" JSONB NOT NULL,
    "dice_formula" TEXT,

    CONSTRAINT "class_resource_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spells" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'XPHB',
    "page" TEXT,
    "level" INTEGER NOT NULL,
    "school" TEXT NOT NULL,
    "casting_time" TEXT NOT NULL,
    "range" TEXT NOT NULL,
    "components" JSONB NOT NULL,
    "materials" TEXT,
    "duration" TEXT NOT NULL,
    "concentration" BOOLEAN NOT NULL DEFAULT false,
    "ritual" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "higher_levels" TEXT,
    "classes" JSONB NOT NULL DEFAULT '[]',
    "optional_classes" JSONB NOT NULL DEFAULT '[]',
    "subclasses" JSONB NOT NULL DEFAULT '[]',
    "source_book_id" TEXT,

    CONSTRAINT "spells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_definitions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ability" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "examples" TEXT NOT NULL,
    "source_book_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weapon_mastery_properties" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weapon_mastery_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_items" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "cost_cp" INTEGER,
    "cost_gp" DOUBLE PRECISION,
    "weight_lb" DOUBLE PRECISION,
    "type" "ItemType",
    "armor_category" "ArmorCategory",
    "armor_class" INTEGER,
    "dexterity_cap" INTEGER,
    "dexterity_bonus_max" INTEGER,
    "shield_bonus" INTEGER,
    "strength_requirement" INTEGER,
    "stealth_disadvantage" BOOLEAN NOT NULL DEFAULT false,
    "weapon_mastery" TEXT,
    "damage_formula" TEXT,
    "damage_type" TEXT,
    "properties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "range_normal" INTEGER,
    "range_long" INTEGER,
    "rarity" "ItemRarity" NOT NULL DEFAULT 'MUNDANE',
    "requires_attunement" BOOLEAN NOT NULL DEFAULT false,
    "is_magic" BOOLEAN NOT NULL DEFAULT false,
    "magic_bonus" INTEGER NOT NULL DEFAULT 0,
    "mastery_property_id" TEXT,
    "source_book_id" TEXT,

    CONSTRAINT "equipment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "is_exotic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monsters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "size" "CreatureSize" NOT NULL DEFAULT 'MEDIUM',
    "creature_type" TEXT NOT NULL,
    "subtype" TEXT,
    "alignment" TEXT,
    "challenge_rating" TEXT NOT NULL,
    "cr" DOUBLE PRECISION,
    "proficiency_bonus" INTEGER NOT NULL DEFAULT 2,
    "armor_class" INTEGER NOT NULL,
    "armor_type" TEXT,
    "hit_points" INTEGER NOT NULL,
    "hit_dice" TEXT,
    "speed" JSONB NOT NULL DEFAULT '{}',
    "strength" INTEGER NOT NULL DEFAULT 10,
    "dexterity" INTEGER NOT NULL DEFAULT 10,
    "constitution" INTEGER NOT NULL DEFAULT 10,
    "intelligence" INTEGER NOT NULL DEFAULT 10,
    "wisdom" INTEGER NOT NULL DEFAULT 10,
    "charisma" INTEGER NOT NULL DEFAULT 10,
    "saving_throws" JSONB NOT NULL DEFAULT '{}',
    "skills" JSONB NOT NULL DEFAULT '{}',
    "damage_vulnerabilities" JSONB NOT NULL DEFAULT '[]',
    "damage_resistances" JSONB NOT NULL DEFAULT '[]',
    "damage_immunities" JSONB NOT NULL DEFAULT '[]',
    "condition_immunities" JSONB NOT NULL DEFAULT '[]',
    "senses" JSONB NOT NULL DEFAULT '{}',
    "senses_text" TEXT,
    "passive_perception" INTEGER,
    "languages" JSONB NOT NULL DEFAULT '[]',
    "languages_text" TEXT,
    "traits" JSONB NOT NULL DEFAULT '[]',
    "actions" JSONB NOT NULL DEFAULT '[]',
    "bonus_actions" JSONB NOT NULL DEFAULT '[]',
    "reactions" JSONB NOT NULL DEFAULT '[]',
    "legendary_resistances" INTEGER NOT NULL DEFAULT 0,
    "legendary_actions" JSONB NOT NULL DEFAULT '[]',
    "legendary_actions_count" INTEGER NOT NULL DEFAULT 0,
    "lair_actions" JSONB NOT NULL DEFAULT '[]',
    "has_lair" BOOLEAN NOT NULL DEFAULT false,
    "regional_effects" JSONB NOT NULL DEFAULT '[]',
    "is_legendary" BOOLEAN NOT NULL DEFAULT false,
    "source_book_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monsters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "report_id" TEXT,
    "message_id" TEXT,
    "target_user_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_blocks" (
    "id" TEXT NOT NULL,
    "blocker_id" TEXT NOT NULL,
    "blocked_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "reason" "MessageReportReason" NOT NULL,
    "status" "MessageReportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "is_group" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_invite_code_key" ON "campaigns"("invite_code");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_members_campaign_id_user_id_key" ON "campaign_members"("campaign_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_characters_campaign_id_character_id_key" ON "campaign_characters"("campaign_id", "character_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_attendance_game_id_user_id_key" ON "game_attendance"("game_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_note_shares_note_id_user_id_key" ON "campaign_note_shares"("note_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_logs_scheduled_game_id_key" ON "session_logs"("scheduled_game_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_attendees_session_id_user_id_key" ON "session_attendees"("session_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_visited_locations_session_id_location_id_key" ON "session_visited_locations"("session_id", "location_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_met_npcs_session_id_npc_id_key" ON "session_met_npcs"("session_id", "npc_id");

-- CreateIndex
CREATE INDEX "session_notes_session_id_user_id_idx" ON "session_notes"("session_id", "user_id");

-- CreateIndex
CREATE INDEX "character_inventory_items_character_id_idx" ON "character_inventory_items"("character_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_weapon_masteries_character_id_mastery_id_key" ON "character_weapon_masteries"("character_id", "mastery_id");

-- CreateIndex
CREATE INDEX "character_resource_trackers_character_id_idx" ON "character_resource_trackers"("character_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_languages_character_id_language_id_key" ON "character_languages"("character_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "source_books_code_key" ON "source_books"("code");

-- CreateIndex
CREATE UNIQUE INDEX "species_slug_key" ON "species"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subspecies_slug_key" ON "subspecies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "backgrounds_slug_key" ON "backgrounds"("slug");

-- CreateIndex
CREATE INDEX "backgrounds_source_idx" ON "backgrounds"("source");

-- CreateIndex
CREATE UNIQUE INDEX "feats_slug_key" ON "feats"("slug");

-- CreateIndex
CREATE INDEX "feats_category_idx" ON "feats"("category");

-- CreateIndex
CREATE INDEX "feats_level_requirement_idx" ON "feats"("level_requirement");

-- CreateIndex
CREATE UNIQUE INDEX "dnd_classes_slug_key" ON "dnd_classes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "dnd_subclasses_slug_key" ON "dnd_subclasses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "class_level_features_dnd_class_id_subclass_id_level_name_key" ON "class_level_features"("dnd_class_id", "subclass_id", "level", "name");

-- CreateIndex
CREATE INDEX "class_features_dnd_class_id_level_idx" ON "class_features"("dnd_class_id", "level");

-- CreateIndex
CREATE INDEX "class_resource_definitions_dnd_class_id_idx" ON "class_resource_definitions"("dnd_class_id");

-- CreateIndex
CREATE UNIQUE INDEX "spells_slug_key" ON "spells"("slug");

-- CreateIndex
CREATE INDEX "spells_level_idx" ON "spells"("level");

-- CreateIndex
CREATE INDEX "spells_school_idx" ON "spells"("school");

-- CreateIndex
CREATE INDEX "spells_source_idx" ON "spells"("source");

-- CreateIndex
CREATE UNIQUE INDEX "skill_definitions_code_key" ON "skill_definitions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "weapon_mastery_properties_code_key" ON "weapon_mastery_properties"("code");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_items_slug_key" ON "equipment_items"("slug");

-- CreateIndex
CREATE INDEX "equipment_items_category_idx" ON "equipment_items"("category");

-- CreateIndex
CREATE UNIQUE INDEX "languages_name_key" ON "languages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "monsters_slug_key" ON "monsters"("slug");

-- CreateIndex
CREATE INDEX "monsters_challenge_rating_idx" ON "monsters"("challenge_rating");

-- CreateIndex
CREATE INDEX "monsters_creature_type_idx" ON "monsters"("creature_type");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- CreateIndex
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "admin_audit_logs_report_id_idx" ON "admin_audit_logs"("report_id");

-- CreateIndex
CREATE INDEX "admin_audit_logs_target_user_id_idx" ON "admin_audit_logs"("target_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_blocks_blocker_id_blocked_id_key" ON "user_blocks"("blocker_id", "blocked_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "conversation_participants"("conversation_id", "user_id");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_dm_id_fkey" FOREIGN KEY ("dm_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_source_books" ADD CONSTRAINT "campaign_source_books_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_source_books" ADD CONSTRAINT "campaign_source_books_source_book_id_fkey" FOREIGN KEY ("source_book_id") REFERENCES "source_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_members" ADD CONSTRAINT "campaign_members_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_members" ADD CONSTRAINT "campaign_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_characters" ADD CONSTRAINT "campaign_characters_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_characters" ADD CONSTRAINT "campaign_characters_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_characters" ADD CONSTRAINT "campaign_characters_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "npcs" ADD CONSTRAINT "npcs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_keeper_npc_id_fkey" FOREIGN KEY ("keeper_npc_id") REFERENCES "npcs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_items" ADD CONSTRAINT "shop_items_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_rules" ADD CONSTRAINT "schedule_rules_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_games" ADD CONSTRAINT "scheduled_games_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_games" ADD CONSTRAINT "scheduled_games_schedule_rule_id_fkey" FOREIGN KEY ("schedule_rule_id") REFERENCES "schedule_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_attendance" ADD CONSTRAINT "game_attendance_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "scheduled_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_attendance" ADD CONSTRAINT "game_attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_notes" ADD CONSTRAINT "campaign_notes_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_notes" ADD CONSTRAINT "campaign_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_note_shares" ADD CONSTRAINT "campaign_note_shares_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "campaign_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_note_shares" ADD CONSTRAINT "campaign_note_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_scheduled_game_id_fkey" FOREIGN KEY ("scheduled_game_id") REFERENCES "scheduled_games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_attendees" ADD CONSTRAINT "session_attendees_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_attendees" ADD CONSTRAINT "session_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_attendees" ADD CONSTRAINT "session_attendees_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_visited_locations" ADD CONSTRAINT "session_visited_locations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_visited_locations" ADD CONSTRAINT "session_visited_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_met_npcs" ADD CONSTRAINT "session_met_npcs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_met_npcs" ADD CONSTRAINT "session_met_npcs_npc_id_fkey" FOREIGN KEY ("npc_id") REFERENCES "npcs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_feedback" ADD CONSTRAINT "session_feedback_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_feedback" ADD CONSTRAINT "session_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_subspecies_id_fkey" FOREIGN KEY ("subspecies_id") REFERENCES "subspecies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_background_id_fkey" FOREIGN KEY ("background_id") REFERENCES "backgrounds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_dnd_class_id_fkey" FOREIGN KEY ("dnd_class_id") REFERENCES "dnd_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_subclass_id_fkey" FOREIGN KEY ("subclass_id") REFERENCES "dnd_subclasses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_spells" ADD CONSTRAINT "character_spells_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_spells" ADD CONSTRAINT "character_spells_spell_id_fkey" FOREIGN KEY ("spell_id") REFERENCES "spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_inventory_items" ADD CONSTRAINT "character_inventory_items_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_inventory_items" ADD CONSTRAINT "character_inventory_items_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_weapon_masteries" ADD CONSTRAINT "character_weapon_masteries_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_weapon_masteries" ADD CONSTRAINT "character_weapon_masteries_mastery_id_fkey" FOREIGN KEY ("mastery_id") REFERENCES "weapon_mastery_properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_resource_trackers" ADD CONSTRAINT "character_resource_trackers_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_languages" ADD CONSTRAINT "character_languages_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_languages" ADD CONSTRAINT "character_languages_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_notebooks" ADD CONSTRAINT "character_notebooks_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_attachments" ADD CONSTRAINT "note_attachments_notebook_id_fkey" FOREIGN KEY ("notebook_id") REFERENCES "character_notebooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "species" ADD CONSTRAINT "species_source_book_id_fkey" FOREIGN KEY ("source_book_id") REFERENCES "source_books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subspecies" ADD CONSTRAINT "subspecies_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subspecies" ADD CONSTRAINT "subspecies_source_book_id_fkey" FOREIGN KEY ("source_book_id") REFERENCES "source_books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backgrounds" ADD CONSTRAINT "backgrounds_origin_feat_id_fkey" FOREIGN KEY ("origin_feat_id") REFERENCES "feats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backgrounds" ADD CONSTRAINT "backgrounds_source_book_id_fkey" FOREIGN KEY ("source_book_id") REFERENCES "source_books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feats" ADD CONSTRAINT "feats_source_book_id_fkey" FOREIGN KEY ("source_book_id") REFERENCES "source_books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dnd_classes" ADD CONSTRAINT "dnd_classes_source_book_id_fkey" FOREIGN KEY ("source_book_id") REFERENCES "source_books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dnd_subclasses" ADD CONSTRAINT "dnd_subclasses_dnd_class_id_fkey" FOREIGN KEY ("dnd_class_id") REFERENCES "dnd_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dnd_subclasses" ADD CONSTRAINT "dnd_subclasses_source_book_id_fkey" FOREIGN KEY ("source_book_id") REFERENCES "source_books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_level_features" ADD CONSTRAINT "class_level_features_dnd_class_id_fkey" FOREIGN KEY ("dnd_class_id") REFERENCES "dnd_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_level_features" ADD CONSTRAINT "class_level_features_subclass_id_fkey" FOREIGN KEY ("subclass_id") REFERENCES "dnd_subclasses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_features" ADD CONSTRAINT "class_features_source_book_id_fkey" FOREIGN KEY ("source_book_id") REFERENCES "source_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_features" ADD CONSTRAINT "class_features_dnd_class_id_fkey" FOREIGN KEY ("dnd_class_id") REFERENCES "dnd_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_features" ADD CONSTRAINT "class_features_dnd_subclass_id_fkey" FOREIGN KEY ("dnd_subclass_id") REFERENCES "dnd_subclasses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_resource_definitions" ADD CONSTRAINT "class_resource_definitions_dnd_class_id_fkey" FOREIGN KEY ("dnd_class_id") REFERENCES "dnd_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spells" ADD CONSTRAINT "spells_source_book_id_fkey" FOREIGN KEY ("source_book_id") REFERENCES "source_books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_definitions" ADD CONSTRAINT "skill_definitions_source_book_id_fkey" FOREIGN KEY ("source_book_id") REFERENCES "source_books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_mastery_property_id_fkey" FOREIGN KEY ("mastery_property_id") REFERENCES "weapon_mastery_properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_source_book_id_fkey" FOREIGN KEY ("source_book_id") REFERENCES "source_books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monsters" ADD CONSTRAINT "monsters_source_book_id_fkey" FOREIGN KEY ("source_book_id") REFERENCES "source_books"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "message_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "chat_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reports" ADD CONSTRAINT "message_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reports" ADD CONSTRAINT "message_reports_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
