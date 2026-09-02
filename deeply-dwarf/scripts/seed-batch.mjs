const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN ?? "";
const BASE  = "https://api.contentful.com/spaces/z8xn4sl90drz/environments/master";
const AUTH  = { "Authorization": `Bearer ${TOKEN}` };
const bi    = v => ({ "en-US": v, "vi-VN": v });

async function upsert(id, fields) {
  const g = await fetch(`${BASE}/entries/${id}`, { headers: AUTH });
  const existing = g.ok ? await g.json() : null;
  const version = existing ? existing.sys.version : 0;
  const r = await fetch(`${BASE}/entries/${id}`, {
    method: "PUT",
    headers: { ...AUTH, "Content-Type": "application/vnd.contentful.management.v1+json", "X-Contentful-Version": String(version), "X-Contentful-Content-Type": "product" },
    body: JSON.stringify({ fields })
  });
  const d = await r.json();
  if (!r.ok) { console.error(`x ${id}: ${JSON.stringify(d.details ?? d.message)}`); return null; }
  const pub = await fetch(`${BASE}/entries/${id}/published`, { method: "PUT", headers: { ...AUTH, "X-Contentful-Version": String(d.sys.version) } });
  const pd = await pub.json();
  console.log(`${pub.ok ? "OK" : "ERR"} ${id} v${pd.sys?.version}`);
  return d;
}

const PRODUCTS = [
  ["prod-key-mb",    "Bộ chọn chìa khóa VDS KEY MB",             "bo-chon-chia-khoa-vds-key-mb",          "VDS-KEY-MB",       "cat-phu-kien-vds", false, false],
  ["prod-tron-2",    "Công tắc giới hạn VDS TRON-2",              "cong-tac-gioi-han-vds-tron-2",          "VDS-TRON-2",       "cat-phu-kien-vds", false, false],
  ["prod-galaxy-1",  "Bộ chọn mã số VDS GALAXY-1 (1 nút)",        "bo-chon-ma-so-vds-galaxy-1",            "VDS-GALAXY-1",     "cat-phu-kien-vds", true,  false],
  ["prod-maxi-led",  "Đèn báo nhấp nháy VDS MAXI LED",            "den-bao-nhap-nhay-vds-maxi-led",        "VDS-MAXI-LED",     "cat-phu-kien-vds", true,  false],
  ["prod-eco-a",     "Mắt thần an toàn VDS ECO-A",                "mat-than-an-toan-vds-eco-a",            "VDS-ECO-A",        "cat-phu-kien-vds", false, false],
  ["prod-galaxy-2",  "Bộ chọn mã số VDS GALAXY-2 (2 nút)",        "bo-chon-ma-so-vds-galaxy-2",            "VDS-GALAXY-2",     "cat-phu-kien-vds", false, false],
  ["prod-he50",      "Cảm biến vị trí VDS HE 50",                 "cam-bien-vi-tri-vds-he-50",             "VDS-HE50",         "cat-phu-kien-vds", false, false],
  ["prod-multi-4",   "Remote điều khiển VDS MULTI-4 (4 kênh)",    "remote-dieu-khien-vds-multi-4",         "VDS-MULTI-4",      "cat-phu-kien-vds", true,  false],
  ["prod-galaxy-3",  "Bộ chọn mã số VDS GALAXY-3 (3 nút)",        "bo-chon-ma-so-vds-galaxy-3",            "VDS-GALAXY-3",     "cat-phu-kien-vds", false, false],
  ["prod-tronch",    "Công tắc cổng dừng VDS TRONCH",             "cong-tac-cong-dung-vds-tronch",         "VDS-TRONCH",       "cat-phu-kien-vds", false, false],
  ["prod-pa",        "Nút nhấn điều khiển VDS P.A",               "nut-nhan-dieu-khien-vds-pa",            "VDS-PA",           "cat-phu-kien-vds", false, false],
  ["prod-galaxy-4",  "Bộ chọn mã số VDS GALAXY-4 (4 nút)",        "bo-chon-ma-so-vds-galaxy-4",            "VDS-GALAXY-4",     "cat-phu-kien-vds", false, false],
  ["prod-ma1u",      "Thanh ray nối VDS MA 1U (110mm)",            "thanh-ray-noi-vds-ma-1u",               "VDS-MA1U",         "cat-phu-kien-vds", false, false],
  ["prod-euro230m1", "Hộp điều khiển VDS EURO 230 M1",            "hop-dieu-khien-vds-euro-230-m1",        "VDS-EURO-230-M1",  "cat-phu-kien-vds", true,  false],
  ["prod-euro230me", "Bo mạch điều khiển VDS EURO 230 ME",        "bo-mach-dieu-khien-vds-euro-230-me",    "VDS-EURO-230-ME",  "cat-phu-kien-vds", false, false],
  ["prod-ma2u",      "Thanh ray nối VDS MA 2U (225mm)",            "thanh-ray-noi-vds-ma-2u",               "VDS-MA2U",         "cat-phu-kien-vds", false, false],
  ["prod-euro24m1",  "Hộp điều khiển VDS EURO 24 M1",             "hop-dieu-khien-vds-euro-24-m1",         "VDS-EURO-24-M1",   "cat-phu-kien-vds", false, false],
  ["prod-elr4me",    "Bo mạch điều khiển VDS ELR 4 ME",           "bo-mach-dieu-khien-vds-elr4-me",        "VDS-ELR4-ME",      "cat-phu-kien-vds", false, false],
  ["prod-tez2",      "Công tắc giới hạn VDS TEZ-2",               "cong-tac-gioi-han-vds-tez-2",           "VDS-TEZ2",         "cat-phu-kien-vds", false, false],
  ["prod-telescopic","Anten kéo dài VDS TELESCOPIC",               "anten-keo-dai-vds-telescopic",          "VDS-TELESCOPIC",   "cat-phu-kien-vds", false, false],
  ["prod-bp2402",    "Pin dự phòng VDS BP 2402 (24V)",             "pin-du-phong-vds-bp-2402",              "VDS-BP2402",       "cat-phu-kien-vds", false, false],
  ["prod-mini",      "Hộp điều khiển VDS MINI",                   "hop-dieu-khien-vds-mini",               "VDS-MINI",         "cat-phu-kien-vds", false, false],
  ["prod-tsl",       "Công tắc từ VDS TSL",                       "cong-tac-tu-vds-tsl",                   "VDS-TSL",          "cat-phu-kien-vds", false, false],
  ["prod-bi-polaire","Anten song cực VDS BI POLAIRE",              "anten-song-cuc-vds-bi-polaire",         "VDS-BI-POLAIRE",   "cat-phu-kien-vds", false, false],
  ["prod-bp2502",    "Pin dự phòng VDS BP 2502 (24V)",             "pin-du-phong-vds-bp-2502",              "VDS-BP2502",       "cat-phu-kien-vds", false, false],
];

async function main() {
  for (const [id, name, slug, code, catId, best, isnew] of PRODUCTS) {
    await upsert(id, {
      name:         bi(name),
      slug:         bi(slug),
      code:         bi(code),
      brand:        bi("VDS Automation"),
      warranty:     bi("24 tháng"),
      price:        bi("Liên hệ"),
      category:     bi({ sys: { type: "Link", linkType: "Entry", id: catId } }),
      isBestseller: bi(best),
      isNew:        bi(isnew),
      isSale:       bi(false),
    });
  }

  const r = await fetch(`${BASE}/entries?content_type=product&limit=1`, { headers: AUTH });
  const d = await r.json();
  console.log(`\nTổng sản phẩm: ${d.total}`);
}

main().catch(console.error);
