const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN ?? "";
const BASE  = "https://api.contentful.com/spaces/z8xn4sl90drz/environments/master";
const AUTH  = { "Authorization": `Bearer ${TOKEN}` };

const PRICES = [
  ["prod-galaxy-1",   "2.499.000 ₫", true,  false, false],
  ["prod-galaxy-2",   "2.499.000 ₫", false, false, false],
  ["prod-galaxy-3",   "2.499.000 ₫", false, false, false],
  ["prod-galaxy-4",   "1.999.000 ₫", false, true,  false],
  ["prod-eco-a",      "2.499.000 ₫", false, false, false],
  ["prod-multi-4",    "1.099.000 ₫", false, false, true ],
  ["prod-key-mb",     "1.499.000 ₫", false, false, false],
  ["prod-maxi-led",   "1.499.000 ₫", true,  false, false],
  ["prod-he50",       "4.999.000 ₫", false, false, false],
  ["prod-tronch",     "4.999.000 ₫", false, true,  false],
  ["prod-euro230me",  "6.999.000 ₫", false, false, false],
  ["prod-elr4me",     "7.999.000 ₫", false, false, false],
  ["prod-mini",       "2.499.000 ₫", false, false, false],
  ["prod-euro230m1",  "4.499.000 ₫", true,  false, false],
  ["prod-euro24m1",   "4.499.000 ₫", false, false, false],
  ["prod-bp2402",     "2.999.000 ₫", false, false, false],
  ["prod-bp2502",     "3.999.000 ₫", false, false, false],
  ["prod-ma1u",       "599.000 ₫",   false, false, false],
  ["prod-ma2u",       "899.000 ₫",   false, false, false],
  ["prod-telescopic", "3.999.000 ₫", false, false, true ],
  ["prod-bi-polaire", "5.999.000 ₫", false, false, false],
];

// Lấy batch từ arg: node update-prices-fast.mjs 0 7  (index 0 đến 6)
const from = parseInt(process.argv[2] ?? "0");
const to   = parseInt(process.argv[3] ?? "7");
const batch = PRICES.slice(from, to);

async function update([id, price, best, isnew, sale]) {
  const g = await fetch(`${BASE}/entries/${id}`, { headers: AUTH });
  if (!g.ok) { console.log(`skip ${id}`); return; }
  const e = await g.json();
  const fields = e.fields;
  fields.price        = { "en-US": price, "vi-VN": price };
  fields.isBestseller = { "en-US": best,  "vi-VN": best  };
  fields.isNew        = { "en-US": isnew, "vi-VN": isnew };
  fields.isSale       = { "en-US": sale,  "vi-VN": sale  };

  const r = await fetch(`${BASE}/entries/${id}`, {
    method: "PUT",
    headers: { ...AUTH, "Content-Type": "application/vnd.contentful.management.v1+json", "X-Contentful-Version": String(e.sys.version) },
    body: JSON.stringify({ fields }),
  });
  const d = await r.json();
  if (!r.ok) { console.error(`x ${id}: ${d.message}`); return; }

  const p = await fetch(`${BASE}/entries/${id}/published`, {
    method: "PUT", headers: { ...AUTH, "X-Contentful-Version": String(d.sys.version) }
  });
  const flags = [best?"⭐":"", isnew?"🆕":"", sale?"🔥":""].filter(Boolean).join("");
  console.log(`${p.ok?"OK":"ERR"} ${id} ${price} ${flags}`);
}

console.log(`Batch ${from}-${to-1} (${batch.length} items)`);
Promise.all(batch.map(update)).then(() => console.log("Done")).catch(console.error);
