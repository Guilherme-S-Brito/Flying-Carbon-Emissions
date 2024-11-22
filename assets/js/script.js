const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const mapImage = new Image();
mapImage.src = 'assets/images/1280px-Equirectangular_projection_SW.jpg';
mapImage.onload = function() {
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
};

google.charts.load('current', { 'packages': ['corechart'] });

const airportCoordinates = {
    ATL: {lat: 33.6407, lon: -84.4277},
    GRU: {lat: -23.4356, lon: -46.4731},
    DEN: {lat: 39.8561, lon: -104.6737},
    JNB: {lat: -26.1369, lon: 28.246},
    LAX: {lat: 33.9416, lon: -118.4085},
    PEK: {lat: 40.0799, lon: 116.6031},
    DXB: {lat: 25.2532, lon: 55.3657},
    LHR: {lat: 51.4700, lon: -0.4543},
    SYD: {lat: -33.9399, lon: 151.1753},
    CDG: {lat: 49.0097, lon: 2.5479}
};

/**
 * Converts degrees to radians.
 * @param {number} deg - Degrees to be converted to radians.
 * @returns {number} Radians.
 */
function toRadians(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Calculates the great-circle distance between two coordinates using the Haversine formula.
 * @param {Object} coord1 - The latitude and longitude of the first point.
 * @param {Object} coord2 - The latitude and longitude of the second point.
 * @returns {number} Distance in kilometers.
 */
function calculateDistance(coord1, coord2) {
    const R = 6371.2;
    const dLat = toRadians(coord2.lat - coord1.lat);
    const dLon = toRadians(coord2.lon - coord1.lon);
    const lat1 = toRadians(coord1.lat);
    const lat2 = toRadians(coord2.lat);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Displays the map, routes, and distance between selected airports.
 */
function displayMap() {
    const departureCode = document.getElementById("departure-airport").value;
    const arrivalCode = document.getElementById("arrival-airport").value;

    document.getElementById("error-message").textContent = "";
    document.getElementById("aircraft-info").textContent = "";

    // Validation for input selection
    if (!departureCode || !arrivalCode) {
        document.getElementById("error-message").textContent = "Please select both departure and arrival airports.";
        return;
    }

    if (departureCode === arrivalCode) {
        document.getElementById("error-message").textContent = "Departure and arrival airports cannot be the same.";
        return;
    }

    const departureCoords = airportCoordinates[departureCode];
    const arrivalCoords = airportCoordinates[arrivalCode];

    // Clear canvas and redraw map
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);

    const depCanvasCoords = {
        x: ((departureCoords.lon + 180) * (canvas.width / 360)),
        y: ((90 - departureCoords.lat) * (canvas.height / 180))
    };
    const arrCanvasCoords = {
        x: ((arrivalCoords.lon + 180) * (canvas.width / 360)),
        y: ((90 - arrivalCoords.lat) * (canvas.height / 180))
    };

    // Draw line and dots for route
    ctx.beginPath();
    ctx.moveTo(depCanvasCoords.x, depCanvasCoords.y);
    ctx.lineTo(arrCanvasCoords.x, arrCanvasCoords.y);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(depCanvasCoords.x, depCanvasCoords.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(arrCanvasCoords.x, arrCanvasCoords.y, 5, 0, 2 * Math.PI);
    ctx.fill();
}
