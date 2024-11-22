        // Coordinates of each airport by IATA code
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

        function toRadians(deg) {
            return deg * (Math.PI / 180);
        }

        // Calculate the great-circle distance between two airports using their coordinate points using Haversine formula
		
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
			
            return (R * c); // Distance in kilometers
        }

        
		// Convert lat/lon to canvas coordinates
        function convertLatLonToCanvas({ lat, lon }) {
		
            const x = ((lon + 180) * (canvas.width / 360));
            const y = ((90 - lat) * (canvas.height / 180));
			
            return { x, y };
        }

        // Updated aircraft categories with seating capacity, max range, and fuel burn formulas
        const aircraftCategories = {
		
            "Piston": { seats: 9, maxRange: 1000, fuelBurn: dist => 40 + 0.16 * dist },
            "Turboprop": { seats: 70, maxRange: 2000, fuelBurn: dist => 300 + 0.85 * dist },
            "Regional Jet": { seats: 100, maxRange: 3500, fuelBurn: dist => 1000 + 0.8 * dist },
            "Narrow-body Jet": { seats: 180, maxRange: 6000, fuelBurn: dist => 4500 + 8.52 * dist },
			"Wide-body Jet": { seats: 250, maxRange: 17000, fuelBurn: dist => 6000 + 9.00 * dist }
        };

        // Canvas setup
        const canvas = document.getElementById("myCanvas");
        const ctx = canvas.getContext("2d");

        // Load the map image with the specified route
        const mapImage = new Image();
        mapImage.src = 'assets/images/1280px-Equirectangular_projection_SW.jpg';

        mapImage.onload = function() {
            ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
        };
     

function displayAircraftSuitability(distance) {
    let suitableAircraftInfo = "Suitable Aircraft Categories:<br>";
    let emissionsInfo = "";

    const averageCO2PerYear = 7200; // Average European CO₂ emissions per year in kg
    let hasSuitableAircraft = false;

    for (const [category, data] of Object.entries(aircraftCategories)) {
        if (distance <= data.maxRange) {
            hasSuitableAircraft = true;
            suitableAircraftInfo += `${category}: Seats = ${data.seats}, Max Range = ${data.maxRange} km<br>`;

            const fuelBurn = data.fuelBurn(distance).toFixed(2);
            const co2Emissions = calculateCO2Emissions(fuelBurn).toFixed(2);
            const perPassenger = calculatePerPassenger(fuelBurn, co2Emissions, data.seats);

            // Calculate percentage of annual CO₂ quota used by one passenger on this flight
            const percentageOfAnnualQuota = ((perPassenger.co2PerPassenger / averageCO2PerYear) * 100).toFixed(2);

            emissionsInfo += `${category} fuel burn for ${distance} km: ${fuelBurn} kg, CO₂: ${co2Emissions} kg <br>`;
            emissionsInfo += `Per passenger: Fuel Burn = ${perPassenger.fuelBurnPerPassenger.toFixed(2)} kg, CO₂ = ${perPassenger.co2PerPassenger.toFixed(2)} kg<br>`;
            emissionsInfo += `This flight uses ${percentageOfAnnualQuota}% of the average European's annual CO₂ emissions.<br><br>`;
        }
    }

    if (!hasSuitableAircraft) {
        suitableAircraftInfo = "No aircraft has the range to fly the route directly.";
        emissionsInfo = "No emissions available.";
    }

    // Display the suitability and emissions info, including the annual CO₂ comparison
    document.getElementById("aircraft-info").innerHTML = suitableAircraftInfo + "<br>" + emissionsInfo;
}


        // Calculate CO2 emissions based on fuel burn
		
        function calculateCO2Emissions(fuelBurn) {
		
            return fuelBurn * 3.16; // CO2 emissions in kg
			
        }

        // Calculate per passenger fuel burn and CO2 emissions
        function calculatePerPassenger(fuelBurn, co2Emissions, seats) {
		
            const fuelBurnPerPassenger = fuelBurn / seats;
			
            const co2PerPassenger = co2Emissions / seats;
			
            return { fuelBurnPerPassenger, co2PerPassenger };
        }


        // Draw airport code label with background next to each point
		
        function drawLabel({ x, y }, label, color) {
            ctx.font = "14px Arial";
            const textWidth = ctx.measureText(label).width;
            const padding = 4;
            const textHeight = 16;

            // Draw white background for label
            ctx.fillStyle = "white";
            ctx.fillRect(x + 8 - padding, y - 8 - textHeight, textWidth + padding * 2, textHeight + padding);

            // Draw label text
            ctx.fillStyle = color;
            ctx.fillText(label, x + 8, y - 8);
        }

        // Draw line between two points on canvas
        function drawLine(p1, p2) {
		
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw dot on canvas
        function drawDot({ x, y }, color) {
		
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
        }

        // Draw the distance label at the midpoint of the line
        function drawDistanceLabel(p1, p2, distance) {
		
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            const padding = 5;
            ctx.font = "14px Arial";
            const text = `${distance} km`;
            const textWidth = ctx.measureText(text).width;
            const textHeight = 16;

            // Draw background rectangle for distance label
            ctx.fillStyle = "yellow";
            ctx.fillRect(midX - textWidth / 2 - padding, midY - textHeight / 2 - padding, textWidth + padding * 2, textHeight + padding);

            // Draw the distance text
            ctx.fillStyle = "black";
            ctx.fillText(text, midX - textWidth / 2, midY + textHeight / 4);
        }

function displayMap() {
            
			const departureCode = document.getElementById("departure-airport").value;
            const arrivalCode = document.getElementById("arrival-airport").value;

            // Clear any previous error message and aircraft info
            document.getElementById("error-message").textContent = "";
            document.getElementById("aircraft-info").textContent = "";

            // Check if the departure and arrival airports are the same
            if (departureCode === arrivalCode) {
                document.getElementById("error-message").textContent = "Error: Departure and arrival airports cannot be the same.";
                return;
            }

            if (departureCode && arrivalCode) {
			
                const departureCoords = airportCoordinates[departureCode];
                const arrivalCoords = airportCoordinates[arrivalCode];

                // Clear canvas and redraw map
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);

                // Convert lat/lon to canvas coordinates (simplified)
                const depCanvasCoords = convertLatLonToCanvas(departureCoords);
                const arrCanvasCoords = convertLatLonToCanvas(arrivalCoords);

                // Draw points, labels, and line on map
                drawLine(depCanvasCoords, arrCanvasCoords);
				drawDot(depCanvasCoords, "green");
                drawLabel(depCanvasCoords, `Origin: ${departureCode}`, "green");
                drawDot(arrCanvasCoords, "red");
                drawLabel(arrCanvasCoords, `Destination: ${arrivalCode}`, "red");
                

                // Calculate and display distance
                const distanceKm = Math.round(calculateDistance(departureCoords, arrivalCoords));
                drawDistanceLabel(depCanvasCoords, arrCanvasCoords, distanceKm);

                // Check for suitable aircraft, calculate fuel burn, and CO2 emissions
                displayAircraftSuitability(distanceKm);
				
            } else {
                alert("Please select both a departure and an arrival airport.");
            }
        }
