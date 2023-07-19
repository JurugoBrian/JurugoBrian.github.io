// script.js (Radar Chart with Unique Colors for SourceName)

const dataSource = "https://raw.githubusercontent.com/JurugoBrian/uganda-geo-json/main/water_parameters.json";

// Load the data
d3.json(dataSource).then(data => {
  // Parameters to include in the radar chart
  const parameters = ["ElectricalConductivity", "TotalAlkalinity", "TotalHardness", "Sodium", "Color"];

  // Filter data to include only the parameters for the radar chart
  const radarData = data.map((d, i) => {
    return {
      SourceName: d.SourceName,
      values: parameters.map(param => {
        const value = parseFloat(d[param]);
        return isNaN(value) ? 0 : value; // Replace NaN or invalid values with 0
      })
    };
  });

  // Create a unique color scale for each SourceName
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // Chart dimensions
  const width = 600;
  const height = 600;
  const margin = 100;

  // Calculate the maximum value for each parameter
  const maxValue = parameters.reduce((max, param) => {
    const paramMax = d3.max(data, d => {
      const value = parseFloat(d[param]);
      return isNaN(value) ? 0 : value; // Replace NaN or invalid values with 0
    });
    return Math.max(max, paramMax);
  }, 0);

  // Define the number of scale circles
  const numScaleCircles = 5;

  // Calculate the scale values based on the maximum value
  const scaleValues = d3.range(1, numScaleCircles + 1).map(d => maxValue / numScaleCircles * d);

  // Create a radial scale for the chart with padding
  const radarScale = d3.scaleLinear()
    .domain([0, maxValue])
    .range([0, width / 2 - margin])
    .nice(); // Apply nice() to ensure the scale is human-friendly

  // Calculate the angle for each parameter
  const angleSlice = Math.PI * 2 / parameters.length;

  // Create the radar chart SVG
  const svg = d3.select("#radar-chart")
    .attr("width", width)
    .attr("height", height);

  const radarChart = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Draw the transparent background circles
  const circles = radarChart.selectAll(".circle")
    .data(d3.range(1, numScaleCircles + 1))
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("r", d => radarScale(maxValue / numScaleCircles * d))
    .style("fill", "none")
    .style("stroke", "#ddd")
    .style("stroke-dasharray", "3,3");

  // Draw the scale circles
  const scaleCircles = radarChart.selectAll(".scale-circle")
    .data(scaleValues)
    .enter()
    .append("circle")
    .attr("class", "scale-circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", d => radarScale(d))
    .style("fill", "none")
    .style("stroke", "#ccc")
    .style("stroke-dasharray", "3,3");

  // Add scale labels
  const scaleLabels = radarChart.selectAll(".scale-label")
    .data(scaleValues)
    .enter()
    .append("text")
    .attr("class", "scale-label")
    .attr("x", 0)
    .attr("y", d => -radarScale(d))
    .attr("dy", "-0.5em")
    .style("font-size", "12px")
    .style("text-anchor", "middle")
    .text(d => d.toFixed(1));

  // Draw the axis lines
  const axes = radarChart.selectAll(".axis")
    .data(parameters)
    .enter()
    .append("g")
    .attr("class", "axis");

  axes.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => radarScale(maxValue) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y2", (d, i) => radarScale(maxValue) * Math.sin(angleSlice * i - Math.PI / 2))
    .style("stroke", "#aaa");

  // Draw the radar areas
  radarChart.selectAll(".radar-area")
    .data(radarData)
    .enter()
    .append("path")
    .attr("class", "radar-area")
    .attr("d", d => {
      const radarLine = d3.lineRadial()
        .curve(d3.curveLinearClosed)
        .angle((_, i) => angleSlice * i - Math.PI / 2)
        .radius(d => radarScale(d));
      return radarLine(d.values);
    })
    .style("fill", d => colorScale(d.SourceName))
    .style("opacity", 0.7);

  // Draw the scale lines for each source (SourceName)
  radarData.forEach(d => {
    radarChart.append("g")
      .selectAll(".scale-line")
      .data(d.values)
      .enter()
      .append("line")
      .attr("class", "scale-line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (val, j) => radarScale(val) * Math.cos(angleSlice * j - Math.PI / 2))
      .attr("y2", (val, j) => radarScale(val) * Math.sin(angleSlice * j - Math.PI / 2))
      .style("stroke", colorScale(d.SourceName)); // Use the color scale to set unique colors
  });

  // Add the parameter names (axes labels)
  radarChart.selectAll(".axis-label")
    .data(parameters)
    .enter()
    .append("text")
    .attr("class", "axis-label")
    .attr("x", (d, i) => radarScale(maxValue * 1.15) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y", (d, i) => radarScale(maxValue * 1.15) * Math.sin(angleSlice * i - Math.PI / 2))
    .style("font-size", "14px")
    .style("text-anchor", "middle")
    .text(d => d);

  // ... (Continuation of the previous code)

  // Create the scrollable legend container
  const legendContainer = d3.select("#legend-container")
    .append("div")
    .attr("class", "scrollable-legend");

  // Add the sources (SourceName) to the legend
  const legendItems = legendContainer.selectAll(".legend-item")
    .data(radarData)
    .enter()
    .append("div")
    .attr("class", "legend-item");

  legendItems.append("div")
    .attr("class", "legend-color")
    .style("background-color", d => colorScale(d.SourceName));

  legendItems.append("span")
    .attr("class", "legend-text")
    .text(d => d.SourceName);
});
