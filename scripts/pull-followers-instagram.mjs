// Pull real Instagram followers for a subject via a 2-stage Apify pipeline
// and regenerate data/audience-followers-<subject>-snapshot.js.
//
// Instagram's own followers-list API doesn't expose each follower's own
// follower count or bio (unlike TikTok's, see pull-followers.mjs) — cheap
// list-only actors only return username/name/verified/private. To get the
// same shape as the TikTok pull (needed for the tier chart, bio-location
// signal, and "top influential followers" ranking), this runs two actors:
//
//   1. scraping_solutions/instagram-scraper-followers-following-no-cookies
//      (~$0.60/1,000) -- list of usernames following the target account.
//   2. apify/instagram-profile-scraper (~$1.60/1,000) -- enriches each of
//      those usernames with followersCount + biography.
//
// *** THIS SPENDS REAL MONEY ON YOUR APIFY ACCOUNT (~$2.20 per 1,000
// followers combined). *** Will NOT run without --yes, and NOT run as part
// of `npm run refresh-data`.
//
// Usage:
//   node scripts/pull-followers-instagram.mjs --subject ARR --handle ahmadrizal.ramdhani --max 1000 --yes
//
// Requires APIFY_TOKEN in .env.local.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildLocationSignal, buildSnapshot, writeSnapshotFile, apifyRunActor } from "./lib/follower-analysis.mjs";
import { buildGenderData, buildCityData, buildAgeData } from "./lib/demographics.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LIST_ACTOR = "scraping_solutions~instagram-scraper-followers-following-no-cookies";
const PROFILE_ACTOR = "apify~instagram-profile-scraper";

const OTHER_KEYWORDS = [
  "jakarta", "surabaya", "bandung", "makassar", "medan", "semarang", "yogyakarta",
  "jogja", "bekasi", "tangerang", "depok", "malaysia", "denpasar", "bali", "palu",
  "gorontalo", "manado", "ternate", "ambon", "kendari", "sultra",
];

async function loadEnvLocal() {
  try {
    const raw = await readFile(path.join(__dirname, "..", ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // .env.local optional
  }
}

function parseArgs(argv) {
  const args = { subject: null, handle: null, max: 1000, yes: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--handle") args.handle = argv[++i];
    else if (argv[i] === "--max") args.max = Number(argv[++i]);
    else if (argv[i] === "--subject") args.subject = argv[++i].toUpperCase();
    else if (argv[i] === "--yes") args.yes = true;
  }
  return args;
}

async function main() {
  await loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));

  if (!args.handle) {
    console.error("Missing --handle <instagram_username>");
    process.exit(1);
  }
  if (!args.subject) {
    console.error("Missing --subject <SUBJECT_ID>");
    process.exit(1);
  }
  if (!process.env.APIFY_TOKEN) {
    console.error("Missing APIFY_TOKEN in .env.local");
    process.exit(1);
  }

  const OUT_FILE = path.join(__dirname, "..", "data", `audience-followers-${args.subject.toLowerCase()}-snapshot.js`);

  const estimatedCost = (args.max / 1000) * 0.6 + (args.max / 1000) * 1.6;
  console.log(`This will scrape up to ${args.max} followers of @${args.handle} (subject ${args.subject}) via 2 Apify actors.`);
  console.log(`Estimated cost: ~$${estimatedCost.toFixed(2)} on your Apify account (~$0.60/1,000 list + ~$1.60/1,000 enrichment).`);

  if (!args.yes) {
    console.error("\nRefusing to run without --yes (this spends real money). Re-run with --yes to proceed.");
    process.exit(1);
  }

  const token = process.env.APIFY_TOKEN;

  console.log(`\n[1/2] Fetching follower list (${LIST_ACTOR})...`);
  const listRun = await apifyRunActor(token, LIST_ACTOR, {
    Account: [args.handle],
    resultsLimit: Math.max(args.max, 50),
    dataToScrape: "Followers",
  });
  const listedUsernames = [...new Set(listRun.items.map((it) => it.username).filter(Boolean))].slice(0, args.max);
  console.log(`Got ${listedUsernames.length} follower usernames.`);

  if (listedUsernames.length === 0) {
    throw new Error("Follower list came back empty — check the handle and try again before spending on enrichment.");
  }

  console.log(`\n[2/2] Enriching ${listedUsernames.length} profiles (${PROFILE_ACTOR})...`);
  const profileRun = await apifyRunActor(token, PROFILE_ACTOR, {
    usernames: listedUsernames,
  });

  const authors = profileRun.items
    .filter((p) => p && p.username)
    .map((p) => ({
      name: p.username,
      nickName: p.fullName || "",
      fans: p.followersCount || 0,
      following: p.followsCount || 0,
      signature: p.biography || "",
      verified: !!p.verified,
      privateAccount: !!p.private,
    }));
  console.log(`Enriched ${authors.length}/${listedUsernames.length} profiles (some may fail — private/deleted/rate-limited accounts).`);

  const { followerOverview, followerTiers, topInfluentialFollowers } = buildSnapshot(authors);
  const followerLocationSignal = buildLocationSignal(authors, [], OTHER_KEYWORDS);
  const { genderData, genderMeta } = buildGenderData(authors);
  const { cityData, cityMeta } = buildCityData(authors);
  const { ageData, ageMeta } = buildAgeData(authors.length);

  const totalCost = (listRun.costUsd || 0) + (profileRun.costUsd || 0);

  await writeSnapshotFile(OUT_FILE, {
    meta: {
      generatedBy: "scripts/pull-followers-instagram.mjs",
      regenerateCmd: `node scripts/pull-followers-instagram.mjs --subject ${args.subject} --handle ${args.handle} --max ${args.max} --yes`,
      actor: `${LIST_ACTOR} + ${PROFILE_ACTOR}`,
      targetHandle: args.handle,
      pulledAt: new Date().toISOString().slice(0, 10),
      costUsd: Number((totalCost || estimatedCost).toFixed ? (totalCost || estimatedCost).toFixed(2) : totalCost),
      apifyRunId: `${listRun.runId},${profileRun.runId}`,
    },
    followerOverview,
    followerTiers,
    followerLocationSignal,
    topInfluentialFollowers,
    genderData, genderMeta, cityData, cityMeta, ageData, ageMeta,
  });

  console.log(`\nWrote ${OUT_FILE}`);
  console.log(`Actual cost charged: ~$${totalCost.toFixed(2)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
