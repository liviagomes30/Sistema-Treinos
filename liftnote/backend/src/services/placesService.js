const AppError = require("../utils/AppError");

const GEOAPIFY_BASE = "https://api.geoapify.com";

function requireGeoapifyApiKey() {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) throw new AppError("Geoapify API não configurada", 503);
  return apiKey;
}

async function geocodeCity(city, apiKey) {
  const url = `${GEOAPIFY_BASE}/v1/geocode/search?text=${encodeURIComponent(city)}&format=json&limit=1&apiKey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || !data.results?.length) {
    throw new AppError(`Cidade "${city}" não encontrada`, 404);
  }

  return { lat: data.results[0].lat, lng: data.results[0].lon };
}

async function searchNearbyGyms(lat, lng, apiKey) {
  const url =
    `${GEOAPIFY_BASE}/v2/places` +
    `?categories=sport.fitness` +
    `&filter=circle:${lng},${lat},5000` +
    `&bias=proximity:${lng},${lat}` +
    `&limit=20` +
    `&apiKey=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new AppError(data.message || "Erro na API Geoapify", response.status);
  }

  return data.features || [];
}

function formatGymResult(feature) {
  const p = feature.properties;
  const lat = feature.geometry?.coordinates?.[1] ?? p.lat;
  const lng = feature.geometry?.coordinates?.[0] ?? p.lon;
  return {
    id: p.place_id,
    name: p.name,
    address: p.formatted || p.address_line2 || "",
    mapsUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`,
  };
}

module.exports = { requireGeoapifyApiKey, geocodeCity, searchNearbyGyms, formatGymResult };
