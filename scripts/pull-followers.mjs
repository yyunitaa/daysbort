// Pull real TikTok followers for any subject's TikTok account via Apify
// (clockworks/tiktok-followers-scraper) and regenerate
// data/audience-followers-<subject>-snapshot.js.
//
// *** THIS SPENDS REAL MONEY ON YOUR APIFY ACCOUNT (~$1 per 1,000 followers). ***
// It will NOT run without an explicit --yes flag, and NOT run as part of
// `npm run refresh-data` — it's a separate, deliberate action.
//
// Usage:
//   node scripts/pull-followers.mjs --subject AJD --handle amrijamaluddin_ --max 5000 --yes
//
// Requires APIFY_TOKEN in .env.local (see .env.example).
// LOCAL_KEYWORDS only applies to AJD (Bupati Kolaka has an actual home
// region to check bios against) — every other subject gets [] (no
// misleading "local" bucket), see scripts/lib/follower-analysis.mjs.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { tierOf, buildLocationSignal, buildSnapshot, writeSnapshotFile, apifyGet } from "./lib/follower-analysis.mjs";
import { buildGenderData, buildCityData, buildAgeData } from "./lib/demographics.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  const args = { subject: "AJD", handle: null, max: 1000, yes: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--handle") args.handle = argv[++i];
    else if (argv[i] === "--max") args.max = Number(argv[++i]);
    else if (argv[i] === "--subject") args.subject = argv[++i].toUpperCase();
    else if (argv[i] === "--yes") args.yes = true;
  }
  return args;
}

const LOCAL_KEYWORDS_BY_SUBJECT = {
  AJD: [
    "kolaka", "sultra", "sulawesi tenggara", "kendari", "pomalaa", "wolo", "baula",
    "ladongi", "watubangga", "tamborasi", "konawe", "tirawuta", "toari", "polinggona",
    "wundulako", "samaturu",
  ],
};
const OTHER_KEYWORDS = [
  "jakarta", "surabaya", "bandung", "makassar", "medan", "semarang", "yogyakarta",
  "jogja", "bekasi", "tangerang", "depok", "malaysia", "denpasar", "bali", "palu",
  "gorontalo", "manado", "ternate", "ambon",
];

async function main() {
  await loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));

  if (!args.handle) {
    console.error("Missing --handle <tiktok_username>");
    process.exit(1);
  }
  if (!process.env.APIFY_TOKEN) {
    console.error("Missing APIFY_TOKEN in .env.local");
    process.exit(1);
  }

  const OUT_FILE = path.join(__dirname, "..", "data", `audience-followers-${args.subject.toLowerCase()}-snapshot.js`);

  const estimatedCost = (args.max / 1000) * 1.0;
  console.log(`This will scrape up to ${args.max} followers of @${args.handle} (subject ${args.subject}).`);
  console.log(`Estimated cost: ~$${estimatedCost.toFixed(2)} on your Apify account (current pricing ~$1/1,000 followers).`);

  if (!args.yes) {
    console.error("\nRefusing to run without --yes (this spends real money). Re-run with --yes to proceed.");
    process.exit(1);
  }

  const token = process.env.APIFY_TOKEN;

  console.log("Starting Apify run (clockworks/tiktok-followers-scraper)...");
  const startRes = await fetch(
    "https://api.apify.com/v2/acts/clockworks~tiktok-followers-scraper/runs",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        profiles: [args.handle],
        maxFollowersPerProfile: args.max,
        maxFollowingPerProfile: 0,
      }),
    }
  );
  if (!startRes.ok) throw new Error(`Failed to start run: ${startRes.status}`);
  const startData = (await startRes.json()).data;
  const runId = startData.id;
  const datasetId = startData.defaultDatasetId;
  console.log(`Run started: ${runId} (dataset ${datasetId})`);

  let status = startData.status;
  while (!["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"].includes(status)) {
    await new Promise((r) => setTimeout(r, 15000));
    const run = await apifyGet(token, `https://api.apify.com/v2/actor-runs/${runId}`);
    status = run.data.status;
    console.log(`  ${new Date().toLocaleTimeString()} — ${status}`);
  }
  if (status !== "SUCCEEDED") {
    throw new Error(`Run ended with status ${status}`);
  }

  console.log("Fetching dataset items...");
  const items = await apifyGet(token, `https://api.apify.com/v2/datasets/${datasetId}/items?format=json&clean=true`);
  const rawAuthors = items.map((it) => it.authorMeta).filter(Boolean);
  console.log(`Got ${rawAuthors.length} follower records.`);

  const authors = rawAuthors.map((a) => ({
    name: a.name,
    nickName: a.nickName || "",
    fans: a.fans || 0,
    following: a.following || 0,
    signature: a.signature || "",
    verified: !!a.verified,
    privateAccount: !!a.privateAccount,
  }));

  const { followerOverview, followerTiers, topInfluentialFollowers } = buildSnapshot(authors);
  const followerLocationSignal = buildLocationSignal(authors, LOCAL_KEYWORDS_BY_SUBJECT[args.subject] || [], OTHER_KEYWORDS);
  const { genderData, genderMeta } = buildGenderData(authors);
  const { cityData, cityMeta } = buildCityData(authors);
  const { ageData, ageMeta } = buildAgeData(authors.length);

  const runInfo = await apifyGet(token, `https://api.apify.com/v2/actor-runs/${runId}`);
  const actualCost = runInfo.data.usageTotalUsd ?? estimatedCost;

  await writeSnapshotFile(OUT_FILE, {
    meta: {
      generatedBy: "scripts/pull-followers.mjs",
      regenerateCmd: `node scripts/pull-followers.mjs --subject ${args.subject} --handle ${args.handle} --max ${args.max} --yes`,
      actor: "clockworks/tiktok-followers-scraper",
      targetHandle: args.handle,
      pulledAt: new Date().toISOString().slice(0, 10),
      costUsd: Number((actualCost.toFixed ? actualCost.toFixed(2) : actualCost)),
      apifyRunId: runId,
    },
    followerOverview,
    followerTiers,
    followerLocationSignal,
    topInfluentialFollowers,
    genderData, genderMeta, cityData, cityMeta, ageData, ageMeta,
  });

  console.log(`\nWrote ${OUT_FILE}`);
  console.log(`Actual cost charged: ~$${actualCost}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
