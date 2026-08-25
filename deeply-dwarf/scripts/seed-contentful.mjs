const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENV = process.env.CONTENTFUL_ENVIRONMENT || "master";

if (!SPACE_ID || !CMA_TOKEN) {
  console.error(
    "Missing CONTENTFUL_SPACE_ID or CONTENTFUL_MANAGEMENT_TOKEN. Set them in the environment before running this script."
  );
  process.exit(1);
}

const BASE = `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENV}`;

async function getEntry(id) {
  const res = await fetch(`${BASE}/entries/${id}`, {
    headers: { "Authorization": `Bearer ${CMA_TOKEN}` }
  });
  if (!res.ok) return null;
  return res.json();
}

async function upsertEntry(id, contentType, fields) {
  // Get current version if exists
  const existing = await getEntry(id);
  const version = existing ? existing.sys.version : 0;

  const res = await fetch(`${BASE}/entries/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${CMA_TOKEN}`,
      "Content-Type": "application/vnd.contentful.management.v1+json",
      "X-Contentful-Version": String(version),
      "X-Contentful-Content-Type": contentType,
    },
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`  x ${id}: ${JSON.stringify(data.details || data.message)}`);
    return null;
  }
  console.log(`  + Upserted: ${id} (v${data.sys.version})`);
  return data;
}

