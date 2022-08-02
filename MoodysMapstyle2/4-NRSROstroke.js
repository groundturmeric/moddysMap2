//https://nationalzoo.si.edu/migratory-birds/migratory-birds-tracking-table
// make the SVG and viewbox
const svg = d3.select("div#chart").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight)
    // .style("background-color", "lavender")
    .attr("id", "map-svg")
    .classed("svg-content", true);

let projectionScale = 150;

// define the settings for map projection

// const projection = d3.geoOrthographic()
const projection = d3.geoEqualEarth()
    .translate([window.innerWidth / 2, window.innerHeight / 2])
    .rotate([0, 0, 0])
    .scale(150)
    .center([0, 0]);

let radiusOpening = window.innerWidth/55;
let radiusSwarm = window.innerWidth/89
let radius = 5


// create the geo path generator
let geoPathGenerator = d3.geoPath().projection(projection);



/* 
    ADD TOOLTIP FOR LATER
    The visualization gets too cluttered if we try to add text labels;
    use a tooltip instead
    */
const tooltip = d3.select("#chart")
    .append("div")
    .attr("class", "tooltip");

// great a g element to append all of our objects to
// const g = svg.append("g");

// will be used later for grid lines
const graticule = d3.geoGraticule();

// maps use multiple file types. we can store the "type" of each file along with the URL for easy loading!
const files = [
    { "type": "json", "file": "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson" },
    { "type": "csv", "file": "data/MoodysOfficesLocations.csv" } // dataset of every earthquake on Mar 21, 2022 from here: https://earthquake.usgs.gov/earthquakes/feed/v1.0/csv.php
];
let promises = [];

// for each file type, add the corresponding d3 load function to our promises
files.forEach(function (d) {
    if (d.type == "json") {
        promises.push(d3.json(d.file));
    } else {
        promises.push(d3.csv(d.file));
    }
});

// when our data has been loaded, call the draw map function
Promise.all(promises).then(function (values) {
    drawCircles(values[0], values[1])
});



