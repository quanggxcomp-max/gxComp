const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN ?? "";
const BASE  = "https://api.contentful.com/spaces/z8xn4sl90drz/environments/master";
const AUTH  = { "Authorization": `Bearer ${TOKEN}` };
const bi    = v => ({ "en-US": v, "vi-VN": v });

// URL ảnh thật từ windowo.com và vdsautomatismos.es
const IMAGE_MAP = {
  "prod-galaxy-1":   { url: "https://www.windowo.com/img/cms/VDS/galaxy-1-vds.jpg",            title: "GALAXY-1 VDS" },
  "prod-galaxy-2":   { url: "https://www.windowo.com/img/cms/VDS/galaxy-2-vds.jpg",            title: "GALAXY-2 VDS" },
  "prod-galaxy-3":   { url: "https://www.windowo.com/img/cms/VDS/galaxy-3-vds.jpg",            title: "GALAXY-3 VDS" },
  "prod-galaxy-4":   { url: "https://www.windowo.com/img/cms/VDS/galaxy-4-vds.jpg",            title: "GALAXY-4 VDS" },
  "prod-multi-4":    { url: "https://www.windowo.com/img/p/1/2/6/126-large_default.jpg",       title: "MULTI-4 VDS" },
  "prod-eco-a":      { url: "https://www.windowo.com/img/p/1/3/0/130-large_default.jpg",       title: "ECO-A VDS" },
  "prod-maxi-led":   { url: "https://www.windowo.com/img/cms/VDS/maxi-led-vds.jpg",            title: "MAXI LED VDS" },
  "prod-euro230m1":  { url: "https://www.vdsautomatismos.es/wp-content/uploads/2020/01/euro-230-m1.jpg", title: "EURO 230 M1 VDS" },
  "prod-euro230me":  { url: "https://www.vdsautomatismos.es/wp-content/uploads/2020/01/euro-230-m2.jpg", title: "EURO 230 ME VDS" },
  "prod-euro24m1":   { url: "https://www.vdsautomatismos.es/wp-content/uploads/2020/01/euro-24-m1.jpg",  title: "EURO 24 M1 VDS" },
  "prod-mini":       { url: "https://www.vdsautomatismos.es/wp-content/uploads/2020/01/mini.jpg",        title: "MINI VDS" },
  "prod-key-mb":     { url: "https://www.windowo.com/img/cms/VDS/key-selector-vds.jpg",        title: "KEY MB VDS" },
  "prod-he50":       { url: "https://www.windowo.com/img/cms/VDS/he50-vds.jpg",                title: "HE 50 VDS" },
  "prod-telescopic": { url: "https://www.windowo.com/img/cms/VDS/telescopic-antenna-vds.jpg",  title: "TELESCOPIC VDS" },
  "prod-bp2402":     { url: "https://www.windowo.com/img/cms/VDS/battery-vds.jpg",             title: "BP 2402 VDS" },
  "prod-bp2502":     { url: "https://www.windowo.com/img/cms/VDS/battery-vds.jpg",             title: "BP 2502 VDS" },
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function createAsset(title, imageUrl) {
  const body = {
    fields: {
      title:  bi(title),
      file: {
        "en-US": { contentType: "image/jpeg", fileName: title.replace(/ /g,"-").toLowerCase()+".jpg", upload: imageUrl },
        "vi-VN": { contentType: "image/jpeg", fileName: title.replace(/ /g,"-").toLowerCase()+".jpg", upload: imageUrl },
      }
    }
  };
  const r = await fetch(`${BASE}/assets`, {
    method: "POST",
    headers: { ...AUTH, "Content-Type": "application/vnd.contentful.management.v1+json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) { console.error(`  x asset create ${title}: ${d.message}`); return null; }
  const assetId = d.sys.id;

  // Process asset
  await sleep(1000);
  const proc = await fetch(`${BASE}/assets/${assetId}/files/en-US/process`, {
    method: "PUT",
    headers: { ...AUTH, "X-Contentful-Version": String(d.sys.version) },
  });
  if (!proc.ok) { console.error(`  x process ${assetId}`); return null; }

  // Wait for processing
  await sleep(3000);

  // Publish asset
  const ga = await fetch(`${BASE}/assets/${assetId}`, { headers: AUTH });
  const da = await ga.json();
  const pub = await fetch(`${BASE}/assets/${assetId}/published`, {
    method: "PUT",
    headers: { ...AUTH, "X-Contentful-Version": String(da.sys.version) },
  });
  if (!pub.ok) { const dp = await pub.json(); console.error(`  x publish asset: ${dp.message}`); return null; }
  console.log(`  ✓ Asset: ${title} → ${assetId}`);
  return assetId;
}

async function linkAssetToEntry(entryId, assetId) {
  const g = await fetch(`${BASE}/entries/${entryId}`, { headers: AUTH });
  if (!g.ok) { console.log(`  skip entry ${entryId}`); return; }
  const e = await g.json();
  e.fields.image = bi({ sys: { type: "Link", linkType: "Asset", id: assetId } });

  const r = await fetch(`${BASE}/entries/${entryId}`, {
    method: "PUT",
    headers: { ...AUTH, "Content-Type": "application/vnd.contentful.management.v1+json", "X-Contentful-Version": String(e.sys.version) },
    body: JSON.stringify({ fields: e.fields }),
  });
  const d = await r.json();
  if (!r.ok) { console.error(`  x link ${entryId}: ${d.message}`); return; }

  await fetch(`${BASE}/entries/${entryId}/published`, {
    method: "PUT",
    headers: { ...AUTH, "X-Contentful-Version": String(d.sys.version) },
  });
  console.log(`  ✓ Linked image → ${entryId}`);
}

async function main() {
  const entries = Object.entries(IMAGE_MAP);
  for (const [entryId, { url, title }] of entries) {
    console.log(`\n[${title}]`);
    const assetId = await createAsset(title, url);
    if (assetId) {
      await sleep(500);
      await linkAssetToEntry(entryId, assetId);
    }
    await sleep(1500); // tránh rate limit
  }
  console.log("\n=== DONE ===");
}

main().catch(console.error);
