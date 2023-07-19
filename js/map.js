// Width and height of the map
const width = 800;
const height = 600;

// Create an SVG element
const svg = d3.select("#map")
  .attr("width", width)
  .attr("height", height);

// Create a projection for Uganda
const projection = d3.geoMercator()
  .center([32, 1])
  .scale(4000)
  .translate([width / 2, height / 2]);

// Create a path generator
const path = d3.geoPath().projection(projection);

// Load the Uganda GeoJSON data
d3.json("https://raw.githubusercontent.com/JurugoBrian/uganda-geo-json/main/gadm41_UGA_2.json").then(function(uganda) {
  // Render the map districts
  svg.selectAll(".district")
    .data(uganda.features)
    .enter()
    .append("path")
    .attr("class", "district")
    .attr("d", path);

  d3.json("https://raw.githubusercontent.com/JurugoBrian/uganda-geo-json/main/water_source_locations.json").then(function(data) {
    // Loop through the data and add points to the map
    const points = svg.selectAll(".point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", function(d) {
        const longitude = parseFloat(d.longitude);
        const latitude = parseFloat(d.latitude);
        return isNaN(longitude) || isNaN(latitude) ? 0 : projection([longitude, latitude])[0];
      })
      .attr("cy", function(d) {
        const longitude = parseFloat(d.longitude);
        const latitude = parseFloat(d.latitude);
        return isNaN(longitude) || isNaN(latitude) ? 0 : projection([longitude, latitude])[1];
      })
      .attr("r", 5);

    // Add tooltip functionality
    points
    .on("mouseover", function(event, d) {
      showTooltip(event, d);
    })
    .on("mouseout", hideTooltip);


  });

  // Implement zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

  svg.call(zoom);

  function zoomed(event) {
    const { transform } = event;
    svg.selectAll("path")
      .attr("transform", transform);
    svg.selectAll(".point")
      .attr("transform", transform);
  }
});

// Function to show the tooltip
function showTooltip(event, d) {
  const sourceName = d.SourceName;
  const location = `${d.latitude}, ${d.longitude}`;

  const [x, y] = d3.pointer(event, svg.node());

  const tooltip = d3.select("#tooltip")
    .style("left", x + 10 + "px")
    .style("top", y - 20 + "px")
    .html(`${sourceName}<br>Location: ${location}`);
  
  tooltip.style("opacity", 1);
}

// Function to hide the tooltip
function hideTooltip() {
  const tooltip = d3.select("#tooltip")
    .style("opacity", 0);
}