/*
ALL THE MAP STUFF HAPPENS HERE AND IT DEPENDS ON DATA BEING LOADED
*/
function drawCircles(geo, data) {


    let allBranches = data.map(function (d) {
        return d.Branch;
    })

    let branches = [...new Set(allBranches)];
    // console.log(allBranches);




    // Moody's logo blue #052e9d    and    #090524
    // Moody's logo blue #052e9d    and    #090524
    fillScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(branches)
        .range(["#1a9fdc", "#75b075", "#052e9d", "#f5943d"]);


    let allGlobalGroups = data.map(function (d) {
        return d.GlobalGroup;
    })

    let globalGroups = [...new Set(allGlobalGroups)];
    console.log(globalGroups);


    // xScale for Beeswarms
    var xScale = d3.scaleBand()  //for categorical data 
        .domain(["MIS Offices", "Moody's Analytics Offices", "MIS Affiliates", "Moody's Shared Services",])
        .range([window.innerWidth * 0.2, window.innerWidth * 0.8]);



    var xScaleGlobal = d3.scaleBand()  //for categorical data 
        .domain(globalGroups)
        .range([window.innerWidth * 0.2, window.innerWidth * 0.8]);

    console.log(branches)


    /*
DRAW AXES
*/
    var xAxis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${window.innerHeight/2  + radiusSwarm * 8 })`)
        .call(d3.axisBottom().scale(xScaleGlobal))
        .attr("opacity", 0)


    var xAxisBranches = svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${window.innerHeight/2  + radiusSwarm * 9 })`)
    .call(d3.axisBottom().scale(xScale))
    .attr("opacity", 0)






    // our function has two parameters, both of which should be data objects
    console.log('GEO: ', geo)
    console.log('dataset: ', data)

    // we want to scale the size of each bubble based on an attribute of the data
    // var rScale = d3.scaleSqrt()
    //     .domain(d3.extent(data, function (d) { return +d.mag }))
    //     .range([0.1, 20]);

    // var rScale = d3.scaleLog()
    // .domain([1,10])        
    // .range([0.1, 20]);


    // swarm(data)

    // add grid lines
    var lines = svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", geoPathGenerator)
        .style("fill", "none")
        .style("opacity", 0)
        ;

    var basemap = svg
        .selectAll("continent")
        .data(geo.features)
        .enter()
        .append("path")
        .attr("class", 'continent')
        // draw each country
        .attr("d", geoPathGenerator)
        // .attr("country", function (d) { return d.id })
        // .attr("fill", "#eeeeee") // light Grey
        .attr("fill", "#eeeeee")
        .attr("opacity", 0)
        // .attr("stroke", "black");


    // create a legend group and tranform it to be top left of page
    var legend = svg.append("g")
        .attr("transform", "translate(20,20)")
        .attr("class", "Legend")



    // add a title for the legend
    legend.append("text")
        .attr("x", 7)
        .attr("y", 0)
        .text("Branches")
        .style("font-weight", "bold")

        legend.append("circle")
        .attr("id", "legendCircles")
        .attr("cx", 110)
        .attr("cy", ( 20) - 5)
        .attr("r", 5)
        .attr("fill", fillScale(branches[0]))
        // .attr("fill-opacity", 0)
        .attr("stroke-width", 2)
        .attr("stroke", "yellow");

        legend.append("text")
        .attr("class", "Legend")
        .attr("x", 120)
        .attr("y", 20)
        .attr("font-size", 12)
        .attr("fill", "black")
        // .style("font-weight", "bold")
        // .text("Nationally Recognized Statistical Rating Organization")
        .text("NRSRO*")

        legend.append("text")
        .attr("class", "Legend")
        .attr("x", 10)
        .attr("y", 101)
        .attr("font-size", 12)
        .attr("fill", "black")
        // .style("font-weight", "bold")
        .text("*Nationally Recognized Statistical Rating Organization")



    //Legend Drawing
    fillScale.domain().forEach((d, i) => {
        for (i = 0; i < 4; i++) {
            legend.append("text")
                // .attr("text-anchor", "middle")
                .attr("x", 20)
                .attr('y', ((i + 1) * 20))
                .attr("font-size", 12)
                .attr("fill", "black")
                .text([branches[i]])
                // .style("font-weight", "bold")

            // ADD ID or CLASS so they dont get grabbed with simulation! in select all circle
            legend.append("circle")
                .attr("id", "legendCircles")
                .attr("cx", 10)
                .attr("cy", ((i + 1) * 20) - 5)
                .attr("r", 5)
                .attr("fill", fillScale(branches[i]));

            // legend.append("rect")
            //     .attr("id", "legendCircles")
            //     .append("rect")
            //     .attr("width", 15)
            //     .attr("height", 15)
            //     .attr("x", 10)
            //     .attr("y",((i + 1) * 20))
            //     .attr("fill", fillScale(branches[i]));

        }
    })


    var circs

    var simulation = d3.forceSimulation(data)


    swarm(data)

    function swarm(data) {

        basemap
        .style("stroke-opacity", 0)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .style("opacity", 0)


        // CENTER SIMULATION
        simulation
            // .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1)) // pull nodes to a central point from top left
            .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2)) // pull nodes to a central point
            .force('charge', d3.forceManyBody().strength(0.1)) // send nodes away from eachother with negative force
            .force('collision', d3.forceCollide().radius(function (d) { // prevent circle overlap when collide
                return radiusOpening;
            }).strength(1))
            .force('x', d3.forceX().x(function (d) {
                return xScale(d.Branch);
            }).strength(0)) // 1 for radius size circles just touching, more gives padding
            .force('y', d3.forceY().y(function (d) {
                return window.innerHeight / 2;
            }).strength(0))
            .on('tick', ticked)
            ;
        console.log(data)


        function ticked() {
            var u = svg
                .selectAll('#dataPoints')
                .data(data)
                .join('circle')
                .attr("id", "dataPoints")
                .style("stroke-width",  function(d){
                    if (d.NRSRO == "N/A") {
                   return 0;
             } else {
                return 2;
             }
           }
             )
                .style("stroke", function(d){
                    if (d.NRSRO == "N/A") {
                   return "white";
             } else {
                return "yellow";
             }
           }
             )
                .attr('r', function (d) {
                    // return d.radius;
                    return radiusOpening;
                })
                .attr('fill', function (d) {
                    return fillScale(d.Branch);
                })

                .attr('cx', function (d) {
                    return d.x
                })
                .attr('cy', function (d) {
                    return d.y
                });

            /* TOOLTIP */


            u.on("mouseover", function (e, d) {

                let x = +d3.select(this).attr("cx") + 20;
                let y = +d3.select(this).attr("cy") - 10;

                // Format the display of the numbers,
                // using d3.format()
                // See: https://github.com/d3/d3-format/blob/v3.1.0/README.md#format
                // let displayValue = d3.format(",")(d.likes);

                tooltip.style("visibility", "visible")
                    .style("top", `${y}px`)
                    .style("left", `${x}px`)
                    .html(`<b>${d.Name}</b>`);

                // Optionally, visually highlight the selected circle
                u.attr("opacity", 0.4);
                d3.select(this).attr("opacity", 1).raise();

            }).on("mouseout", function () {
                // Reset tooltip and circles back to original appearance
                tooltip.style("visibility", "hidden");
                u.attr("opacity", 1);
            });

        }

        // Update and restart the simulation.


    }


    function swarmBranches(data) {

        xAxis            
        .call(d3.axisBottom().scale(xScale))
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .style("opacity", 1)
            .attr("transform", `translate(0,${window.innerHeight/2  + radiusSwarm * 9 })`)



        
        basemap
        .style("stroke-opacity", 0)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .style("opacity", 0)





        simulation.restart()
        simulation.alpha(0.05)


        // GROUPED SIMULATION



        simulation
        // .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2).strength(0)) // pull nodes to a central point
        // .force('charge', d3.forceManyBody().strength(0)) // send nodes away from eachother with negative force
            .force('x', d3.forceX().x(function (d) {
                return xScale(d.Branch);
            }).strength(2))
            .force('y', d3.forceY().y(function (d) {
                return window.innerHeight / 2;
            }).strength(0.4))  //clusters bubbles on x axis, without force y they are like pods
            .force('collision', d3.forceCollide().radius(function (d) { // prevent circle overlap when collide
                return radiusSwarm
            }))
            .on('tick', ticked);




        function ticked() {
            var u = svg
                .selectAll('#dataPoints')
                .data(data)
                .join('circle')
                .attr("id", "dataPoints")
                .style("stroke-width",  function(d){
                    if (d.NRSRO == "N/A") {
                   return 0;
             } else {
                return 2;
             }
           }
             )
                .style("stroke", function(d){
                    if (d.NRSRO == "N/A") {
                   return "white";
             } else {
                return "yellow";
             }
           }
             )
                .attr('r', function (d) {
                    // return d.radius;
                    return radiusSwarm;
                })
                .attr('fill', function (d) {
                    return fillScale(d.Branch);
                })

                .attr('cx', function (d) {
                    return d.x - 10*radiusSwarm
                })
                .attr('cy', function (d) {
                    return d.y - 2 * radiusSwarm
                })
                // .attr("transform", `translate(0,${radiusSwarm * (-8) , 0})`);

            /* TOOLTIP */


            u.selectAll("Circle").on("mouseover", function (e, d) {
                let x = +d3.select(this).attr("cx") + 20;
                let y = +d3.select(this).attr("cy") - 10;

                // Format the display of the numbers,
                // using d3.format()
                // See: https://github.com/d3/d3-format/blob/v3.1.0/README.md#format
                // let displayValue = d3.format(",")(d.likes);

                tooltip.style("visibility", "visible")
                    .style("top", `${y}px`)
                    .style("left", `${x}px`)
                    .html(`<b>${d.Name}</b>`);

                // Optionally, visually highlight the selected circle
                u.attr("opacity", 0.1);

                d3.select(this).attr("opacity", 1).raise();

            }).on("mouseout", function () {
                // Reset tooltip and circles back to original appearance
                tooltip.style("visibility", "hidden");
                u.attr("opacity", 1)
                .style("stroke", function(d){
                    if (d.NRSRO == "N/A") {
                   return "white";
             } else {
                return "yellow";
             }
           }
             );
            });

        }

    }

    function swarm3(data) {

        xAxis
            .transition()
            .call(d3.axisBottom().scale(xScaleGlobal))
            .duration(1000)
            .ease(d3.easeLinear)
            .style("opacity", 1)
            .attr("transform", `translate(0,${window.innerHeight/2  + radiusSwarm * 8 })`)

        
        basemap
        .style("stroke-opacity", 0)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .style("opacity", 0)





        simulation.restart()
        simulation.alpha(0.05)


        // GROUPED SIMULATION



        simulation
            // .force('charge', d3.forceManyBody().strength(0)) // send nodes away from eachother
            // .force('center', d3.forceCenter(width / 2, height / 2)) // pull nodes to a central point
            .force('x', d3.forceX().x(function (d) {
                return xScaleGlobal(d.GlobalGroup);
            }).strength(1))
            .force('y', d3.forceY().y(function (d) {
                return window.innerHeight / 2;
            }).strength(0.4))  //clusters bubbles on x axis, without force y they are like pods
            .force('collision', d3.forceCollide().radius(function (d) { // prevent circle overlap when collide
                return radiusSwarm
            }))
            .on('tick', ticked);




        function ticked() {


            var u = svg
                .selectAll('#dataPoints')
                .data(data)
                .join('circle')
                .attr("id", "dataPoints")
                .style("stroke-width",    function(d){
                     if (d.NRSRO == "N/A") {
                    return 0;
              } else {
                    return 2;
              }
            }
              )
                .style("stroke",  function(d){
                    if (d.NRSRO == "N/A") {
                   return "white";
             } else {
                return "yellow";
             }
           }
             )
                .attr('r', function (d) {
                    // return d.radius;
                    return radiusSwarm;
                })
                .attr('fill', function (d) {
                    return fillScale(d.Branch);
                })

                .attr('cx', function (d) {
                    return d.x
                })
                .attr('cy', function (d) {
                    return d.y
                });






            /* TOOLTIP */


            u.selectAll("Circle").on("mouseover", function (e, d) {
                let x = +d3.select(this).attr("cx") + 20;
                let y = +d3.select(this).attr("cy") - 10;

                // Format the display of the numbers,
                // using d3.format()
                // See: https://github.com/d3/d3-format/blob/v3.1.0/README.md#format
                // let displayValue = d3.format(",")(d.likes);

                tooltip.style("visibility", "visible")
                    .style("top", `${y}px`)
                    .style("left", `${x}px`)
                    .html(`<b>${d.Name}</b>`);

                // Optionally, visually highlight the selected circle
                u.attr("opacity", 0.1);
                d3.select(this).attr("opacity", 1).raise();

            }).on("mouseout", function () {
                // Reset tooltip and circles back to original appearance
                tooltip.style("visibility", "hidden");
                u.attr("opacity", 1);
            });

        }

    }

    // var basemap = svg
    //     .selectAll("continent")
    //     .data(geo.features)
    //     .enter()
    //     .append("path")
    //     .attr("class", 'continent')
    //     // draw each country
    //     .attr("d", geoPathGenerator)
    //     // .attr("country", function (d) { return d.id })
    //     .attr("fill", "#eeeeee")
    //     .style("opacity", 0)


    function drawMap(geo, data) {
        //>>>  ????????
        simulation.stop;

        // add grid lines
        // var lines = svg.append("path")
        //     .datum(graticule)
        //     .attr("class", "graticule")
        //     .attr("d", geoPathGenerator)
        //     .style("fill", "none")
        //     .style("opacity", 0)
        ;

        basemap
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .style("opacity", 1)
            .style("stroke-opacity", 1)
        // .style("opacity", 1)

        xAxis
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .style("opacity", 0)


        circs = svg
            .selectAll('#dataPoints')
            .data(data)
            .join('circle')
            .attr("id", "dataPoints")
            .style("stroke", function(d){
                if (d.NRSRO == "N/A") {
               return "white";
         } else {
            return "yellow";
         }
       }
         )
            .attr("fill-opacity", 1)
            .style("z-index", 10)
            .attr("fill", function (d) {
                return fillScale(d.Branch);
            });

        circs.transition()
            .duration(2000)
            .style("stroke-width",  function(d){
                if (d.NRSRO == "N/A") {
               return 0;
         } else {
            return 0.5;
         }
       }
         )
            .attr("cx", function (d) {
                // console.log(projection([d.longitude, d.latitude]))
                return projection([d.Long, d.Lat])[0]
            })
            .attr("cy", function (d) { return projection([d.Long, d.Lat])[1] })
            // .attr("r", function (d) {
            //     return rScale(d.mag) / (scale / 1.2);
            // })
            .attr("r", 3)


        circs.on('mouseover', function (e, d) {
            d3.select(this)
                .style("stroke", "black");

            tooltip.style("visibility", "visible");
        })
            .on('mousemove', function (e, d) {
                let x = e.offsetX;
                let y = e.offsetY;

                tooltip.style("left", x + 20 + "px")
                    .style("top", y + "px")
                    .html(d.Name + "</br>" + d.Address);
            })
            .on('mouseout', function () {
                d3.select(this)
                .style("stroke", function(d){
                    if (d.NRSRO == "N/A") {
                   return "white";
             } else {
                return "yellow";
             }
           }
             );

                tooltip.style("visibility", "hidden");
            });



    }



    // d3.select("#Swarm").on("click", function () {

    //     swarm(data)
    // })


    d3.select("#Swarm2").on("click", function () {
        swarmBranches(data)
    })


    d3.select("#Swarm3").on("click", function () {

        swarm3(data)
    })


    d3.select("#Map").on("click", function () {
        simulation.stop()

        drawMap(geo, data)
    })







    // g.call(drag)
    // svg.call(zoom)
}
