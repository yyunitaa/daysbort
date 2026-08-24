// Live equivalents of data/*-snapshot.js — queries the warehouse
// (l1_silver.mention / l2_gold.*, now hosted in the same Postgres as the
// public schema, see lib/db.js) instead of reading a committed static file.
// Same query logic as scripts/export-generic-subject.mjs, works for any
// subject_id (AJD, ARR, KLK, ...) via the generic (non subject-suffixed)
// l2_gold tables. A subject_id with no matching rows naturally comes back
// with zeroed/empty fields — no separate "empty" data path needed.
import { getPool } from "./db";

const SENT_LABEL = { positive: "positif", negative: "negatif", neutral: "netral" };

function fmtWeek(date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

const EMPTY_SELF = {
  kpi: { relevantMentions: 0, rawMentions: 0, positivePct: 0, netSentiment: "0.0" },
  attributionData: [],
  platformData: [],
  audienceSegmentData: [],
  sentimentTrend: [],
  volumeTrend: [],
  topicEngagement: [],
  topTopicsVolume: [],
  riskRadar: { topicLabel: null, categoryLabel: null, nNegativeLast7d: 0, nNegativePrior7d: 0, delta7d: 0, isTrueVelocity: false, caveat: null },
  topContent: [],
};

const EMPTY_AUDIENCE = {
  kpi: { communityCandidates: 0, segmentSplit: "-", topPlatformShare: "-", botDetected: 0 },
  segmentData: [],
  platformActivity: [],
  emotionData: [],
  communitySupporters: [],
  officialAccounts: [],
};

export async function getSelfPerceptionData(subjectId, fullName = "figur ini") {
  if (!subjectId) return EMPTY_SELF;
  const pool = getPool();

  const [classified, raw, platform, weekly, topicMap, topContentRows, attribution, opportunity, risk, audienceSeg] = await Promise.all([
    pool.query(
      `SELECT count(*) n_total,
         count(*) FILTER (WHERE sentiment_label='positive') pos,
         count(*) FILTER (WHERE sentiment_label='negative') neg,
         count(*) FILTER (WHERE sentiment_label='neutral') neu
       FROM l1_silver.mention WHERE subject_id=$1 AND attribution_layer IS NOT NULL`,
      [subjectId]
    ),
    pool.query(`SELECT count(*) n FROM l1_silver.mention WHERE subject_id=$1`, [subjectId]),
    pool.query(
      `SELECT platform, count(*) n FROM l1_silver.mention
       WHERE subject_id=$1 AND attribution_layer IS NOT NULL GROUP BY 1 ORDER BY 2 DESC`,
      [subjectId]
    ),
    pool.query(
      `SELECT date_trunc('week', mention_date)::date wk, SUM(n_total) t, SUM(n_positive) p, SUM(n_negative) neg, SUM(n_neutral) neu
       FROM l2_gold.agg_sentiment_daily WHERE subject_id=$1 GROUP BY 1 ORDER BY 1`,
      [subjectId]
    ),
    pool.query(
      `SELECT topic_id, category_label, SUM(n_total) n_total,
         ROUND(SUM(n_positive - n_negative)::numeric / NULLIF(SUM(n_total),0) * 100, 1) net
       FROM l2_gold.agg_topic_map WHERE subject_id=$1 GROUP BY 1,2 ORDER BY n_total DESC LIMIT 10`,
      [subjectId]
    ),
    pool.query(
      `SELECT author_username, platform, LEFT(full_text,150) txt, like_count, sentiment_label
       FROM l1_silver.mention
       WHERE subject_id=$1 AND attribution_layer IN ('direct','institutional')
         AND (is_bot_suspected IS NOT TRUE) AND full_text IS NOT NULL AND full_text <> ''
       ORDER BY (COALESCE(like_count,0)+COALESCE(reply_count,0)+COALESCE(share_count,0)) DESC LIMIT 10`,
      [subjectId]
    ),
    pool.query(
      `SELECT
         count(*) FILTER (WHERE attribution_layer IS NULL) unclassified,
         count(*) FILTER (WHERE attribution_layer='institutional') institutional,
         count(*) FILTER (WHERE attribution_layer='attributed') attributed,
         count(*) FILTER (WHERE attribution_layer='direct') direct
       FROM l1_silver.mention WHERE subject_id=$1`,
      [subjectId]
    ),
    pool.query(
      `SELECT topic_id, category_label, avg_engagement_like FROM l2_gold.agg_opportunity_generic
       WHERE subject_id=$1 ORDER BY avg_engagement_like DESC LIMIT 5`,
      [subjectId]
    ),
    pool.query(
      `SELECT topic_id, category_label, n_negative_last_7d, n_negative_prior_7d, delta_7d, is_true_velocity, caveat
       FROM l2_gold.agg_risk_radar_generic WHERE subject_id=$1 ORDER BY delta_7d DESC LIMIT 1`,
      [subjectId]
    ),
    pool.query(`SELECT author_segment, n_total FROM l2_gold.agg_audience WHERE subject_id=$1 ORDER BY n_total DESC`, [subjectId]),
  ]);

  const ct = classified.rows[0];
  const netSentiment = ct.n_total > 0 ? (((ct.pos - ct.neg) / ct.n_total) * 100).toFixed(1) : "0.0";
  const at = attribution.rows[0];

  return {
    kpi: {
      relevantMentions: Number(ct.n_total),
      rawMentions: Number(raw.rows[0].n),
      positivePct: ct.n_total > 0 ? Math.round((ct.pos / ct.n_total) * 100) : 0,
      netSentiment: `${Number(netSentiment) >= 0 ? "+" : ""}${netSentiment}`,
    },
    attributionData: [
      { label: "Belum Terklasifikasi", value: Number(at.unclassified), note: "kandidat noise nama kembar", tier: "noise" },
      { label: "Institusional", value: Number(at.institutional), note: "akun resmi/media", tier: "confirmed" },
      { label: "Atribusi (Attributed)", value: Number(at.attributed), note: "disebut pihak ketiga", tier: "confirmed" },
      { label: "Langsung (Direct)", value: Number(at.direct), note: `pernyataan resmi ${fullName}`, tier: "confirmed" },
    ],
    platformData: platform.rows.map((r) => ({ platform: cap(r.platform), value: Number(r.n) })),
    audienceSegmentData: audienceSeg.rows.map((r) => ({ name: cap(r.author_segment), value: Number(r.n_total) })),
    sentimentTrend: weekly.rows.map((r) => ({ week: fmtWeek(r.wk), positif: Number(r.p), netral: Number(r.neu), negatif: Number(r.neg) })),
    volumeTrend: weekly.rows.map((r) => ({ week: fmtWeek(r.wk), volume: Number(r.t) })),
    topicEngagement: opportunity.rows.map((r) => ({ title: r.category_label, eng: Number(r.avg_engagement_like) })),
    topTopicsVolume: topicMap.rows.map((r) => ({ topic: r.topic_id, category: r.category_label, n: Number(r.n_total), net: Number(r.net) })),
    riskRadar: risk.rows[0]
      ? {
          topicLabel: risk.rows[0].topic_id,
          categoryLabel: risk.rows[0].category_label,
          nNegativeLast7d: Number(risk.rows[0].n_negative_last_7d),
          nNegativePrior7d: Number(risk.rows[0].n_negative_prior_7d),
          delta7d: Number(risk.rows[0].delta_7d),
          isTrueVelocity: risk.rows[0].is_true_velocity,
          caveat: risk.rows[0].caveat,
        }
      : EMPTY_SELF.riskRadar,
    topContent: topContentRows.rows.map((r) => ({
      handle: `@${r.author_username}`,
      platform: cap(r.platform),
      text: r.txt,
      sentiment: SENT_LABEL[r.sentiment_label] || "netral",
      likes: Number(r.like_count || 0),
    })),
  };
}

// Full multi-topic risk radar (used by the Kabupaten Kolaka tab's "Isu yang
// Sedang Naik/Turun" table) — getSelfPerceptionData only returns the single
// top issue for the KPI callout, this returns all of them.
export async function getRiskRadarList(subjectId) {
  if (!subjectId) return [];
  const pool = getPool();
  const result = await pool.query(
    `SELECT topic_id, category_label, n_negative_last_7d, n_negative_prior_7d, delta_7d
     FROM l2_gold.agg_risk_radar_generic WHERE subject_id=$1 ORDER BY delta_7d DESC`,
    [subjectId]
  );
  return result.rows.map((r) => ({
    topic: r.topic_id,
    category: r.category_label,
    last7d: Number(r.n_negative_last_7d),
    prior7d: Number(r.n_negative_prior_7d),
    delta: Number(r.delta_7d),
  }));
}

export async function getAudienceData(subjectId) {
  if (!subjectId) return EMPTY_AUDIENCE;
  const pool = getPool();

  const [audienceSegDetail, emotion, botStats, supporters, officials, platformCount, relevantCount] = await Promise.all([
    pool.query(
      `SELECT author_segment, count(*) n, avg(author_followers) avg_followers
       FROM l1_silver.mention WHERE subject_id=$1 AND attribution_layer IS NOT NULL AND author_segment IS NOT NULL
       GROUP BY 1 ORDER BY 2 DESC`,
      [subjectId]
    ),
    pool.query(
      `SELECT emotion_label, count(*) n FROM l1_silver.mention
       WHERE subject_id=$1 AND attribution_layer IS NOT NULL AND emotion_label IS NOT NULL GROUP BY 1 ORDER BY 2 DESC`,
      [subjectId]
    ),
    pool.query(
      `SELECT count(*) FILTER (WHERE is_bot_suspected) bot_n FROM l1_silver.mention
       WHERE subject_id=$1 AND attribution_layer IS NOT NULL`,
      [subjectId]
    ),
    pool.query(
      `SELECT author_username, platform, author_followers, LEFT(full_text,140) txt, like_count
       FROM l1_silver.mention
       WHERE subject_id=$1 AND attribution_layer IS NOT NULL AND author_segment='konsumen' AND emotion_label='dukungan'
       ORDER BY COALESCE(author_followers,0) DESC, COALESCE(like_count,0) DESC LIMIT 10`,
      [subjectId]
    ),
    pool.query(
      `SELECT author_username, platform, count(*) posts,
         sum(COALESCE(like_count,0)+COALESCE(reply_count,0)+COALESCE(share_count,0)) engagement
       FROM l1_silver.mention
       WHERE subject_id=$1 AND attribution_layer IS NOT NULL AND author_segment='institusional' AND author_username IS NOT NULL
       GROUP BY 1,2 ORDER BY posts DESC LIMIT 5`,
      [subjectId]
    ),
    pool.query(
      `SELECT platform, count(*) n FROM l1_silver.mention
       WHERE subject_id=$1 AND attribution_layer IS NOT NULL GROUP BY 1 ORDER BY 2 DESC`,
      [subjectId]
    ),
    pool.query(`SELECT count(*) n FROM l1_silver.mention WHERE subject_id=$1 AND attribution_layer IS NOT NULL`, [subjectId]),
  ]);

  const totalSeg = audienceSegDetail.rows.reduce((s, r) => s + Number(r.n), 0);
  const platformActivity = platformCount.rows.map((r) => ({ platform: cap(r.platform), value: Number(r.n) }));
  const topPlatform = platformActivity[0];
  const relevantMentions = Number(relevantCount.rows[0].n);

  return {
    kpi: {
      communityCandidates: supporters.rowCount,
      segmentSplit: totalSeg > 0 ? audienceSegDetail.rows.map((r) => `${Math.round((Number(r.n) / totalSeg) * 100)}% ${cap(r.author_segment)}`).join(" / ") : "-",
      topPlatformShare: topPlatform && relevantMentions > 0 ? `${topPlatform.platform} ${Math.round((topPlatform.value / relevantMentions) * 100)}%` : "-",
      botDetected: Number(botStats.rows[0].bot_n),
    },
    segmentData: audienceSegDetail.rows.map((r) => ({ name: cap(r.author_segment), value: Number(r.n), avgFollowers: Math.round(Number(r.avg_followers || 0)) })),
    platformActivity,
    emotionData: emotion.rows.map((r) => ({ emotion: cap(r.emotion_label), value: Number(r.n) })),
    communitySupporters: supporters.rows.map((r) => ({
      handle: `@${r.author_username}`,
      platform: cap(r.platform),
      followers: r.author_followers,
      text: r.txt,
      likes: Number(r.like_count || 0),
    })),
    officialAccounts: officials.rows.map((r) => ({
      handle: `@${r.author_username}`,
      platform: cap(r.platform),
      posts: Number(r.posts),
      engagement: Number(r.engagement),
    })),
  };
}
