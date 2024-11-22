
// Coordinates of each airport by IATA code
const airportCoordinates = {
    ATL: { lat: 33.6407, lon: -84.4277 },
    GRU: { lat: -23.4356, lon: -46.4731 },
    DEN: { lat: 39.8561, lon: -104.6737 },
    JNB: { lat: -26.1369, lon: 28.246 },
    LAX: { lat: 33.9416, lon: -118.4085 },
    PEK: { lat: 40.0799, lon: 116.6031 },
    DXB: { lat: 25.2532, lon: 55.3657 },
    LHR: { lat: 51.4700, lon: -0.4543 },
    SYD: { lat: -33.9399, lon: 151.1753 },
    CDG: { lat: 49.0097, lon: 2.5479 }
};

// Canvas setup
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Load the map image (replace this path with your map file path)
const mapImage = new Image();
mapImage.src = 'C:/Users/guilh/Desktop/1280px-Equirectangular_projection_SW.jpg'; // Replace with actual map image path

mapImage.onload = function() {
    ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
};

function displayMap() {
    const departureCode = document.getElementById("departure-airport").value;
    const arrivalCode = document.getElementById("arrival-airport").value;

    if (departureCode && arrivalCode) {
        const departureCoords = airportCoordinates[departureCode];
        const arrivalCoords = airportCoordinates[arrivalCode];

        // Clear canvas and redraw map
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);

        // Convert lat/lon to canvas coordinates (simplified)
        const depCanvasCoords = convertLatLonToCanvas(departureCoords);
        const arrCanvasCoords = convertLatLonToCanvas(arrivalCoords);

        // Draw points and line on map
        drawDot(depCanvasCoords, "green");
        drawDot(arrCanvasCoords, "red");
        drawLine(depCanvasCoords, arrCanvasCoords);

        // Calculate and display distance
        const distanceKm = calculateDistance(departureCoords, arrivalCoords);
        document.getElementById("distance-display").textContent = `Distance: ${distanceKm} km`;
    } else {
        alert("Please select both a departure and an arrival airport.");
    }
}

// Convert lat/lon to canvas coordinates
function convertLatLonToCanvas({ lat, lon }) {
    // Simplified equirectangular projection for demonstration purposes
    const x = ((lon + 180) * (canvas.width / 360));
    const y = ((90 - lat) * (canvas.height / 180));
    return { x, y };
}

// Draw dots on canvas
function drawDot({ x, y }, color) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

// Draw line between two airports on canvas
function drawLine(p1, p2) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Calculate the great-circle distance between two airports coordinates lat/lon points using Haversine formula

function calculateDistance(coord1, coord2) {
    const R = 6371.2; // Earth radius in kilometers
    const dLat = toRadians(coord2.lat - coord1.lat);
    const dLon = toRadians(coord2.lon - coord1.lon);
    const lat1 = toRadians(coord1.lat);
    const lat2 = toRadians(coord2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2); // Distance in kilometers
}

function toRadians(deg) {
    return deg * (Math.PI / 180);
}
