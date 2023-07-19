// script.js (Stacked Bar Chart with Tooltip)

const dataSource = "https://raw.githubusercontent.com/JurugoBrian/uganda-geo-json/main/water_parameters.json";

// Load the data
d3.json(dataSource).then(data => {
  // Parameters for the stacked bar chart
  const parameters = ["pH", "Turbidity", "Fluoride", "Nitrites", "Ammonium", "Phosphates", "Nitrates", "Potassium"];

  // Filter out data with missing or invalid values for the selected parameters
  const filteredData = data.filter(d => parameters.every(param => !isNaN(parseFloat(d[param]))));

  // Create the stacked bar chart data
  const stackedBarChartData = d3.stack()
    .keys(parameters)
    .value((d, key) => parseFloat(d[key]))
    (filteredData);

  // Chart dimensions
  const margin = { top: 50, right: 50, bottom: 0, left: 50 };
  const width = 1000 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // X and Y scales
  const xScale = d3.scaleBand()
    .domain(filteredData.map(d => d.SourceName))
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(stackedBarChartData, d => d3.max(d, d => d[1]))])
    .range([height, 0]);

  // Color scale for the stacked bars
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // Create the stacked bar chart SVG
  const svg = d3.select("#stacked-bar-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Draw the Y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale));

  // Create groups for each stack
  const stackGroups = svg.selectAll(".stack")
    .data(stackedBarChartData)
    .enter()
    .append("g")
    .attr("class", "stack")
    .style("fill", (d, i) => colorScale(i));

  // Draw the stacked bars
  stackGroups.selectAll("rect")
    .data(d => d)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.data.SourceName))
    .attr("y", d => yScale(d[1]))
    .attr("height", d => yScale(d[0]) - yScale(d[1]))
    .attr("width", xScale.bandwidth())
    
  // Update the tooltip on mouseover
  .on("mouseover", (event, d) => {
    const sourceName = d.data.SourceName;
    const parameter = parameters[d3.maxIndex(d, d => d[1])];
    const value = d[1] - d[0];
    showTooltip(event.pageX, event.pageY, `${sourceName}: ${parameter}: ${value.toFixed(1)}`);
  })

  // Remove tooltip on mouseout
  .on("mouseout", () => {
    hideTooltip();
  });

  // Function to show the tooltip
  function showTooltip(x, y, text) {
    d3.select("#tooltip")
      .style("left", x + "px")
      .style("top", y + "px")
      .style("opacity", 1)
      .html(text);
  }

  // Function to hide the tooltip
  function hideTooltip() {
    d3.select("#tooltip")
      .style("opacity", 0);
  }

  // Create the legend container
  const legendContainer = d3.select("#legend-container");

  // Add the legend items
  const legendItems = legendContainer.selectAll(".legend-item")
    .data(parameters)
    .enter()
    .append("div")
    .attr("class", "legend-item");

  legendItems.append("div")
    .attr("class", "legend-color")
    .style("background-color", (_, i) => colorScale(i));

  legendItems.append("span")
    .attr("class", "legend-text")
    .text(d => d);

  // Create the x-axis SVG
  const xAxisSvg = d3.select("#x-axis-svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", 40)
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`);

  // Draw the X-axis
  xAxisSvg.append("g")
    .attr("class", "x-axis")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)"); // Rotate the labels by 45 degrees for better readability
});
