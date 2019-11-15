// @TODO: YOUR CODE HERE!

//chart dimensions, etc
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
  };

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

var svg = d3.select("body")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);


//reading data
d3.csv("/assets/data/data.csv").then(function(error, data) {
    if (error) throw error;

    // parse data
  data.forEach(function(data) {
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.abbr = +data.abbr; //state abbreviations
});
});


//Initial parameter
var firstXAxis = "age";
var firstYAxis = "smokes";

//function to use on x scale to update graph on click
function xScale(data, firstXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[firstXAxis]) * 0.8,
            d3.max(data, d = d[firstXAxis]) * 1.2
        ])
        .range([0, width])
    
        return xLinearScale;    

}

//function to update Y axis upon clicking
function yScale(data, firstYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[firstYAxis]) * 0.8,
      d3.max(data, d => d[firstYAxis]) * 1.2
    ])
    .range([chartHeight, 0]);

  return yLinearScale;
}

//function to update X axis upon clicking label

function updateAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(500)
      .call(bottomAxis);
  
    return xAxis;
  }

//function for updating Y axis upon clicking label
function renderYAxes(newYScale, yAxis) {
  var yAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(500)
    .call(leftAxis);
  
  return yAxis;
}

//function to update circles with transition to new circles

function updateCircles(circlesGroup, newXScale, firstXaxis) {

    circlesGroup.transition()
      .duration(500)
      .attr("cx", d => newXScale(d[firstXAxis]))
      .attr("cy", d => newYScale(d[firstYAxis]));
  
    return circlesGroup;
  }

function updateToolTip(firstXAxis, circlesGroup) {

   if (firstXAxis === "age") {
      var label = "Age:";
    }
    else {
      var label = "Smokes:"; //Can't quite tell what the number in the "smokes" column refers to...number of cigarettes or av age?
    }

    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}<br>${label} ${d[firstXAxis]}`);
    });
  
    circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

d3.csv("assets/data/data.csv").then(function(data) {

//should I read the csv file here?....KG
// d3.csv("assets/data/data.csv").then(function(data, err) {
  // if (err) throw err;

  //parsing data
  data.forEach(function(data){
    data.id = +data.id;
    data.income = +data.income;
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });
  
  console.log(data);



  // xLinearScale function above csv import
  var xLinearScale = xScale(data, firstXAxis);
  console.log(data);

  // Function for y scale
  var yLinearScale = yScale(data, firstYAxis);
  //d3.scaleLinear()
    //.domain([0, d3.max(data, d => d.smokes)])
    //.range([height, 0]);

  // Initial axis functions to situate labels and axes to left and bottom
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.smokes))
    .attr("r", 20)
    .attr("fill", "lightblue")
    .attr("opacity", ".25");

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age") // value for event listener
    .classed("active", true)
    .text("Age");

  var smokersLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") // value for event listener
    .classed("inactive", true)
    .text("Smokers");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)") //maybe don't need to abbreviate states?
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("States"); //"smokers? Age of smokers? state abbreviations?"

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(firstXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value"); //is this what would attach state abbreviations to circles?
      if (value !== firstXAxis) {

        // replaces firstXAxis with value
        firstXAxis = value;

        // console.log(firstXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, firstXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, firstXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(firstXAxis, circlesGroup);

        // changes classes to change bold text
        if (firstXAxis === "age") {
          smokersLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          smokersLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}); 

  
