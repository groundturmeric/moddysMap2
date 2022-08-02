

d3.csv("data/MoodysOfficesLocations.csv").then(function (data) {





    let allSpecies = data.map(function (d) {
        return d.Branch;
    })
    // console.log(speciesPerRow)
    let species = [...new Set(allSpecies)];
    console.log(allSpecies);

    // Moody's logo blue #052e9d    and    #090524
    fillScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(species)
    .range([ "#1a9fdc", "#b0ddd3", "#052e9d", "#f5943d"]);

    console.log(species)


    /*
    Chocolate bar review data 
    Downloaded from:
    http://flavorsofcacao.com/chocolate_database.html
    */
    console.log(data);

    /*
    BEGIN BY DEFINING THE DIMENSIONS OF THE SVG and CREATING THE SVG CANVAS
    */
    var width = document.querySelector("#chart").clientWidth;
    var height = document.querySelector("#chart").clientHeight;
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

        const tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "tooltip");

    /*
    CREATE SOME SCALES
    */

    // var xScale = d3.scaleLinear().domain([0, 2]).range([100, width - 100]);
    var xScale = d3.scaleBand()  //for categorical data 
        .domain(species)
        .range([50, width - 50]);

    var radius = 5;

    /*
    MAKE SOME MOCK DATA
    */
    // var numNodes = 200
    // var nodes = d3.range(numNodes).map(function (d, i) {
    //     return {
    //         radius: Math.random() * 25,
    //         category: i % 3
    //     }
    // })

    // CENTER SIMULATION
    // var simulation = d3.forceSimulation(nodes)
    //     // .force('center', d3.forceCenter(width / 2, height / 2).strength(0.1)) // pull nodes to a central point from top left
    //     .force('center', d3.forceCenter(width / 2, height / 2)) // pull nodes to a central point
    //     .force('charge', d3.forceManyBody().strength(1)) // send nodes away from eachother with negative force
    //     .force('collision', d3.forceCollide().radius(function (d) { // prevent circle overlap when collide
    //         return d.radius;
    //     }).strength(1.5))  // 1 for radius size circles just touching, more gives padding
    //     .on('tick', ticked);
    // console.log(nodes)

    // GROUPED SIMULATION
    // how many of these forces do we actually need?
    var simulation = d3.forceSimulation(data)
        // .force('charge', d3.forceManyBody().strength(0)) // send nodes away from eachother
        // .force('center', d3.forceCenter(width / 2, height / 2)) // pull nodes to a central point
        .force('x', d3.forceX().x(function (d) {
            return xScale(d.Branch);
        }).strength(1))
        .force('y', d3.forceY().y(function (d) {
            return height/2;
        }).strength(1))  //clusters bubbles on x axis, without force y they are like pods
        .force('collision', d3.forceCollide().radius(function (d) { // prevent circle overlap when collide
            return radius
        }))
        .on('tick', ticked);

    function ticked() {
        var u = svg
            .selectAll('circle')
            .data(data)
            .join('circle')
            .attr('r', function (d) {
                // return d.radius;
                return radius;
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
                .html(`name: <b>${d.Bar_name}</b><br>manufacturer: <b>${d.Company_Manufacturer}</b>`);

            // Optionally, visually highlight the selected circle
            u.attr("opacity", 0.1);
            d3.select(this).attr("opacity", 1).raise();

        }).on("mouseout", function () {
            // Reset tooltip and circles back to original appearance
            tooltip.style("visibility", "hidden");
            u.attr("opacity", 1);
        });

    }



    /*
DRAW AXES
*/
    const xAxis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height / 2 + 50})`)
        .call(d3.axisBottom().scale(xScale))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");;





});
