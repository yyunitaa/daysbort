// Pull real TikTok followers for an AJD-linked account via Apify
// (clockworks/tiktok-followers-scraper) and regenerate data/audience-followers-snapshot.js.
//
// *** THIS SPENDS REAL MONEY ON YOUR APIFY ACCOUNT (~$1 per 1,000 followers). ***
// It will NOT run without an explicit --yes flag, and NOT run as part of
// `npm run refresh-data` — it's a separate, deliberate action.
//
// Usage:
//   node scripts/pull-followers.mjs --handle amrijamaluddin_ --max 5000 --yes
//
// Requires APIFY_TOKEN in .env.local (see .env.example).

import { writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "..", "data", "audience-followers-snapshot.js");

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
  const args = { handle: null, max: 1000, yes: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--handle") args.handle = argv[++i];
    else if (argv[i] === "--max") args.max = Number(argv[++i]);
    else if (argv[i] === "--yes") args.yes = true;
  }
  return args;
}

const LOCAL_KEYWORDS = [
  "kolaka", "sultra", "sulawesi tenggara", "kendari", "pomalaa", "wolo", "baula",
  "ladongi", "watubangga", "tamborasi", "konawe", "tirawuta", "toari", "polinggona",
  "wundulako", "samaturu",
];
const OTHER_KEYWORDS = [
  "jakarta", "surabaya", "bandung", "makassar", "medan", "semarang", "yogyakarta",
  "jogja", "bekasi", "tangerang", "depok", "malaysia", "denpasar", "bali", "palu",
  "gorontalo", "manado", "ternate", "ambon",
];

function findKeyword(text, list) {
  const t = (text || "").toLowerCase();
  return list.find((k) => t.includes(k)) || null;
}

function tierOf(fans) {
  if (fans >= 100000) return "Publik Figur Nasional";
  if (fans >= 10000) return "Selebriti";
  if (fans >= 1000) return "Selebgram/Influencer";
  if (fans >= 100) return "Cukup Dikenal";
  return "Warga Biasa";
}

async function apifyGet(token, url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

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

  const estimatedCost = (args.max / 1000) * 1.0;
  console.log(`This will scrape up to ${args.max} followers of @${args.handle}.`);
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

  // Poll until finished
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
  const authors = items.map((it) => it.authorMeta).filter(Boolean);
  console.log(`Got ${authors.length} follower records.`);

  const total = authors.length;
  const verified = authors.filter((a) => a.verified).length;
  const priv = authors.filter((a) => a.privateAccount).length;
  const hasBio = authors.filter((a) => (a.signature || "").trim()).length;
  const fansList = authors.map((a) => a.fans || 0);
  const followingList = authors.map((a) => a.following || 0);
  const sortedFans = [...fansList].sort((a, b) => a - b);

  const tierCounts = {};
  for (const a of authors) {
    const t = tierOf(a.fans || 0);
    tierCounts[t] = (tierCounts[t] || 0) + 1;
  }

  let localMentioned = 0, otherCityMentioned = 0, noLocationInfo = 0;
  const localKwCounts = {};
  for (const a of authors) {
    const bio = a.signature || "";
    const lk = findKeyword(bio, LOCAL_KEYWORDS);
    const ok = findKeyword(bio, OTHER_KEYWORDS);
    if (lk) {
      localMentioned++;
      localKwCounts[lk] = (localKwCounts[lk] || 0) + 1;
    } else if (ok) {
      otherCityMentioned++;
    } else {
      noLocationInfo++;
    }
  }
  const topLocalKeywords = Object.entries(localKwCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([keyword, n]) => ({ keyword, n }));

  const topInfluential = [...authors]
    .sort((a, b) => (b.fans || 0) - (a.fans || 0))
    .slice(0, 10)
    .map((a) => ({
      handle: `@${a.name}`,
      nickname: a.nickName || "",
      fans: a.fans || 0,
      bio: (a.signature || "").split("\n")[0].slice(0, 80),
    }));

  const tierOrder = ["Warga Biasa", "Cukup Dikenal", "Selebgram/Influencer", "Selebriti", "Publik Figur Nasional"];
  const followerTiers = tierOrder
    .filter((t) => tierCounts[t])
    .map((t) => ({ tier: t, value: tierCounts[t] }));

  const runInfo = await apifyGet(token, `https://api.apify.com/v2/actor-runs/${runId}`);
  const actualCost = runInfo.data.usageTotalUsd ?? estimatedCost;

  const fileContent = `// Auto-generated by scripts/pull-followers.mjs — jangan edit manual.
// Regenerate: node scripts/pull-followers.mjs --handle ${args.handle} --max ${args.max} --yes
// (PERINGATAN: mengenakan biaya nyata ke akun Apify, ~$1/1.000 follower)

export const meta = ${JSON.stringify({
    actor: "clockworks/tiktok-followers-scraper",
    targetHandle: args.handle,
    pulledAt: new Date().toISOString().slice(0, 10),
    costUsd: Number(actualCost.toFixed ? actualCost.toFixed(2) : actualCost),
    apifyRunId: runId,
  }, null, 2)};

export const followerOverview = ${JSON.stringify({
    totalSampled: total,
    verifiedPct: Number(((verified / total) * 100).toFixed(1)),
    privateAccountPct: Number(((priv / total) * 100).toFixed(1)),
    hasBioPct: Number(((hasBio / total) * 100).toFixed(1)),
    avgFans: Math.round(fansList.reduce((a, b) => a + b, 0) / total),
    avgFollowing: Math.round(followingList.reduce((a, b) => a + b, 0) / total),
    medianFans: sortedFans[Math.floor(total / 2)],
    maxFans: Math.max(...fansList),
  }, null, 2)};

export const followerTiers = ${JSON.stringify(followerTiers, null, 2)};

export const followerLocationSignal = ${JSON.stringify({
    localMentioned,
    otherCityMentioned,
    noLocationInfo,
    topLocalKeywords,
  }, null, 2)};

export const topInfluentialFollowers = ${JSON.stringify(topInfluential, null, 2)};
`;

  await writeFile(OUT_FILE, fileContent, "utf8");
  console.log(`\nWrote ${OUT_FILE}`);
  console.log(`Actual cost charged: ~$${actualCost}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
