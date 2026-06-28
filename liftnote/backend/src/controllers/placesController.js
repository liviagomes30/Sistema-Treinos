const placesService = require("../services/placesService");

const searchGyms = async (req, res, next) => {
  try {
    const { lat, lng, city } = req.query;
    const apiKey = placesService.requireGeoapifyApiKey();

    let latitude, longitude;

    if (lat && lng) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lng);
    } else if (city) {
      const coords = await placesService.geocodeCity(city, apiKey);
      latitude = coords.lat;
      longitude = coords.lng;
    } else {
      return res.status(400).json({ message: "Forneça lat/lng ou city" });
    }

    const features = await placesService.searchNearbyGyms(latitude, longitude, apiKey);
    const gyms = features
      .filter((f) => f.properties?.name)
      .map(placesService.formatGymResult);

    res.json({ data: gyms });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchGyms };
