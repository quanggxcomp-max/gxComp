const SPACE_ID  = process.env.CONTENTFUL_SPACE_ID          ?? "z8xn4sl90drz";
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN  ?? "";
const ENV       = process.env.CONTENTFUL_ENVIRONMENT       ?? "master";
const BASE      = `https://api.contentful.com/spaces/${SPACE_ID}/environments/${ENV}`;
const AUTH      = { "Authorization": `Bearer ${CMA_TOKEN}` };

async function getEntry(id) {
  const r = await fetch(`${BASE}/entries/${id}`, { headers: AUTH });
  if (!r.ok) return null;
  return r.json();
}

async function upsertEntry(id, contentType, fields) {
  const existing = await getEntry(id);
  const version  = existing ? existing.sys.version : 0;
  const res = await fetch(`${BASE}/entries/${id}`, {
    method: "PUT",
    headers: {
      ...AUTH,
      "Content-Type":              "application/vnd.contentful.management.v1+json",
      "X-Contentful-Version":      String(version),
      "X-Contentful-Content-Type": contentType,
    },
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  if (!res.ok) { console.error(`  x ${id}: ${JSON.stringify(data.details ?? data.message)}`); return null; }
  console.log(`  + ${id} (v${data.sys.version})`);
  return data;
}

async function publishEntry(id) {
  const entry = await getEntry(id);
  if (!entry) return;
  const res = await fetch(`${BASE}/entries/${id}/published`, {
    method: "PUT",
    headers: { ...AUTH, "X-Contentful-Version": String(entry.sys.version) },
  });
  const data = await res.json();
  if (!res.ok) console.error(`  x publish ${id}: ${data.message}`);
  else console.log(`  > Published: ${id}`);
}

async function deleteEntry(id) {
  const entry = await getEntry(id);
  if (!entry) { console.log(`  ~ ${id}: không tìm thấy`); return; }
  // Unpublish nếu đang published
  if (entry.sys.publishedVersion) {
    await fetch(`${BASE}/entries/${id}/published`, { method: "DELETE", headers: { ...AUTH, "X-Contentful-Version": String(entry.sys.version) } });
    const updated = await getEntry(id);
    await fetch(`${BASE}/entries/${id}`, { method: "DELETE", headers: { ...AUTH, "X-Contentful-Version": String(updated.sys.version) } });
  } else {
    await fetch(`${BASE}/entries/${id}`, { method: "DELETE", headers: { ...AUTH, "X-Contentful-Version": String(entry.sys.version) } });
  }
  console.log(`  ✓ Xóa: ${id}`);
}

const bi = (val) => ({ "en-US": val, "vi-VN": val });

// ── XÓA sản phẩm cũ không thật ─────────────────────────────────────────────
const OLD_PRODUCTS = [
  "prod-vds-simply-600","prod-vds-carrera-800","prod-vds-carrera-1000",
  "prod-vds-ag-future-800","prod-vds-ag-future-1600","prod-vds-ibis",
  "prod-vds-ego","prod-vds-pm1","prod-vds-under-v",
  "prod-vds-berta-3m","prod-vds-berta-6m","prod-vds-bollard",
  "prod-vds-tondo-180","prod-vds-utile-24v","prod-vds-speed-plus",
  "prod-vds-riki-20","prod-vds-remote-tx02","prod-vds-remote-e010",
  "prod-vds-photocell-12c","prod-vds-flash-alf-g",
];

// ── CATEGORIES thật (cập nhật lại tên đúng) ────────────────────────────────
// Từ ảnh catalog: PHỤ KIỆN gồm: Sản phẩm điều khiển, Điều khiển từ xa,
// Cảm biến vị trí, Công tắc cửa dừng, Công tắc cổ điển, Hộp điều khiển, Hộp điều khiển truyền
const CATEGORIES = [
  {
    id: "cat-cong-truot",
    label: "Cổng Trượt Tự Động",
    slug: "cong-truot-tu-dong",
    desc: "Hệ thống tự động hóa cổng trượt VDS Italy — động cơ CARRERA, AG-FUTURE, SIMPLY, AT PLUS cho cổng từ 600kg đến 5000kg. Phù hợp nhà dân, biệt thự, khu công nghiệp.",
    subs: ["Động cơ cổng trượt", "Bộ kit cổng trượt", "Thanh răng", "Phụ kiện cổng trượt"],
  },
  {
    id: "cat-cong-mo",
    label: "Cổng Mở Tự Động",
    slug: "cong-mo-tu-dong",
    desc: "Hệ thống tự động hóa cổng mở (cổng bản lề) VDS Italy — động cơ IBIS, EGO, PM1, UNDER-V cho cổng 1 và 2 cánh, lắp nổi hoặc âm sàn.",
    subs: ["Cánh tay đẩy cổng mở", "Kích tuyến tính", "Động cơ âm sàn", "Bộ kit cổng mở"],
  },
  {
    id: "cat-barrier",
    label: "Barrier & Bollard Tự Động",
    slug: "barrier-tu-dong",
    desc: "Barrier tự động VDS Italy — kiểm soát lưu lượng xe vào chung cư, bãi đỗ xe, khu công nghiệp. Cần chắn từ 3m đến 6m.",
    subs: ["Barrier bãi đỗ xe", "Barrier khu công nghiệp", "Bollard tự động"],
  },
  {
    id: "cat-cua-cuon",
    label: "Cửa Cuộn & Cửa Garage",
    slug: "cua-cuon-tu-dong",
    desc: "Hệ thống tự động hóa cửa cuộn VDS Italy — dành cho cửa hàng, nhà kho. Cửa garage UTILE cho nhà dân, biệt thự.",
    subs: ["Động cơ cửa cuộn", "Động cơ cửa garage", "Phụ kiện cửa cuộn"],
  },
  {
    id: "cat-cua-garage",
    label: "Cửa Trượt & Cổng Quay",
    slug: "cua-garage-tu-dong",
    desc: "Cửa trượt tự động SPEED PLUS và cổng quay người đi bộ RIKI-20 VDS Italy — nhanh, êm ái, an toàn.",
    subs: ["Cửa trượt tự động", "Cổng quay pedestrian"],
  },
  {
    id: "cat-phu-kien-vds",
    label: "Phụ Kiện VDS",
    slug: "phu-kien-dieu-khien-vds",
    desc: "Phụ kiện chính hãng VDS Italy: remote điều khiển, hộp điều khiển EURO, mắt thần an toàn, cảm biến, đèn nhấp nháy, công tắc, bộ chọn chìa khóa GALAXY.",
    subs: ["Hộp điều khiển", "Remote điều khiển", "Mắt thần an toàn", "Cảm biến & Công tắc", "Đèn báo hiệu", "Bộ chọn chìa khóa"],
  },
];

// ── SẢN PHẨM THẬT từ ảnh catalog ───────────────────────────────────────────
const REAL_PRODUCTS = [

  // ===== PHỤ KIỆN - Trang 1: Sản phẩm điều khiển =====

  // Hàng 1: KEY MB, TRON-2, CẦM BIẾN HAY TỪA, GALAXY-1
  {
    id: "prod-vds-key-mb",
    name: "Bộ chọn chìa khóa VDS KEY MB",
    slug: "bo-chon-chia-khoa-vds-key-mb",
    code: "VDS-KEY-MB",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Bộ chọn chìa khóa dạng nhúng KEY MB VDS dùng cho cổng tự động. Lắp đặt âm tường, chìa khóa bảo mật cao, chống nước IP54. Dùng để điều khiển mở/đóng cổng bằng chìa khóa.",
  },
  {
    id: "prod-vds-tron-2",
    name: "Công tắc cửa dừng VDS TRON-2",
    slug: "cong-tac-cua-dung-vds-tron-2",
    code: "VDS-TRON-2",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Công tắc giới hạn hành trình TRON-2 VDS dùng để xác định vị trí dừng cuối của cổng trượt hoặc cổng mở. Độ bền cao, lắp đặt đơn giản.",
  },
  {
    id: "prod-vds-galaxy-1",
    name: "Bộ chọn mã số VDS GALAXY-1 (1 nút)",
    slug: "bo-chon-ma-so-vds-galaxy-1",
    code: "VDS-GALAXY-1",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: true, isNew: false, isSale: false,
    desc: "Bộ chọn mã số GALAXY-1 VDS với 1 nút bấm. Kiểm soát truy cập bằng mã PIN, chống nước IP54, lắp ngoài trời. Tích hợp đèn nền, dễ nhìn ban đêm.",
  },

  // Hàng 2: MAXI LED, ECO-A, GALAXY-2
  {
    id: "prod-vds-maxi-led",
    name: "Đèn báo nhấp nháy VDS MAXI LED",
    slug: "den-bao-nhap-nhay-vds-maxi-led",
    code: "VDS-MAXI-LED",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: true, isNew: false, isSale: false,
    desc: "Đèn nhấp nháy LED MAXI VDS công suất cao, báo hiệu cổng đang hoạt động. Điện áp 12/24/230V, chống nước IP55, góc chiếu 360°, tầm nhìn xa đến 50m.",
  },
  {
    id: "prod-vds-eco-a",
    name: "Mắt thần an toàn VDS ECO-A",
    slug: "mat-than-an-toan-vds-eco-a",
    code: "VDS-ECO-A",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Một đôi mắt thần hồng ngoại ECO-A VDS dùng phát hiện chướng ngại vật khi cổng đóng. Tầm hoạt động đến 10m, điện áp 12/24V, chống nước IP55.",
  },
  {
    id: "prod-vds-galaxy-2",
    name: "Bộ chọn mã số VDS GALAXY-2 (2 nút)",
    slug: "bo-chon-ma-so-vds-galaxy-2",
    code: "VDS-GALAXY-2",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Bộ chọn mã số GALAXY-2 VDS với 2 nút bấm điều khiển độc lập. Quản lý 2 cổng riêng biệt, chống nước IP54, lắp ngoài trời.",
  },

  // Hàng 3: HE 50, MULTI-4, GALAXY-3
  {
    id: "prod-vds-he50",
    name: "Cảm biến vị trí VDS HE 50",
    slug: "cam-bien-vi-tri-vds-he-50",
    code: "VDS-HE50",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Cảm biến hiệu ứng Hall HE 50 VDS phát hiện vị trí cổng (mở/đóng hoàn toàn). Độ chính xác cao, lắp đặt dễ dàng lên motor cổng trượt và cổng mở.",
  },
  {
    id: "prod-vds-multi-4",
    name: "Remote điều khiển VDS MULTI-4 (4 kênh)",
    slug: "remote-dieu-khien-vds-multi-4",
    code: "VDS-MULTI-4",
    brand: "VDS Automation",
    warranty: "12 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: true, isNew: false, isSale: false,
    desc: "Remote điều khiển MULTI-4 VDS 4 kênh, điều khiển 4 thiết bị độc lập. Tần số 433.92 MHz, mã hóa rolling code, khoảng cách đến 100m.",
  },
  {
    id: "prod-vds-galaxy-3",
    name: "Bộ chọn mã số VDS GALAXY-3 (3 nút)",
    slug: "bo-chon-ma-so-vds-galaxy-3",
    code: "VDS-GALAXY-3",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Bộ chọn mã số GALAXY-3 VDS với 3 nút bấm điều khiển độc lập. Quản lý 3 thiết bị, chống nước IP54, đèn nền LED.",
  },

  // Hàng 4: TRONCH, P.A, GALAXY-4
  {
    id: "prod-vds-tronch",
    name: "Công tắc cổng dừng VDS TRONCH",
    slug: "cong-tac-cong-dung-vds-tronch",
    code: "VDS-TRONCH",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Công tắc giới hạn hành trình TRONCH VDS dạng đơn giản, lắp cho cổng trượt để xác định điểm dừng chính xác. Chống nước, độ bền cao.",
  },
  {
    id: "prod-vds-pa",
    name: "Nút nhấn điều khiển VDS P.A",
    slug: "nut-nhan-dieu-khien-vds-pa",
    code: "VDS-PA",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Nút nhấn điều khiển P.A VDS dùng để kích hoạt mở/đóng cổng từ bên trong. Lắp ở cột cổng hoặc tường, điện áp thấp an toàn.",
  },
  {
    id: "prod-vds-galaxy-4",
    name: "Bộ chọn mã số VDS GALAXY-4 (4 nút)",
    slug: "bo-chon-ma-so-vds-galaxy-4",
    code: "VDS-GALAXY-4",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Bộ chọn mã số GALAXY-4 VDS với 4 nút bấm. Điều khiển 4 thiết bị độc lập hoặc kết hợp, chống nước IP54, lắp ngoài trời.",
  },

  // ===== PHỤ KIỆN - Trang 2: Hộp điều khiển =====

  // Hàng 1: MA 1U, EURO 230 M1, MẠCH ĐIỀU KHIỂN, EURO 230 ME
  {
    id: "prod-vds-ma1u",
    name: "Ray nối VDS MA 1U (110mm)",
    slug: "ray-noi-vds-ma-1u-110mm",
    code: "VDS-MA1U",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Thanh ray nối MA 1U VDS dài 110mm dùng để lắp rack thanh răng nylon cho cổng trượt. Thép mạ kẽm chống gỉ, độ bền cao.",
  },
  {
    id: "prod-vds-euro-230-m1",
    name: "Hộp điều khiển VDS EURO 230 M1",
    slug: "hop-dieu-khien-vds-euro-230-m1",
    code: "VDS-EURO-230-M1",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: true, isNew: false, isSale: false,
    desc: "Hộp điều khiển EURO 230 M1 VDS dùng cho 1 motor cổng trượt hoặc cổng mở 230V. Tích hợp bộ nhận sóng radio, bảo vệ quá tải, điều chỉnh tốc độ và lực đóng mở.",
  },
  {
    id: "prod-vds-euro-230-me",
    name: "Bo mạch điều khiển VDS EURO 230 ME",
    slug: "bo-mach-dieu-khien-vds-euro-230-me",
    code: "VDS-EURO-230-ME",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Bo mạch điều khiển EURO 230 ME VDS dạng không có vỏ hộp, dùng cho 1 motor cổng trượt hoặc cổng mở 230V. Tiết kiệm không gian lắp đặt.",
  },

  // Hàng 2: MA 2U, EURO 24 M1, ELR 4 ME
  {
    id: "prod-vds-ma2u",
    name: "Ray nối VDS MA 2U (225mm)",
    slug: "ray-noi-vds-ma-2u-225mm",
    code: "VDS-MA2U",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Thanh ray nối MA 2U VDS dài 225mm dùng để lắp thanh răng nylon cho cổng trượt. Thép mạ kẽm, chịu tải tốt.",
  },
  {
    id: "prod-vds-euro-24-m1",
    name: "Hộp điều khiển VDS EURO 24 M1",
    slug: "hop-dieu-khien-vds-euro-24-m1",
    code: "VDS-EURO-24-M1",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Hộp điều khiển EURO 24 M1 VDS dùng cho motor cổng 24V DC. Phù hợp với hệ thống cổng có nguồn điện 24V, bảo vệ quá tải, điều chỉnh tốc độ.",
  },
  {
    id: "prod-vds-elr4-me",
    name: "Bo mạch điều khiển VDS ELR 4 ME",
    slug: "bo-mach-dieu-khien-vds-elr4-me",
    code: "VDS-ELR4-ME",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Bo mạch điều khiển ELR 4 ME VDS dùng cho 2 motor cổng mở (1 cặp cánh), 230V. Điều khiển đồng bộ 2 motor, hẹn giờ đóng tự động.",
  },

  // Hàng 3: TEZ-2, TELESCOPIC, BP 2402, MINI
  {
    id: "prod-vds-tez2",
    name: "Công tắc giới hạn VDS TEZ-2",
    slug: "cong-tac-gioi-han-vds-tez-2",
    code: "VDS-TEZ2",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Công tắc giới hạn hành trình TEZ-2 VDS với đầu tiếp xúc dạng cần gạt. Xác định điểm dừng cổng trượt chính xác, chịu lực tốt.",
  },
  {
    id: "prod-vds-telescopic",
    name: "Anten kéo dài VDS TELESCOPIC",
    slug: "anten-keo-dai-vds-telescopic",
    code: "VDS-TELESCOPIC",
    brand: "VDS Automation",
    warranty: "12 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Anten thu sóng radio dạng kéo dài TELESCOPIC VDS, tăng cường khả năng thu tín hiệu từ remote. Lắp ngoài hộp điều khiển, tần số 433.92 MHz.",
  },
  {
    id: "prod-vds-bp2402",
    name: "Pin dự phòng VDS BP 2402",
    slug: "pin-du-phong-vds-bp-2402",
    code: "VDS-BP2402",
    brand: "VDS Automation",
    warranty: "12 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Pin dự phòng BP 2402 VDS 24V dành cho hệ thống cổng tự động hoạt động khi mất điện. Dung lượng đủ cho 10-20 lần đóng mở, sạc tự động.",
  },
  {
    id: "prod-vds-mini",
    name: "Hộp điều khiển VDS MINI",
    slug: "hop-dieu-khien-vds-mini",
    code: "VDS-MINI",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Hộp điều khiển MINI VDS kích thước nhỏ gọn dành cho cổng mở đơn giản. Tích hợp bộ nhận sóng, bảo vệ quá tải, lắp đặt nhanh.",
  },

  // Hàng 4: TSL, BI POLAIRE, BP 2502
  {
    id: "prod-vds-tsl",
    name: "Công tắc từ VDS TSL",
    slug: "cong-tac-tu-vds-tsl",
    code: "VDS-TSL",
    brand: "VDS Automation",
    warranty: "24 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Công tắc từ TSL VDS dùng phát hiện vị trí cổng không tiếp xúc. Độ bền cao hơn công tắc cơ học, không mài mòn theo thời gian.",
  },
  {
    id: "prod-vds-bi-polaire",
    name: "Anten song cực VDS BI POLAIRE",
    slug: "anten-song-cuc-vds-bi-polaire",
    code: "VDS-BI-POLAIRE",
    brand: "VDS Automation",
    warranty: "12 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Anten song cực BI POLAIRE VDS tăng cường thu sóng radio 360°. Lắp ngoài trời, chống nước, tối ưu cho vùng tín hiệu yếu.",
  },
  {
    id: "prod-vds-bp2502",
    name: "Pin dự phòng VDS BP 2502",
    slug: "pin-du-phong-vds-bp-2502",
    code: "VDS-BP2502",
    brand: "VDS Automation",
    warranty: "12 tháng",
    price: "Liên hệ",
    catId: "cat-phu-kien-vds",
    isBestseller: false, isNew: false, isSale: false,
    desc: "Pin dự phòng BP 2502 VDS 24V dung lượng lớn hơn BP 2402, dành cho hệ thống cổng sử dụng nhiều. Sạc tự động, hoạt động liên tục khi mất điện.",
  },
];

async function main() {
  console.log("\n=== CẬP NHẬT CATEGORIES ===");
  for (const cat of CATEGORIES) {
    const entry = await upsertEntry(cat.id, "category", {
      label:         bi(cat.label),
      slug:          bi(cat.slug),
      description:   bi(cat.desc),
      subcategories: bi(cat.subs),
    });
    if (entry) await publishEntry(cat.id);
  }

  console.log("\n=== XÓA SẢN PHẨM CŨ ===");
  for (const id of OLD_PRODUCTS) await deleteEntry(id);

  console.log("\n=== SEED SẢN PHẨM THẬT ===");
  for (const p of REAL_PRODUCTS) {
    const fields = {
      name:         bi(p.name),
      slug:         bi(p.slug),
      code:         bi(p.code),
      brand:        bi(p.brand),
      warranty:     bi(p.warranty),
      price:        bi(p.price),
      description:  bi(p.desc),
      category:     bi({ sys: { type: "Link", linkType: "Entry", id: p.catId } }),
      isBestseller: bi(p.isBestseller),
      isNew:        bi(p.isNew),
      isSale:       bi(p.isSale),
    };
    const entry = await upsertEntry(p.id, "product", fields);
    if (entry) await publishEntry(p.id);
  }

  // Kiểm tra kết quả
  const r = await fetch(`${BASE}/entries?content_type=product&limit=100`, { headers: AUTH });
  const data = await r.json();
  console.log(`\n=== TỔNG KẾT: ${data.total} sản phẩm ===`);
}

main().catch(console.error);
