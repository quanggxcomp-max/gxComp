const SPACE = process.env.CONTENTFUL_SPACE_ID       ?? "z8xn4sl90drz";
const TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN ?? "";
const ENV   = process.env.CONTENTFUL_ENVIRONMENT     ?? "master";
const BASE  = `https://api.contentful.com/spaces/${SPACE}/environments/${ENV}`;

const authHeader = { "Authorization": `Bearer ${TOKEN}` };
const jsonHeader = { "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/vnd.contentful.management.v1+json" };

// Correct Vietnamese field names
const CATEGORY_NAMES = {
  label:         "Tên danh mục",
  slug:          "Slug URL",
  description:   "Mô tả",
  subcategories: "Danh mục con",
  image:         "Ảnh đại diện",
};

const PRODUCT_NAMES = {
  name:          "Tên sản phẩm",
  slug:          "Slug URL",
  code:          "Mã sản phẩm",
  brand:         "Hãng sản xuất",
  warranty:      "Bảo hành",
  price:         "Giá bán (VD: 1.400.000 ₫)",
  originalPrice: "Giá gốc (trước giảm)",
  discount:      "Phần trăm giảm giá",
  image:         "Ảnh sản phẩm",
  category:      "Danh mục",
  description:   "Mô tả sản phẩm",
  specs:         "Thông số kỹ thuật (JSON)",
  faq:           "Câu hỏi thường gặp",
  isBestseller:  "Sản phẩm bán chạy",
  isNew:         "Sản phẩm mới",
  isSale:        "Sản phẩm khuyến mãi",
  promotion:     "Nội dung khuyến mãi",
};

async function updateContentType(ctId, nameMap) {
  // 1. GET current
  const getRes = await fetch(`${BASE}/content_types/${ctId}`, { headers: authHeader });
  const ct = await getRes.json();
  const version = ct.sys.version;
  console.log(`\n[${ctId}] current version: ${version}, fields: ${ct.fields.length}`);

  // 2. Update field names
  const updatedFields = ct.fields.map(field => ({
    ...field,
    name: nameMap[field.id] ?? field.name,
  }));

  // Log changes
  updatedFields.forEach(f => {
    if (nameMap[f.id]) console.log(`  ${f.id}: "${nameMap[f.id]}"`);
  });

  // 3. PUT updated content type
  const putRes = await fetch(`${BASE}/content_types/${ctId}`, {
    method: "PUT",
    headers: { ...jsonHeader, "X-Contentful-Version": String(version) },
    body: JSON.stringify({ ...ct, fields: updatedFields }),
  });
  const putData = await putRes.json();
  if (!putRes.ok) {
    console.error(`  x PUT failed: ${JSON.stringify(putData.details || putData.message)}`);
    return;
  }
  console.log(`  + Updated to v${putData.sys.version}`);

  // 4. Publish
  const pubRes = await fetch(`${BASE}/content_types/${ctId}/published`, {
    method: "PUT",
    headers: { ...authHeader, "X-Contentful-Version": String(putData.sys.version) },
  });
  const pubData = await pubRes.json();
  if (!pubRes.ok) console.error(`  x Publish failed: ${pubData.message}`);
  else console.log(`  > Published v${pubData.sys.publishedVersion}`);
}

async function verify(ctId) {
  const res = await fetch(`${BASE}/content_types/${ctId}`, { headers: authHeader });
  const ct = await res.json();
  console.log(`\n[verify ${ctId}]`);
  ct.fields.forEach(f => console.log(`  ${f.id.padEnd(16)} | ${f.name}`));
}

async function main() {
  await updateContentType("category", CATEGORY_NAMES);
  await updateContentType("product",  PRODUCT_NAMES);
  await verify("category");
  await verify("product");
  console.log("\nDone!");
}

main().catch(console.error);
