const SPACE_ID  = process.env.CONTENTFUL_SPACE_ID          ?? "z8xn4sl90drz";
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN  ?? "";
const ENV       = process.env.CONTENTFUL_ENVIRONMENT       ?? "master";
const BASE      = `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENV}`;

async function getEntry(id) {
  const res = await fetch(`${BASE}/entries/${id}`, {
    headers: { "Authorization": `Bearer ${CMA_TOKEN}` }
  });
  if (!res.ok) return null;
  return res.json();
}

async function upsertEntry(id, contentType, fields) {
  const existing = await getEntry(id);
  const version  = existing ? existing.sys.version : 0;
  const res = await fetch(`${BASE}/entries/${id}`, {
    method: "PUT",
    headers: {
      "Authorization":              `Bearer ${CMA_TOKEN}`,
      "Content-Type":               "application/vnd.contentful.management.v1+json",
      "X-Contentful-Version":       String(version),
      "X-Contentful-Content-Type":  contentType,
    },
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  if (!res.ok) { console.error(`  x ${id}: ${JSON.stringify(data.details ?? data.message)}`); return null; }
  console.log(`  + Upserted: ${id} (v${data.sys.version})`);
  return data;
}

async function publishEntry(id) {
  const entry = await getEntry(id);
  if (!entry) { console.error(`  x publish ${id}: not found`); return; }
  const res = await fetch(`${BASE}/entries/${id}/published`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${CMA_TOKEN}`, "X-Contentful-Version": String(entry.sys.version) },
  });
  const data = await res.json();
  if (!res.ok) console.error(`  x publish ${id}: ${data.message}`);
  else console.log(`  > Published: ${id}`);
}

const bi = (val) => ({ "en-US": val, "vi-VN": val });

// ── CATEGORIES VDS ───────────────────────────────────────────────────────────
const VDS_CATEGORIES = [
  {
    id:   "cat-cong-truot",
    label: "Cổng Trượt Tự Động",
    slug:  "cong-truot-tu-dong",
    desc:  "Hệ thống tự động hóa cổng trượt VDS Italy — động cơ CARRERA, AG-FUTURE, SIMPLY cho cổng từ 600kg đến 2500kg. Phù hợp nhà dân, biệt thự, khu công nghiệp.",
    subs:  ["Động cơ cổng trượt", "Bộ kit cổng trượt", "Thanh răng cổng trượt", "Phụ kiện cổng trượt"],
  },
  {
    id:   "cat-cong-mo",
    label: "Cổng Mở Tự Động",
    slug:  "cong-mo-tu-dong",
    desc:  "Hệ thống tự động hóa cổng mở (cổng bản lề) VDS Italy — động cơ IBIS, EGO, PM1, UNDER-V cho cổng 1 và 2 cánh. Lắp nổi hoặc âm sàn.",
    subs:  ["Cánh tay đẩy cổng mở", "Kích tuyến tính cổng mở", "Động cơ âm sàn", "Bộ kit cổng mở"],
  },
  {
    id:   "cat-barrier",
    label: "Barrier Tự Động",
    slug:  "barrier-tu-dong",
    desc:  "Barrier tự động VDS Italy (BERTA) — kiểm soát lưu lượng xe vào chung cư, bãi đỗ xe, khu công nghiệp, trạm thu phí. Cần chắn từ 3m đến 6m.",
    subs:  ["Barrier bãi đỗ xe", "Barrier khu công nghiệp", "Bollard tự động", "Phụ kiện barrier"],
  },
  {
    id:   "cat-cua-cuon",
    label: "Cửa Cuộn Tự Động",
    slug:  "cua-cuon-tu-dong",
    desc:  "Hệ thống tự động hóa cửa cuộn VDS Italy (TONDO) — dành cho cửa hàng, nhà kho, trung tâm thương mại. Tải trọng đến 180kg.",
    subs:  ["Động cơ cửa cuộn", "Bộ điều khiển cửa cuộn", "Remote cửa cuộn", "Phụ kiện cửa cuộn"],
  },
  {
    id:   "cat-cua-garage",
    label: "Cửa Garage & Cửa Tự Động",
    slug:  "cua-garage-tu-dong",
    desc:  "Hệ thống tự động hóa cửa garage, cửa trượt tự động VDS Italy (UTILE, SPEED PLUS) — an toàn, êm ái, tiết kiệm điện.",
    subs:  ["Cửa garage tự động", "Cửa trượt tự động", "Cổng quay pedestrian", "Phụ kiện cửa garage"],
  },
  {
    id:   "cat-phu-kien-vds",
    label: "Phụ Kiện & Điều Khiển VDS",
    slug:  "phu-kien-dieu-khien-vds",
    desc:  "Phụ kiện chính hãng VDS Italy — remote điều khiển, mắt thần an toàn, đèn nhấp nháy, bộ điều khiển, đầu đọc thẻ, bộ chọn chìa khóa.",
    subs:  ["Remote điều khiển", "Mắt thần an toàn", "Đèn báo nhấp nháy", "Board điều khiển", "Đầu đọc thẻ & Access Control"],
  },
];

// ── PRODUCTS VDS ─────────────────────────────────────────────────────────────
const VDS_PRODUCTS = [
  // Cổng trượt
  {
    id: "prod-vds-simply-600",
    name: "Động cơ cổng trượt VDS SIMPLY 600 (230V/24V)",
    slug: "dong-co-cong-truot-vds-simply-600",
    code: "VDS-SIMPLY-600",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-cong-truot",
    isNew: false, isBestseller: true, isSale: false,
  },
  {
    id: "prod-vds-carrera-800",
    name: "Bộ Kit cổng trượt VDS CARRERA 800 (đến 800kg)",
    slug: "bo-kit-cong-truot-vds-carrera-800",
    code: "VDS-CARRERA-800",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-cong-truot",
    isNew: false, isBestseller: true, isSale: false,
  },
  {
    id: "prod-vds-carrera-1000",
    name: "Bộ Kit cổng trượt VDS CARRERA 1000 (đến 1000kg)",
    slug: "bo-kit-cong-truot-vds-carrera-1000",
    code: "VDS-CARRERA-1000",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-cong-truot",
    isNew: false, isBestseller: false, isSale: false,
  },
  {
    id: "prod-vds-ag-future-800",
    name: "Bộ Kit cổng trượt VDS AG-FUTURE 230V (đến 800kg)",
    slug: "bo-kit-cong-truot-vds-ag-future-800",
    code: "VDS-AGFUTURE-800",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-cong-truot",
    isNew: true, isBestseller: false, isSale: false,
  },
  {
    id: "prod-vds-ag-future-1600",
    name: "Bộ Kit cổng trượt VDS AG-FUTURE 230V (đến 1600kg)",
    slug: "bo-kit-cong-truot-vds-ag-future-1600",
    code: "VDS-AGFUTURE-1600",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-cong-truot",
    isNew: true, isBestseller: false, isSale: false,
  },
  // Cổng mở
  {
    id: "prod-vds-ibis",
    name: "Cánh tay đẩy VDS IBIS — Cổng mở 2 cánh (đến 3.5m/cánh)",
    slug: "canh-tay-day-vds-ibis-cong-mo",
    code: "VDS-IBIS",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-cong-mo",
    isNew: false, isBestseller: true, isSale: false,
  },
  {
    id: "prod-vds-ego",
    name: "Kích tuyến tính VDS EGO — Cổng mở 1 cánh (đến 2.5m/200kg)",
    slug: "kich-tuyen-tinh-vds-ego-cong-mo",
    code: "VDS-EGO-230V",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-cong-mo",
    isNew: false, isBestseller: true, isSale: false,
  },
  {
    id: "prod-vds-pm1",
    name: "Động cơ cổng mở VDS PM1 — Cánh tay tuyến tính (đến 3.5m)",
    slug: "dong-co-cong-mo-vds-pm1",
    code: "VDS-PM1",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-cong-mo",
    isNew: false, isBestseller: false, isSale: false,
  },
  {
    id: "prod-vds-under-v",
    name: "Động cơ âm sàn VDS UNDER-V — Cổng mở ngầm dưới đất",
    slug: "dong-co-am-san-vds-under-v",
    code: "VDS-UNDER-V",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-cong-mo",
    isNew: false, isBestseller: false, isSale: false,
  },
  // Barrier
  {
    id: "prod-vds-berta-3m",
    name: "Barrier tự động VDS BERTA — Cần chắn 3m",
    slug: "barrier-tu-dong-vds-berta-3m",
    code: "VDS-BERTA-3M",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-barrier",
    isNew: false, isBestseller: true, isSale: false,
  },
  {
    id: "prod-vds-berta-6m",
    name: "Barrier tự động VDS BERTA — Cần chắn 6m",
    slug: "barrier-tu-dong-vds-berta-6m",
    code: "VDS-BERTA-6M",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-barrier",
    isNew: false, isBestseller: false, isSale: false,
  },
  {
    id: "prod-vds-bollard",
    name: "Bollard tự động VDS — Kiểm soát phương tiện khu vực cấm",
    slug: "bollard-tu-dong-vds",
    code: "VDS-BOLLARD",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-barrier",
    isNew: true, isBestseller: false, isSale: false,
  },
  // Cửa cuộn
  {
    id: "prod-vds-tondo-180",
    name: "Động cơ cửa cuộn VDS TONDO (đến 180kg)",
    slug: "dong-co-cua-cuon-vds-tondo-180",
    code: "VDS-TONDO-180",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-cua-cuon",
    isNew: false, isBestseller: true, isSale: false,
  },
  // Cửa garage
  {
    id: "prod-vds-utile-24v",
    name: "Động cơ cửa garage VDS UTILE 24V — Êm ái, an toàn",
    slug: "dong-co-cua-garage-vds-utile-24v",
    code: "VDS-UTILE-24V",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-cua-garage",
    isNew: false, isBestseller: true, isSale: false,
  },
  {
    id: "prod-vds-speed-plus",
    name: "Cửa trượt tự động VDS SPEED PLUS — Nhanh, êm ái",
    slug: "cua-truot-tu-dong-vds-speed-plus",
    code: "VDS-SPEED-PLUS",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-cua-garage",
    isNew: true, isBestseller: false, isSale: false,
  },
  {
    id: "prod-vds-riki-20",
    name: "Cổng quay người đi bộ VDS RIKI-20 — Kiểm soát lối vào",
    slug: "cong-quay-nguoi-di-bo-vds-riki-20",
    code: "VDS-RIKI-20",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-cua-garage",
    isNew: true, isBestseller: false, isSale: false,
  },
  // Phụ kiện
  {
    id: "prod-vds-remote-tx02",
    name: "Remote điều khiển VDS TX02 MULTI4 — 4 kênh",
    slug: "remote-dieu-khien-vds-tx02-multi4-4-kenh",
    code: "VDS-TX02-MULTI4",
    brand: "VDS Automation",
    warranty: "12 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isNew: false, isBestseller: true, isSale: false,
  },
  {
    id: "prod-vds-remote-e010",
    name: "Remote điều khiển VDS E010 ECO-R — 5 kênh",
    slug: "remote-dieu-khien-vds-e010-eco-r-5-kenh",
    code: "VDS-E010-ECOR",
    brand: "VDS Automation",
    warranty: "12 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isNew: false, isBestseller: false, isSale: false,
  },
  {
    id: "prod-vds-photocell-12c",
    name: "Mắt thần an toàn VDS 12/C — Một đôi, lắp tường",
    slug: "mat-than-an-toan-vds-12c-lat-tuong",
    code: "VDS-12C",
    brand: "VDS Automation",
    warranty: "12 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isNew: false, isBestseller: true, isSale: false,
  },
  {
    id: "prod-vds-flash-alf-g",
    name: "Đèn nhấp nháy VDS ALF-G — 12/24V/230V lắp tường",
    slug: "den-nhap-nhay-vds-alf-g-lat-tuong",
    code: "VDS-ALF-G",
    brand: "VDS Automation",
    warranty: "12 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isNew: false, isBestseller: false, isSale: false,
  },
];

async function main() {
  console.log("\n=== SEED VDS CATEGORIES ===");
  for (const cat of VDS_CATEGORIES) {
    const entry = await upsertEntry(cat.id, "category", {
      label:         bi(cat.label),
      slug:          bi(cat.slug),
      description:   bi(cat.desc),
      subcategories: bi(cat.subs),
    });
    if (entry) await publishEntry(cat.id);
  }

  console.log("\n=== SEED VDS PRODUCTS ===");
  for (const p of VDS_PRODUCTS) {
    const fields = {
      name:         bi(p.name),
      slug:         bi(p.slug),
      code:         bi(p.code),
      brand:        bi(p.brand),
      warranty:     bi(p.warranty),
      price:        bi(p.price),
      category:     bi({ sys: { type: "Link", linkType: "Entry", id: p.catId } }),
      isBestseller: bi(p.isBestseller),
      isNew:        bi(p.isNew),
      isSale:       bi(p.isSale),
    };
    const entry = await upsertEntry(p.id, "product", fields);
    if (entry) await publishEntry(p.id);
  }

  console.log("\n=== DONE ===");
}

main().catch(console.error);