async function publishEntry(id) {
  const entry = await getEntry(id);
  if (!entry) { console.error(`  x publish ${id}: not found`); return; }
  const res = await fetch(`${BASE}/entries/${id}/published`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${CMA_TOKEN}`,
      "X-Contentful-Version": String(entry.sys.version),
    },
  });
  const data = await res.json();
  if (!res.ok) console.error(`  x publish ${id}: ${JSON.stringify(data.details || data.message)}`);
  else console.log(`  > Published: ${id}`);
}

// Helper: bilingual field (same value for both locales)
const bi = (val) => ({ "en-US": val, "vi-VN": val });

const CATEGORIES = [
  { id:"cat-camera",    label:"Camera Quan Sat",          slug:"camera-quan-sat",       desc:"Security cameras, high quality, protecting homes and businesses.", subs:["Camera IP","Camera Analog","DVR/NVR","Accessories","Dashcam"] },
  { id:"cat-mang",      label:"Mang May Tinh",            slug:"mang-may-tinh",         desc:"Network equipment: Switch, Router, WiFi AP, cables and infrastructure.", subs:["Switch","Router","WiFi Access Point","Cable & Connectors","Rack"] },
  { id:"cat-vienthong", label:"Thiet Bi Vien Thong",      slug:"thiet-bi-vien-thong",   desc:"UPS power backup, telecom equipment, IP PBX and communication solutions.", subs:["UPS","IP PBX","IP Phone","Modem & Gateway"] },
  { id:"cat-access",    label:"Access Control",            slug:"access-control",        desc:"Access control systems, time attendance, electromagnetic locks.", subs:["Time Attendance","EM Lock","Card Reader","Barrier Gate"] },
  { id:"cat-baodong",   label:"Thiet Bi Bao Dong",        slug:"thiet-bi-bao-dong",     desc:"Alarm systems, fire detection, sensors and alarm panels.", subs:["Alarm Panel","Sensor","Siren","Fire Alarm"] },
  { id:"cat-amthanh",   label:"Thiet Bi Am Thanh",        slug:"thiet-bi-am-thanh",     desc:"Speakers, amplifiers, microphones and professional audio systems.", subs:["Speaker","Amplifier","Microphone","Mixer"] },
  { id:"cat-vanphong",  label:"Thiet Bi Van Phong",       slug:"thiet-bi-van-phong",    desc:"Printers, projectors, scanners and office equipment.", subs:["Printer","Projector","Scanner","Ink & Toner"] },
  { id:"cat-banhang",   label:"Thiet Bi Ban Hang",        slug:"thiet-bi-ban-hang",     desc:"Cash registers, barcode scanners, receipt printers and POS devices.", subs:["Cash Register","Barcode Scanner","Receipt Printer","Touch Screen"] },
  { id:"cat-dinhvi",    label:"May Dinh Vi & Do",         slug:"may-dinh-vi-do",        desc:"GPS trackers, laser distance meters and precision measurement tools.", subs:["GPS Tracker","Distance Meter","Thermometer"] },
  { id:"cat-smart",     label:"Smart Devices",             slug:"smart-devices",         desc:"Smart home devices, smart locks, video doorbells and IoT solutions.", subs:["Smart Lock","Doorbell","Smart Switch","IoT Sensor"] },
  { id:"cat-vattu",     label:"Vat Tu & Thiet Bi Dien",   slug:"vat-tu-thiet-bi-dien",  desc:"Electrical cables, sockets, circuit breakers and electrical materials.", subs:["Cable","Circuit Breaker","Socket & Switch","LED Light"] },
];

const PRODUCTS = [
  { id:"prod-cam-8mp",  name:"Camera IP 8MP HIKVISION DS-2CD2083G2-IU",        slug:"camera-ip-8mp-hikvision-ds-2cd2083g2-iu",        code:"55871234", brand:"HIKVISION", warranty:"24 months", price:"2.850.000 VND", catId:"cat-camera",    isNew:true },
  { id:"prod-cam-2mp1", name:"Camera IP 2MP HIKVISION DS-2CD1027G2H-LIU",      slug:"camera-ip-2mp-hikvision-ds-2cd1027g2h-liu",      code:"34959069", brand:"HIKVISION", warranty:"24 months", price:"1.485.000 VND", originalPrice:"1.860.000 VND", discount:20, catId:"cat-camera", isSale:true, promotion:"Free 64GB SD Card" },
  { id:"prod-cam-4mp1", name:"Camera IP 4MP HIKVISION DS-2CD1047G2H-LIU",      slug:"camera-ip-4mp-hikvision-ds-2cd1047g2h-liu",      code:"14541018", brand:"HIKVISION", warranty:"24 months", price:"1.600.000 VND", originalPrice:"2.000.000 VND", discount:20, catId:"cat-camera", isSale:true, promotion:"Free 64GB SD Card" },
  { id:"prod-cam-4mp2", name:"Camera IP 4MP HIKVISION DS-2CD1T47G2H-LIU",      slug:"camera-ip-4mp-hikvision-ds-2cd1t47g2h-liu",      code:"08533247", brand:"HIKVISION", warranty:"24 months", price:"1.730.000 VND", originalPrice:"2.350.000 VND", discount:20, catId:"cat-camera", isSale:true, promotion:"Free 64GB SD Card" },
  { id:"prod-cam-2mp2", name:"Camera IP 2MP HIKVISION DS-2CD1327G2H-LIU",      slug:"camera-ip-2mp-hikvision-ds-2cd1327g2h-liu",      code:"71469016", brand:"HIKVISION", warranty:"24 months", price:"1.580.000 VND", originalPrice:"1.975.000 VND", discount:20, catId:"cat-camera", isSale:true, promotion:"Free 64GB SD Card" },
  { id:"prod-nvr-8ch",  name:"NVR 8-Channel HIKVISION DS-7608NXI-I2",           slug:"dau-ghi-hinh-ip-8-kenh-hikvision-ds-7608nxi-i2", code:"23478901", brand:"HIKVISION", warranty:"24 months", price:"4.100.000 VND", catId:"cat-camera",    isNew:true },
  { id:"prod-sw-p",     name:"4-Port GE PoE Switch RUIJIE RG-ES207GS-P",        slug:"4-port-ge-poe-switch-ruijie-rg-es207gs-p",       code:"03387812", brand:"RUIJIE",    warranty:"24 months", price:"1.400.000 VND", catId:"cat-mang",      isBestseller:true },
  { id:"prod-sw-lp",    name:"4-Port GE PoE Switch RUIJIE RG-ES207GS-LP",       slug:"4-port-ge-poe-switch-ruijie-rg-es207gs-lp",      code:"72423584", brand:"RUIJIE",    warranty:"24 months", price:"1.250.000 VND", catId:"cat-mang",      isBestseller:true },
  { id:"prod-sw-16",    name:"16-Port GE PoE Switch RUIJIE RG-ES220GS-P-V2",    slug:"16-port-ge-poe-switch-ruijie-rg-es220gs-p-v2",   code:"97335756", brand:"RUIJIE",    warranty:"24 months", price:"4.650.000 VND", originalPrice:"5.810.000 VND", discount:20, catId:"cat-mang", isBestseller:true, isSale:true },
  { id:"prod-wifi-eap", name:"WiFi 6 AP TP-Link EAP670 AX3000",                 slug:"bo-phat-wifi-6-tp-link-eap670-ax3000",           code:"88342910", brand:"TP-Link",   warranty:"24 months", price:"3.200.000 VND", catId:"cat-mang",      isNew:true },
  { id:"prod-sw-24",    name:"24-Port Gigabit Switch RUIJIE RG-S1924G",          slug:"switch-24-port-gigabit-ruijie-rg-s1924g",        code:"44218763", brand:"RUIJIE",    warranty:"24 months", price:"1.850.000 VND", catId:"cat-mang",      isNew:true },
  { id:"prod-ups-1200", name:"UPS SOROTEC BL1200 LCD",                           slug:"nguon-luu-dien-ups-sorotec-bl1200-lcd",          code:"13738294", brand:"SOROTEC",   warranty:"24 months", price:"2.650.000 VND", catId:"cat-vienthong", isBestseller:true },
  { id:"prod-ups-1000", name:"UPS SOROTEC BL1000 LCD",                           slug:"nguon-luu-dien-ups-sorotec-bl1000-lcd",          code:"61380847", brand:"SOROTEC",   warranty:"24 months", price:"2.580.000 VND", catId:"cat-vienthong", isBestseller:true },
  { id:"prod-acc-1",    name:"Fingerprint Time Attendance HIKVISION DS-K1T804BMF", slug:"may-cham-cong-van-tay-hikvision-ds-k1t804bmf", code:"67932148", brand:"HIKVISION", warranty:"24 months", price:"3.600.000 VND", catId:"cat-access",    isNew:true },
  { id:"prod-proj-1",   name:"Projector EPSON EB-X52",                           slug:"may-chieu-epson-eb-x52",                         code:"14833700", brand:"EPSON",     warranty:"12 months", price:"15.500.000 VND", originalPrice:"19.375.000 VND", discount:20, catId:"cat-vanphong", isSale:true, promotion:"Free 100-inch screen" },
];

async function main() {
  console.log("\n=== UPSERT + PUBLISH CATEGORIES ===");
  for (const cat of CATEGORIES) {
    const entry = await upsertEntry(cat.id, "category", {
      label:         bi(cat.label),
      slug:          bi(cat.slug),
      description:   bi(cat.desc),
      subcategories: bi(cat.subs),
    });
    if (entry) await publishEntry(cat.id);
  }

  console.log("\n=== UPSERT + PUBLISH PRODUCTS ===");
  for (const p of PRODUCTS) {
    const fields = {
      name:         bi(p.name),
      slug:         bi(p.slug),
      code:         bi(p.code),
      brand:        bi(p.brand),
      warranty:     bi(p.warranty),
      price:        bi(p.price),
      category:     bi({ sys: { type: "Link", linkType: "Entry", id: p.catId } }),
      isBestseller: bi(p.isBestseller ?? false),
      isNew:        bi(p.isNew ?? false),
      isSale:       bi(p.isSale ?? false),
    };
    if (p.originalPrice) fields.originalPrice = bi(p.originalPrice);
    if (p.discount)      fields.discount      = bi(p.discount);
    if (p.promotion)     fields.promotion     = bi(p.promotion);

    const entry = await upsertEntry(p.id, "product", fields);
    if (entry) await publishEntry(p.id);
  }

  console.log("\n=== DONE ===");
}

main().catch(console.error);
