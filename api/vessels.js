export default async function handler(req, res) {
  // ۱. تنظیم هدرهای CORS برای دسترسی کامل
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // ۲. دریافت داده واقعی و زنده هزاران شناور از API رایگان و عمومی DigiTraffic
    const response = await fetch("https://mrt-api.digitraffic.fi/api/v1/vessels", {
      headers: {
        'Digitraffic-User': 'LiveVesselTracker/1.0',
        'Accept-Encoding': 'gzip'
      }
    });

    if (!response.ok) {
      throw new Error(`DigiTraffic HTTP Error: ${response.status}`);
    }

    const rawData = await response.json();
    
    // ۳. مپ کردن ساختار داده‌ها به ساختاری که فرانت‌اند شما می‌شناسد
    const vessels = [];
    
    if (Array.isArray(rawData)) {
      rawData.forEach(item => {
        // چک کردن وجود مختصات مکانی
        if (item.location && item.location.coordinates) {
          const lon = item.location.coordinates[0];
          const lat = item.location.coordinates[1];
          
          vessels.push({
            name: item.name || `Vessel ${item.mmsi}`,
            mmsi: item.mmsi,
            lat: lat,
            lon: lon,
            speed: item.sog || 0, // Speed Over Ground
            heading: item.cog || item.heading || 0 // Course Over Ground
          });
        }
      });
    }

    // ارسال داده‌های واقعی شناورها به فرانت‌اند
    return res.status(200).json(vessels);

  } catch (error) {
    console.error("API Error:", error);
    // داده‌های fallback فقط در صورت قطع کامل اینترنت یا سرور
    return res.status(500).json({ error: "Failed to fetch live AIS stream" });
  }
}
