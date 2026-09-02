const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN ?? "";
const BASE  = "https://api.contentful.com/spaces/z8xn4sl90drz/environments/master";
const AUTH  = { "Authorization": `Bearer ${TOKEN}` };

// Map: entry ID → giá thật từ ảnh catalog
const PRICES = {
  "prod-galaxy-1":   "2.499.000 ₫",
  "prod-galaxy-2":   "2.499.000 ₫",
  "prod-galaxy-3":   "2.499.000 ₫",
  "prod-galaxy-4":   "1.999.000 ₫",
  "prod-eco-a":      "2.499.000 ₫",   // TECH-2 = cảm biến an toàn
  "prod-multi-4":    "1.099.000 ₫",   // MULTI-4
  "prod-key-mb":     "1.499.000 ₫",   // PLA = bộ chọn chìa khóa
  "prod-maxi-led":   "1.499.000 ₫",   // WAVE LED
  "prod-he50":       "4.999.000 ₫",   // HR 50
  "prod-tronch":     "4.999.000 ₫",   // TOUCH = công tắc cảm ứng
  "prod-euro230me":  "6.999.000 ₫",   // EURO 230 M2 (bo mạch)
  "prod-elr4me":     "7.999.000 ₫",   // ELB 24 M2
  "prod-mini":       "2.499.000 ₫",   // MINI
  "prod-euro230m1":  "4.499.000 ₫",   // EURO 230 M1
  "prod-euro24m1":   "4.499.000 ₫",   // EURO 24 M1
  "prod-bp2402":     "2.999.000 ₫",   // BP 2426
  "prod-bp2502":     "3.999.000 ₫",   // BP 2452
  "prod-ma1u":       "599.000 ₫",     // RAY M4 10mm
  "prod-ma2u":       "899.000 ₫",     // RAY M4 22mm
  "prod-telescopic": "3.999.000 ₫",   // TEL-2
  "prod-bi-polaire": "5.999.000 ₫",   // FOL (BI-FOLDING)
};

// Sản phẩm mới + khuyến mãi (random 2-3 sản phẩm)
const NEW_PRODUCTS    = ["prod-galaxy-4", "prod-tronch"];          // 2 sản phẩm mới
const SALE_PRODUCTS   = ["prod-multi-4",  "prod-telescopic"];      // 2 sản phẩm khuyến mãi
const BEST_SELLERS    = ["prod-galaxy-1", "prod-euro230m1", "prod-maxi-led"]; // bestseller

async function updateEntry(id, price) {
  // GET current entry
  const g = await fetch(`${BASE}/entries/${id}`, { headers: AUTH });
  if (!g.ok) { console.log(`  skip ${id}: not found`); return; }
  const entry = await g.json();
  const version = entry.sys.version;
  const fields  = entry.fields;

  // Cập nhật price, isBestseller, isNew, isSale
  fields.price        = { "en-US": price,                        "vi-VN": price };
  fields.isBestseller = { "en-US": BEST_SELLERS.includes(id),    "vi-VN": BEST_SELLERS.includes(id) };
  fields.isNew        = { "en-US": NEW_PRODUCTS.includes(id),    "vi-VN": NEW_PRODUCTS.includes(id) };
  fields.isSale       = { "en-US": SALE_PRODUCTS.includes(id),   "vi-VN": SALE_PRODUCTS.includes(id) };

  // PUT
  const r = await fetch(`${BASE}/entries/${id}`, {
    method: "PUT",
    headers: { ...AUTH, "Content-Type": "application/vnd.contentful.management.v1+json", "X-Contentful-Version": String(version) },
    body: JSON.stringify({ fields }),
  });
  const d = await r.json();
  if (!r.ok) { console.error(`  x ${id}: ${JSON.stringify(d.message)}`); return; }

  // Publish
  const pub = await fetch(`${BASE}/entries/${id}/published`, {
    method: "PUT",
    headers: { ...AUTH, "X-Contentful-Version": String(d.sys.version) },
  });
  const pd = await pub.json();
  const flags = [
    BEST_SELLERS.includes(id) ? "⭐" : "",
    NEW_PRODUCTS.includes(id) ? "🆕" : "",
    SALE_PRODUCTS.includes(id) ? "🔥" : "",
  ].filter(Boolean).join("");
  console.log(`  ${pub.ok ? "OK" : "ERR"} ${id}: ${price} ${flags}`);
}

async function main() {
  console.log("=== CẬP NHẬT GIÁ + FLAGS ===");
  for (const [id, price] of Object.entries(PRICES)) {
    await updateEntry(id, price);
  }

  // Verify
  const r = await fetch(`${BASE}/entries?content_type=product&limit=50`, { headers: AUTH });
  const d = await r.json();
  console.log(`\n=== TỔNG: ${d.total} sản phẩm đã cập nhật ===`);
}

main().catch(console.error);
