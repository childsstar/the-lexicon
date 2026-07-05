#!/usr/bin/env node
import assert from "node:assert/strict";
import { isDiscordInviteUrl } from "../lib/venues.ts";

// Accepted formats
assert.equal(isDiscordInviteUrl("https://discord.gg/exampleclub"), true);
assert.equal(isDiscordInviteUrl("https://discord.com/invite/exampleclub"), true);
assert.equal(isDiscordInviteUrl("https://discordapp.com/invite/exampleclub"), true);
assert.equal(isDiscordInviteUrl("http://discord.gg/exampleclub"), true);
assert.equal(isDiscordInviteUrl("discord.gg/exampleclub"), true);
assert.equal(isDiscordInviteUrl("https://www.discord.gg/exampleclub"), true);
assert.equal(isDiscordInviteUrl("  https://discord.gg/exampleclub  "), true);

// Rejected formats
assert.equal(isDiscordInviteUrl(""), false);
assert.equal(isDiscordInviteUrl("   "), false);
assert.equal(isDiscordInviteUrl("not a url"), false);
assert.equal(isDiscordInviteUrl("https://discord.gg/"), false);
assert.equal(isDiscordInviteUrl("https://discord.com/"), false);
assert.equal(isDiscordInviteUrl("https://discord.com/exampleclub"), false);
assert.equal(isDiscordInviteUrl("https://example.com/invite/exampleclub"), false);
assert.equal(isDiscordInviteUrl("https://evil-discord.gg/exampleclub"), false);
assert.equal(isDiscordInviteUrl("ftp://discord.gg/exampleclub"), false);
assert.equal(isDiscordInviteUrl("https://discord.gg.evil.com/exampleclub"), false);

console.log("discord link validation passed");
