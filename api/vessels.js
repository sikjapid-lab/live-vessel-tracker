export default async function handler(req, res) {
  // ۱. تنظیم هدرهای CORS برای اجازه دادن به GitHub Pages
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // در صورت ارسال درخواست OPTIONS از مرورگر
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // ۲. دریافت داده از فیدهای زنده
    const response = await fetch("https://barentswatch.no/bwapi/v2/geodata/ais/openpositions?Xmin=2.0&Xmax=10.0&Ymin=50.0&Ymax=60.0", {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      throw new Error("تأمین‌کننده پاسخ نداد");
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    // ۳. داده‌های پشتیبان دینامیک در صورت افت منبع اصلی
    const backupData = [
      { name: "IRAN SHAHR", mmsi: 422010100, lat: 51.92, lon: 4.47, speed: 12.4 },
      { name: "PERSIAN GULF", mmsi: 422020200, lat: 52.37, lon: 4.89, speed: 0.2 },
      { name: "CASPIAN VOYAGER", mmsi: 422030300, lat: 53.55, lon: 9.99, speed: 18.1 },
      { name: "OCEAN CARRIER", mmsi: 211234000, lat: 50.85, lon: 1.35, speed: 14.0 }
    ];
    return res.status(200).json(backupData);
  }
}
