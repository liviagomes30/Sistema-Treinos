const GEOAPIFY_BASE = "https://api.geoapify.com";

const searchGyms = async (req, res, next) => {
  try {
    const { lat, lng, city } = req.query;
    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
      return res.status(503).json({ message: "Geoapify API não configurada" });
    }

    let latitude, longitude;

    if (lat && lng) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lng);
    } else if (city) {
      const geoUrl = `${GEOAPIFY_BASE}/v1/geocode/search?text=${encodeURIComponent(city)}&format=json&limit=1&apiKey=${apiKey}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (!geoRes.ok || !geoData.results?.length) {
        return res.status(404).json({ message: `Cidade "${city}" não encontrada` });
      }

      latitude = geoData.results[0].lat;
      longitude = geoData.results[0].lon;
    } else {
      return res.status(400).json({ message: "Forneça lat/lng ou city" });
    }

    // Geoapify usa lon,lat (longitude primeiro)
    const placesUrl =
      `${GEOAPIFY_BASE}/v2/places` +
      `?categories=sport.fitness` +
      `&filter=circle:${longitude},${latitude},5000` +
      `&bias=proximity:${longitude},${latitude}` +
      `&limit=20` +
      `&apiKey=${apiKey}`;

    const placesRes = await fetch(placesUrl);
    const placesData = await placesRes.json();

    if (!placesRes.ok) {
      return res
        .status(placesRes.status)
        .json({ message: placesData.message || "Erro na API Geoapify" });
    }

    const gyms = (placesData.features || [])
      .filter((f) => f.properties?.name)
      .map((f) => {
        const p = f.properties;
        const featLat = f.geometry?.coordinates?.[1] ?? p.lat;
        const featLon = f.geometry?.coordinates?.[0] ?? p.lon;
        return {
          id: p.place_id,
          name: p.name,
          address: p.formatted || p.address_line2 || "",
          mapsUrl: `https://www.openstreetmap.org/?mlat=${featLat}&mlon=${featLon}#map=17/${featLat}/${featLon}`,
        };
      });

    res.json({ data: gyms });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchGyms };
