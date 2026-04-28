const dataset = {
  "Hyderabad|Mumbai": {
    riskScore: 68,
    riskStatus: "Moderate exposure",
    riskDesc:
      "Election-time rallies and past strike patterns around the Pune corridor. Safer alternates available with mild time penalty.",
    riskPolitical: "Medium-High near Pune",
    riskCongestion: "High around entry to Mumbai",
    riskAlternate: "Strong (via Kalaburagi belt)",
    window:
      "High density of political events in the next 3-4 days on the Pune-Solapur axis.",
    tradeoff:
      "Best to take the safer detour and absorb 45-60 min added time on selected trips.",
    tradeoffScore: "Risk-optimized route keeps exposure below 40/100 with only about +1 hr.",
    routes: [
      {
        name: "Route A",
        via: "Solapur → Pune express corridor",
        distance: 715,
        time: 12.5,
        costIndex: 1.0,
        tolls: "High (multiple expressways)",
        disruption:
          "Historically prone to transport strikes and urban protest spillover near Pune.",
        riskBand: "High",
        riskScore: 78
      },
      {
        name: "Route B",
        via: "Kalaburagi → Humnabad → outskirts of Mumbai",
        distance: 760,
        time: 13.5,
        costIndex: 1.07,
        tolls: "Moderate (more national highways, fewer city express tolls)",
        disruption:
          "Bypasses the most volatile protest pockets and offers more predictable highway policing.",
        riskBand: "Low-Medium",
        riskScore: 39
      }
    ],
    table: [
      {
        corridor: "Hyderabad → Solapur",
        signal: "Driver chatter about sporadic protests near district HQ",
        probability: "Medium",
        impact: "Lane diversions, 60–90 min if triggered",
        band: "Medium"
      },
      {
        corridor: "Solapur → Pune urban ring",
        signal: "Election rallies + past strike clusters",
        probability: "High",
        impact: "Full closures / major detours, 2–4 hrs",
        band: "High"
      },
      {
        corridor: "Pune → Mumbai",
        signal: "Standard peak congestion + construction blocks",
        probability: "High",
        impact: "Stop-go traffic, 60–120 min",
        band: "Medium"
      },
      {
        corridor: "Kalaburagi → Humnabad",
        signal: "Highway patrol advisories only",
        probability: "Low",
        impact: "Minimal; routine speed checks",
        band: "Low"
      },
      {
        corridor: "Humnabad → Mumbai outskirts",
        signal: "Scattered roadworks; predictable diversions",
        probability: "Medium",
        impact: "30–45 min typical",
        band: "Low-Medium"
      }
    ]
  }
};

const fallbackTemplate = dataset["Hyderabad|Mumbai"];

let map;
let routeALine;
let routeBLine;

function initMap() {
  if (map) return;

  map = L.map("leafletMap").setView([17.8, 76], 5.5);

  L.tileLayer(
    "https://cartodb-basemaps-a.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO"
    }
  ).addTo(map);

  const hyd = [17.385, 78.4867];
  const pune = [18.5204, 73.8567];
  const solapur = [17.6599, 75.9064];
  const kalaburagi = [17.3297, 76.8343];
  const humnabad = [17.7726, 77.125];
  const mumbai = [19.076, 72.8777];

  const routeACoords = [hyd, solapur, pune, mumbai];
  const routeBCoords = [hyd, humnabad, kalaburagi, mumbai];

  routeALine = L.polyline(routeACoords, {
    color: "#ef4444",
    weight: 5,
    opacity: 0.9
  }).addTo(map);

  routeBLine = L.polyline(routeBCoords, {
    color: "#16a34a",
    weight: 4,
    opacity: 0.8
  }).addTo(map);

  const bounds = routeALine.getBounds().extend(routeBLine.getBounds());
  map.fitBounds(bounds, { padding: [20, 20] });
}

function normalizeCity(city) {
  return city.trim().replace(/\s+/g, " ");
}

