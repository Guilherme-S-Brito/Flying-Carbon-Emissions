        // Load Google Charts packages for corechart (both bar and pie charts)
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

        function toRadians(deg) { return deg * (Math.PI / 180); }

        function calculateDistance(coord1, coord2) {
            const R = 6371.2;
            const dLat = toRadians(coord2.lat - coord1.lat);
            const dLon = toRadians(coord2.lon - coord1.lon);
            const lat1 = toRadians(coord1.lat);
            const lat2 = toRadians(coord2.lat);

            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1) * Math.cos(lat2) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return (R * c);
        }

        function convertLatLonToCanvas({ lat, lon }) {
            const x = ((lon + 180) * (canvas.width / 360));
            const y = ((90 - lat) * (canvas.height / 180));
            return { x, y };
        }

        const aircraftCategories = {
		
            "Piston": { seats: 9, maxRange: 1000, fuelBurn: dist => 40 + 0.16 * dist },
            "Turboprop": { seats: 70, maxRange: 2000, fuelBurn: dist => 300 + 0.85 * dist },
            "Regional Jet": { seats: 100, maxRange: 3500, fuelBurn: dist => 1000 + 0.8 * dist },
            "Narrow-body Jet": { seats: 180, maxRange: 6000, fuelBurn: dist => 4500 + 8.52 * dist },
			"Wide-body Jet": { seats: 250, maxRange: 17000, fuelBurn: dist => 6000 + 9.00 * dist }
        };

        const canvas = document.getElementById("myCanvas");
        const ctx = canvas.getContext("2d");
        const mapImage = new Image();
        mapImage.src = 'assets/images/1280px-Equirectangular_projection_SW.jpg';
        mapImage.onload = function() { ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height); };

        function calculateCO2Emissions(fuelBurn) { return fuelBurn * 3.16; }
        function calculatePerPassenger(fuelBurn, co2Emissions, seats) {
            const fuelBurnPerPassenger = fuelBurn / seats;
            const co2PerPassenger = co2Emissions / seats;
            return { fuelBurnPerPassenger, co2PerPassenger };
        }

        function displayAircraftSuitability(distance) {
            let suitableAircraftInfo = "Suitable Aircraft Categories:<br>";
            let emissionsInfo = "";
            const averageCO2PerYear = 7200;
            let hasSuitableAircraft = false;

            for (const [category, data] of Object.entries(aircraftCategories)) {
                if (distance <= data.maxRange) {
                    hasSuitableAircraft = true;
                    suitableAircraftInfo += `${category}: Seats = ${data.seats}, Max Range = ${data.maxRange} km<br>`;
                    const fuelBurn = data.fuelBurn(distance).toFixed(2);
                    const co2Emissions = calculateCO2Emissions(fuelBurn).toFixed(2);
                    const perPassenger = calculatePerPassenger(fuelBurn, co2Emissions, data.seats);

                    const percentageOfAnnualQuota = ((perPassenger.co2PerPassenger / averageCO2PerYear) * 100).toFixed(2);
                    emissionsInfo += `${category} fuel burn for ${distance} km: ${fuelBurn} kg, CO₂: ${co2Emissions} kg<br>`;
                    emissionsInfo += `Per passenger: Fuel Burn = ${perPassenger.fuelBurnPerPassenger.toFixed(2)} kg, CO₂ = ${perPassenger.co2PerPassenger.toFixed(2)} kg<br>`;
                    emissionsInfo += `This flight uses ${percentageOfAnnualQuota}% of the average European's annual CO₂ emissions.<br><br>`;
                    
                    // Render charts
                    drawBarChart(perPassenger.fuelBurnPerPassenger, perPassenger.co2PerPassenger);
                    drawPieChart(percentageOfAnnualQuota);
                }
            }

            if (!hasSuitableAircraft) {
                suitableAircraftInfo = "No aircraft has the range to fly the route directly.";
                emissionsInfo = "No emissions available.";
            }

            document.getElementById("aircraft-info").innerHTML = suitableAircraftInfo + "<br>" + emissionsInfo;
        }

        function drawBarChart(fuelBurnPerPassenger, co2PerPassenger) {
            google.charts.setOnLoadCallback(() => {
                const data = google.visualization.arrayToDataTable([
                    ['Category', 'Amount (kg)'],
                    ['Fuel Burn per Passenger', fuelBurnPerPassenger],
                    ['CO₂ Emissions per Passenger', co2PerPassenger]
                ]);

                const options = {
                    title: 'Fuel Burn and CO₂ Emissions per Passenger',
                    bars: 'vertical',
                    hAxis: { title: 'Category' },
                    vAxis: { title: 'Amount (kg)' },
                    colors: ['#4CAF50', '#FF5733']
                };

                const chart = new google.visualization.ColumnChart(document.getElementById('bar-chart'));
                chart.draw(data, options);
            });
        }

        function drawPieChart(percentageOfAnnualQuota) {
            google.charts.setOnLoadCallback(() => {
                const data = google.visualization.arrayToDataTable([
                    ['Category', 'Percentage'],
                    ['CO₂ Used by Flight', parseFloat(percentageOfAnnualQuota)],
                    ['Remaining Annual CO₂ Quota', 100 - parseFloat(percentageOfAnnualQuota)]
                ]);

                const options = {
                    title: 'CO₂ Quota Consumption',
                    is3D: true,
                    slices: { 0: { offset: 0.2, color: '#FF5733' }, 1: { color: '#D3D3D3' } }
                };

                const chart = new google.visualization.PieChart(document.getElementById('pie-chart'));
                chart.draw(data, options);
            });
        }

        function displayMap() {
            const departureCode = document.getElementById("departure-airport").value;
            const arrivalCode = document.getElementById("arrival-airport").value;
            document.getElementById("error-message").textContent = "";
            document.getElementById("aircraft-info").textContent = "";

            if (departureCode === arrivalCode) {
                document.getElementById("error-message").textContent = "Error: Departure and arrival airports cannot be the same.";
                return;
            }

            if (departureCode && arrivalCode) {
                const departureCoords = airportCoordinates[departureCode];
                const arrivalCoords = airportCoordinates[arrivalCode];
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);

                const depCanvasCoords = convertLatLonToCanvas(departureCoords);
                const arrCanvasCoords = convertLatLonToCanvas(arrivalCoords);

                drawLine(depCanvasCoords, arrCanvasCoords);
                drawDot(depCanvasCoords, "green");
                drawDot(arrCanvasCoords, "red");

                const distanceKm = Math.round(calculateDistance(departureCoords, arrivalCoords));
                displayAircraftSuitability(distanceKm);
            } else {
                document.getElementById("error-message").textContent = "Please select both departure and arrival airports.";
            }
        }

        function drawDot(coords, color) {
            ctx.beginPath();
            ctx.arc(coords.x, coords.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.stroke();
        }

        function drawLine(start, end) {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.stroke();
        }