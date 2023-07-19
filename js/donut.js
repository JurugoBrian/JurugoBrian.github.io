// script.js (Final and complete JavaScript file)

const dataSource = "https://raw.githubusercontent.com/JurugoBrian/uganda-geo-json/main/water_parameters.json";
let svg; // Declare svg outside of the updateChart function for access across the script

// Load the data
d3.json(dataSource).then(data => {
  const districtSelector = document.getElementById("district");
  const sourceTypeData = d3.group(data, d => d.SourceType, d => d.SourceName);
  let filteredData = data; // Initialize with all data

  // Populate district dropdown options
  const districts = Array.from(new Set(data.map(d => d.District))); // Get unique district names
  districtSelector.innerHTML = `<option value="all">All Districts</option>`;
  districtSelector.innerHTML += districts.map(d => `<option value="${d}">${d}</option>`).join("");

  // Update chart and legend on district selection change
  districtSelector.addEventListener("change", () => {
    const selectedDistrict = districtSelector.value;
    if (selectedDistrict === "all") {
      filteredData = data; // Show all data
    } else {
      filteredData = data.filter(d => d.District === selectedDistrict); // Filter data by selected district
    }
    updateChart(filteredData);
  });

  // Initial chart rendering
  updateChart(filteredData);
});

function updateChart(data) {
  const sourceTypeData = d3.group(data, d => d.SourceType, d => d.SourceName);

  const width = 600;
  const height = 600;
  const radius = Math.min(width, height) / 3;
  const outerRadius = radius * 0.8;

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const arc = d3.arc()
    .innerRadius(radius * 0.6)
    .outerRadius(outerRadius);

  const pie = d3.pie()
    .sort(null)
    .value(d => sourceTypeData.get(d).size);

  if (svg) {
    // Remove previous chart before updating
    svg.selectAll("*").remove();
  } else {
    // Append a new svg only if it doesn't exist yet
    svg = d3.select("#donut-chart")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);
  }

  const arcs = svg.selectAll("arc")
    .data(pie(sourceTypeData.keys()))
    .enter()
    .append("g")
    .attr("class", "arc");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => colorScale(d.data));

  const labelArc = d3.arc()
    .innerRadius(outerRadius * 1.1)
    .outerRadius(outerRadius * 1.1);

  const labelLineArc = d3.arc()
    .innerRadius(outerRadius * 1.3)
    .outerRadius(outerRadius * 1.3);

  arcs.append("text")
    .attr("transform", d => {
      if (d.data === "Tank") {
        const pos = labelLineArc.centroid(d);
        pos[0] = outerRadius * 1.35 * (d.startAngle + d.endAngle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      } else {
        return `translate(${labelArc.centroid(d)})`;
      }
    })
    .attr("dy", "0.35em")
    .style("text-anchor", d => (d.startAngle + d.endAngle < Math.PI ? "start" : "end"))
    .text(d => {
      const sourceTypeName = d.data;
      const totalSources = sourceTypeData.get(sourceTypeName).size;
      const percentage = (totalSources / data.length) * 100;
      return `${percentage.toFixed(1)}%`;
    });

  const lines = arcs.append("path")
    .attr("class", "line")
    .attr("d", d => {
      if (d.data === "Tank") {
        const pos = labelLineArc.centroid(d);
        pos[0] = outerRadius * 1.25 * (d.startAngle + d.endAngle < Math.PI ? 1 : -1);
        return `M${arc.centroid(d)}Q${pos[0]},${pos[1]}${pos}`;
      } else {
        return `M${arc.centroid(d)}L${labelArc.centroid(d)}`;
      }
    });

  const legendContainer = d3.select(".legend-container");

  const legendItems = legendContainer.selectAll(".legend-item")
    .data(sourceTypeData.keys())
    .enter()
    .append("div")
    .attr("class", "legend-item");

  legendItems.append("div")
    .attr("class", "legend-color")
    .style("background-color", d => colorScale(d));

  legendItems.append("span")
    .attr("class", "legend-text")
    .text(d => d);
}