function titleCaseCity(city) {
  return normalizeCity(city)
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getSelectedData(source, destination) {
  const key = `${source}|${destination}`;
  const reverseKey = `${destination}|${source}`;

  if (dataset[key]) return dataset[key];
  if (dataset[reverseKey]) return dataset[reverseKey];
  return fallbackTemplate;
}

function bandPill(band) {
  const b = band.toLowerCase();
  if (b.includes("high")) {
    return `<span class="pill-high"><span class="spark">●</span> High</span>`;
  }
  if (b.includes("low")) {
    return `<span class="pill-low"><span class="spark">●</span> Low</span>`;
  }
  return `<span class="pill-med"><span class="spark">●</span> Medium</span>`;
}

function riskClass(band) {
  const b = band.toLowerCase();
  if (b.includes("high")) return "high";
  if (b.includes("low")) return "low";
  return "medium";
}

function routeScore(route, priority) {
  let score = route.riskScore;

  if (priority === "on-time") {
    if (route.costIndex <= 1) score -= 3;
    if (route.time <= 13) score -= 4;
  } else if (priority === "cost") {
    if (route.costIndex > 1.05) score += 3;
  } else if (priority === "risk") {
    score -= 6;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function routeTemplate(route, score) {
  return `
    <div class="route-header">
      <div>
        <div class="route-name">${route.name}</div>
        <div style="font-size:10px;color:var(--text-soft);">${route.via}</div>
      </div>
      <div class="route-risk ${riskClass(route.riskBand)}">
        <span class="dot"></span>${route.riskBand} risk
      </div>
    </div>

    <div class="route-metrics">
      <span><strong>${route.distance}</strong> km</span>
      <span><strong>${route.time}</strong> hrs</span>
      <span>Cost index: <strong>${route.costIndex.toFixed(2)}</strong></span>
    </div>

    <div class="route-tags">
      <span class="route-tag">Tolls: ${route.tolls}</span>
      <span class="route-tag">${route.disruption}</span>
    </div>

    <div class="route-footer">
      <div class="route-score">
        <span class="label">Route risk</span>${score}/100
      </div>
      ${bandPill(route.riskBand)}
    </div>
  `;
}

function updateTable(data) {
  const body = document.getElementById("riskTableBody");
  body.innerHTML = data.table.map((row) => `
    <tr>
      <td>${row.corridor}</td>
      <td>${row.signal}</td>
      <td>${row.probability}</td>
      <td>${row.impact}</td>
      <td>${bandPill(row.band)}</td>
    </tr>
  `).join("");
}

function timelineRow(dotClass, title, meta) {
  return `
    <div class="timeline-row">
      <div class="timeline-dot ${dotClass}"></div>
      <div class="timeline-body">
        <div class="timeline-title">${title}</div>
        <div class="timeline-meta">${meta}</div>
      </div>
    </div>
  `;
}

function updateTimeline(bestRoute, otherRoute, priority, source, destination, usedFallback) {
  const body = document.getElementById("timelineBody");

  let modeText = "Mode: Minimize disruption risk";
  if (priority === "on-time") modeText = "Mode: On-time delivery";
  if (priority === "cost") modeText = "Mode: Minimize cost";

  document.getElementById("aiMode").textContent = modeText;

  const note = usedFallback
    ? `Demo dataset reused for ${source} to ${destination}; city input is open but risk feeds are currently simulated.`
    : `Analysis matched a configured lane for ${source} to ${destination}.`;

  body.innerHTML = `
    ${timelineRow(
      "info",
      `Shipment reviewed for ${source} → ${destination}`,
      note
    )}
    ${timelineRow(
      "alert",
      `${otherRoute.name} has higher disruption exposure`,
      `${otherRoute.disruption} Estimated route risk: ${otherRoute.riskScore}/100 before business-priority adjustment.`
    )}
    ${timelineRow(
      "ok",
      `${bestRoute.name} is the recommended path`,
      `Lower adjusted risk, better resilience, and more stable corridor conditions for current planning mode.`
    )}
    ${timelineRow(
      "info",
      `Dispatcher guidance`,
      `Use ${bestRoute.name} unless there is a hard cost or ETA constraint; monitor corridor signals before dispatch.`
    )}
  `;
}

function analyze() {
  initMap();

  const sourceInput = document.getElementById("source").value || "Hyderabad";
  const destinationInput = document.getElementById("destination").value || "Mumbai";
  const priority = document.getElementById("priority").value;

  const source = titleCaseCity(sourceInput);
  const destination = titleCaseCity(destinationInput);

  document.getElementById("source").value = source;
  document.getElementById("destination").value = destination;

  const matchedData =
    dataset[`${source}|${destination}`] || dataset[`${destination}|${source}`];
  const usedFallback = !matchedData;
  const data = getSelectedData(source, destination);

  const routeScores = data.routes.map(route => ({
    ...route,
    adjustedRisk: routeScore(route, priority)
  }));

  routeScores.sort((a, b) => a.adjustedRisk - b.adjustedRisk);

  const bestRoute = routeScores[0];
  const otherRoute = routeScores[1];

  document.getElementById("routeA").innerHTML = routeTemplate(data.routes[0], routeScore(data.routes[0], priority));
  document.getElementById("routeB").innerHTML = routeTemplate(data.routes[1], routeScore(data.routes[1], priority));

  document.getElementById("riskStatus").textContent = data.riskStatus;
  document.getElementById("riskScore").innerHTML = `${data.riskScore}<span class="unit">/100</span>`;
  document.getElementById("riskDesc").textContent = data.riskDesc;
  document.getElementById("riskPolitical").textContent = data.riskPolitical;
  document.getElementById("riskCongestion").textContent = data.riskCongestion;
  document.getElementById("riskAlternate").textContent = data.riskAlternate;
  document.getElementById("riskWindow").textContent = data.window;
  document.getElementById("riskTradeoffHint").textContent = data.tradeoff;
  document.getElementById("riskTradeoffScore").textContent = data.tradeoffScore;

  document.getElementById("routeLaneTag").textContent = `Simulated ${source} ⇄ ${destination} freight lane`;
  document.getElementById("mapSourceLabel").textContent = source;
  document.getElementById("mapDestinationLabel").textContent = destination;

  document.getElementById("recommendation").innerHTML = `
    <div>
      <strong>Recommended:</strong> ${bestRoute.name} via ${bestRoute.via}. 
      This path gives the best disruption-adjusted profile for the current planning mode.
      ${usedFallback ? " Demo dataset used because this city pair is not yet mapped in the current static dataset." : ""}
    </div>
    <span class="badge">${bestRoute.adjustedRisk}/100 risk</span>
  `;

  updateTable(data);
  updateTimeline(bestRoute, otherRoute, priority, source, destination, usedFallback);

  if (routeALine && routeBLine) {
    const isARecommended = bestRoute.name === "Route A";

    routeALine.setStyle({
      color: "#ef4444",
      weight: isARecommended ? 6 : 4,
      opacity: isARecommended ? 1 : 0.75
    });

    routeBLine.setStyle({
      color: "#16a34a",
      weight: isARecommended ? 4 : 6,
      opacity: isARecommended ? 0.75 : 1
    });
  }

  document.getElementById("refreshTime").textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

window.addEventListener("load", analyze);
