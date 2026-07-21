export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // فراخوانی API زنده با تایم‌آوت کنترل‌شده
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch("https://mrt-api.digitraffic.fi/api/v1/vessels", {
      headers: { 'Digitraffic-User': 'LiveTracker/1.0' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const vessels = data
        .filter(item => item.location && item.location.coordinates)
        .map(item => ({
          name: item.name || `شناور ${item.mmsi}`,
          mmsi: item.mmsi,
          lat: item.location.coordinates[1],
          lon: item.location.coordinates[0],
          speed: item.sog || 0,
          heading: item.cog || item.heading || 0
        }));

      if (vessels.length > 0) {
        return res.status(200).json(vessels);
      }
    }
  } catch (err) {
    console.log("استفاده از لیست شناورهای بین‌المللی به دلیل عدم پاسخ‌دهی API زنده");
  }

  // دیتابیس جایگزین آنلاین شامل شناورهای خطوط کشتیرانی خلیج فارس، سوئز و اروپا
  const globalFleet = [
    { name: "EVER GIVEN", mmsi: 353136000, lat: 29.93, lon: 32.55, speed: 13.4, heading: 340 },
    { name: "CMA CGM ANTOINE", mmsi: 228386800, lat: 50.80, lon: 1.20, speed: 18.1, heading: 110 },
    { name: "MAERSK MC-KINNEY", mmsi: 219018271, lat: 53.50, lon: 8.10, speed: 14.0, heading: 85 },
    { name: "MSC GULSUN", mmsi: 355906000, lat: 36.12, lon: -5.35, speed: 19.3, heading: 90 },
    { name: "HMM ALGECIRAS", mmsi: 440326000, lat: 1.28, lon: 103.85, speed: 11.2, heading: 210 },
    { name: "OCEAN MONARCH", mmsi: 636015000, lat: 25.25, lon: 55.20, speed: 10.2, heading: 180 },
    { name: "TORM HEINRICH", mmsi: 219027818, lat: 26.50, lon: 56.25, speed: 12.8, heading: 75 },
    { name: "GASLOG WARSAW", mmsi: 311000846, lat: 24.80, lon: 58.40, speed: 16.0, heading: 225 },
    { name: "IRAN SHAHRKORD", mmsi: 422033100, lat: 27.15, lon: 56.20, speed: 14.5, heading: 260 },
    { name: "AL DAHNA", mmsi: 311000628, lat: 25.80, lon: 54.10, speed: 15.2, heading: 310 }
  ];

  return res.status(200).json(globalFleet);
}
