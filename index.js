
const urlJSON =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

document.addEventListener("DOMContentLoaded", function () {
  //  ---------------  GETTING DATA   ---------------
  const req = new XMLHttpRequest();
  req.open("GET", urlJSON, true);
  req.send();
  req.onload = function () {
    const data = JSON.parse(req.responseText);

// ------------  PARAMERTERS  ------------
    const svgWidth = 1250; 
    const svgHeight = 400;
    const svgPadding = [50,50,50,80]; // Top, Right, Bottom, Left

// ------------  SCALES  ------------
    const variance_min = d3.min(data.monthlyVariance, d=>d.variance)
    const variance_max = d3.max(data.monthlyVariance, d=>d.variance)

    const year_min = d3.min(data.monthlyVariance, d=>d.year)
    const year_max = d3.max(data.monthlyVariance, d=>d.year)

    const rectWidth = (svgWidth - svgPadding[3] - svgPadding[1]) / (year_max - year_min);
    const rectHeight = (svgHeight - svgPadding[2] - svgPadding[0]) / (variance_max - variance_min);

    const scaleTemp = d3.scaleSqrt()
      .domain([variance_min, -1.5, 1.5, variance_max]).range(["navy","navy","orange","orange"]);
    const scaleYear = d3.scaleTime().domain([new Date(year_min,0),new Date(year_max,0)]).range([svgPadding[3], svgWidth - svgPadding[1]])
    const scaleMonth = d3.scaleLinear().domain([1, 12]).range([svgPadding[0], svgHeight - svgPadding[2]])

// ------------  SVG - CHART  ------------
    let svg = d3.select("body").append("svg").attr("width", svgWidth).attr("height",svgHeight)

    svg.selectAll("rect")
    .data(data.monthlyVariance)
    .enter()
    .append("rect")
    .attr("width", rectWidth)
    .attr("height", rectHeight)
    .attr("x", (d) => scaleYear(new Date(d.year,0)))
    .attr("y", (d) => scaleMonth(d.month))
    .attr("fill", (d) => scaleTemp(d.variance))
    .attr("class","cell")
    .attr("data-month",(d) => (d.month-1))
    .attr("data-year", (d) => (new Date(d.year,0)).getFullYear())
    .attr("data-temp",(d) => (d.variance))
    .attr("index",(d,i)=>i)

// ------------  AXIS  ------------
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    let xaxis = d3.axisBottom(scaleYear)
    .tickFormat(d3.timeFormat("%Y"))

    svg.append("g")
    .attr("transform","translate(0,"+ (svgHeight - svgPadding[2] + rectHeight )+")")
    .call(xaxis)
    .attr("id","x-axis")

    let yaxis = d3.axisLeft(scaleMonth)
    .tickFormat((d,i)=>months[i])
    
    svg.append("g")
    .attr("transform","translate("+ svgPadding[3] +","+rectHeight/2+")")
    .call(yaxis)
    .attr("id","y-axis")


// ------------  LEGEND  ------------
const legendArray = Array(Math.floor(variance_max) + 1 - Math.floor(variance_min)).fill(0).map((d,i)=> Math.floor(variance_min) + i);

const legpadding = [20, 20,20,20];
const rectLegendWidth = 40;
const rectLegendHeight = 25;
const legWidth = rectLegendWidth * legendArray.length ;
const legHeight = 40;

var legend = d3
.select("body")
.append("svg")
.attr("id", "legend")
.attr("class", "legend")
.attr("width", legWidth + legpadding[1] + legpadding[3])
.attr("height", legHeight  + legpadding[0] + legpadding[2])

legend.selectAll("rect")
.data(legendArray)
.enter()
.append("rect")
.attr("x", (d,i)=> legpadding[3] + rectLegendWidth*i)
.attr("y",10)
.attr("width", rectLegendWidth)
.attr("height", rectLegendHeight)
.attr("fill", d=>scaleTemp(d))
.attr("stroke", "black")

legend.selectAll("line")
.data(legendArray)
.enter()
.append("line")
.attr("x1", (d,i)=> legpadding[3] + rectLegendWidth*i)
.attr("y1",10)
.attr("x2", (d,i)=> legpadding[3] + rectLegendWidth*i)
.attr("y2",rectLegendHeight + rectLegendHeight*0.5)
.attr("stroke", "black")

legend.selectAll("text")
.data(legendArray)
.enter()
.append("text")
.attr("x", (d,i)=> legpadding[3] * 1.5 + rectLegendWidth*i)
.attr("y",rectLegendHeight*2)
.text((d,i)=> d>=0 ? "+"+d+"°" :  +d+"°")
.attr("dominant-baseline", "middle")
.attr("class", "legendText")

// ------------  TOOLTIP  ------------
    svg // tooltip appearance on mouse bar hovering
    .selectAll("rect")
    .on("mouseover", function () {
      var i = this.getAttribute("index");

      d3.select("#tooltip") // adding text to appear in the tooltip.++ add data as props.  ++  positioning tooltip
        .html("<strong>"+data.monthlyVariance[i].variance+"</strong>  (<em>"+data.monthlyVariance[i].year+"</em>)")
        .style("left", 50 + scaleYear(new Date(data.monthlyVariance[i].year,0)) + "px")
        .style("bottom", svgHeight+80-scaleMonth(data.monthlyVariance[i].month) + "px")
        .attr("data-year", (d) => (new Date(data.monthlyVariance[i].year,0)).getFullYear())
      d3.select("#tooltip").transition().duration(200).style("opacity", 0.9);
    });

    svg // tooltip desappearance on mouse bar leaving hovering
    .selectAll("rect")
    .on("mouseout", function () {
      d3.select("#tooltip").transition().duration(200).style("opacity", 0);
    });
  }
})