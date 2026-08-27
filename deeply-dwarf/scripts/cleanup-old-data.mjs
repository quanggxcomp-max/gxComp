const SPACE_ID  = process.env.CONTENTFUL_SPACE_ID          ?? "z8xn4sl90drz";
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN  ?? "";
const ENV       = process.env.CONTENTFUL_ENVIRONMENT       ?? "master";
const BASE      = `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENV}`;
const AUTH      = { "Authorization": `Bearer ${CMA_TOKEN}` };

// IDs cũ cần xóa (categories giả)
const OLD_CATEGORY_IDS = [
  "cat-camera", "cat-mang", "cat-vienthong", "cat-access",
  "cat-baodong", "cat-amthanh", "cat-vanphong", "cat-banhang",
  "cat-dinhvi", "cat-smart", "cat-vattu",
];

// IDs product cũ cần xóa (data giả)
const OLD_PRODUCT_IDS = [
  "prod-cam-8mp", "prod-cam-2mp1", "prod-cam-4mp1", "prod-cam-4mp2",
  "prod-cam-2mp2", "prod-nvr-8ch", "prod-sw-p", "prod-sw-lp",
  "prod-sw-16", "prod-wifi-eap", "prod-sw-24", "prod-ups-1200",
  "prod-ups-1000", "prod-acc-1", "prod-proj-1",
];

async function getEntry(id) {
  const r = await fetch(`${BASE}/entries/${id}`, { headers: AUTH });
  if (!r.ok) return null;
  return r.json();
}

async function unpublishEntry(id, version) {
  const r = await fetch(`${BASE}/entries/${id}/published`, {
    method: "DELETE",
    headers: { ...AUTH, "X-Contentful-Version": String(version) },
  });
  return r.ok || r.status === 404;
}

async function deleteEntry(id, version) {
  const r = await fetch(`${BASE}/entries/${id}`, {
    method: "DELETE",
    headers: { ...AUTH, "X-Contentful-Version": String(version) },
  });
  return r.ok || r.status === 404;
}

async function removeEntry(id) {
  const entry = await getEntry(id);
  if (!entry) { console.log(`  ~ ${id}: không tìm thấy, bỏ qua`); return; }

  // Unpublish nếu đang published
  if (entry.sys.publishedVersion) {
    await unpublishEntry(id, entry.sys.version);
    // Lấy lại version mới sau unpublish
    const updated = await getEntry(id);
    await deleteEntry(id, updated.sys.version);
  } else {
    await deleteEntry(id, entry.sys.version);
  }
  console.log(`  ✓ Đã xóa: ${id}`);
}

async function main() {
  console.log("\n=== XÓA PRODUCTS CŨ (data giả) ===");
  for (const id of OLD_PRODUCT_IDS) await removeEntry(id);

  console.log("\n=== XÓA CATEGORIES CŨ (data giả) ===");
  for (const id of OLD_CATEGORY_IDS) await removeEntry(id);

  console.log("\n=== KIỂM TRA SAU KHI XÓA ===");
  const r = await fetch(`${BASE}/entries?content_type=category&limit=50`, { headers: AUTH });
  const data = await r.json();
  console.log(`Categories còn lại: ${data.total}`);
  data.items.forEach(i => console.log(`  - ${i.sys.id} | ${i.fields.label?.["vi-VN"]}`));

  const r2 = await fetch(`${BASE}/entries?content_type=product&limit=50`, { headers: AUTH });
  const data2 = await r2.json();
  console.log(`\nProducts còn lại: ${data2.total}`);

  console.log("\n=== XONG ===");
}

main().catch(console.error);
