

var drawCurve = function(svgSelector, data) {
    var flat_data = [].concat.apply([], data);
    var $element = $(svgSelector);
    var w = $element.width()/2,
        h = $element.height()/2,
        margin = 10,
        y = d3.scale.linear().domain([d3.min(flat_data), 0]).range([margin, h - margin]),
        x = d3.scale.linear().domain([0, data[0].length]).range([margin, w - margin]);

    var vis = d3.select(svgSelector)
        .attr("width", w)
        .attr("height", h);
    vis.selectAll("*").remove();

    var g = vis.append("svg:g")
        .attr("transform", "translate("+margin+","+(2*h)+")");


    var line = d3.svg.line()
        .x(function(d,i) { return x(i); })
        .y(function(d) { return -1 * y(d); });

    /*
     var area = d3.svg.area()
     .x(function(d,i) { return x(i); })
     .y0(function() { return -50 ; })
     .y1(function(d) { return -1 * y(d); });
     */

    for(var i = 0; i < data.length; ++i) {
        g.append("svg:path").attr("d", line(data[i]));
    }

    //x-as
    g.append("svg:line")
        .attr("x1", x(0))
        .attr("y1", -1 * y(0))
        .attr("x2", x(w))
        .attr("y2", -1 * y(0));

    //y-as
    g.append("svg:line")
        .attr("x1", x(0))
        .attr("y1", -1 * y(0))
        .attr("x2", x(0))
        .attr("y2", -2 * y(d3.min(flat_data))+20); //Aangezien het geschaald is x2, maar de waarden gelijk blijven ..


    //X-as labels
    g.selectAll(".xLabel")
        .data(x.ticks(15))
        //.enter().append("svg:text")
        .attr("class", "xLabel")
        .text(String)
        .attr("x", function(d) { return 2*x(d) })
        .attr("y", -382)
        .attr("text-anchor", "middle");



    //Y-as labels
    g.selectAll(".yLabel")
        .data(y.ticks(15))
        .enter().append("svg:text")
        .attr("class", "yLabel")
        .text(String)
        .attr("x", 0)
        .attr("y", function(d) { return -2 * y(d)})
        .attr("text-anchor", "middle")
        .attr("dy", 2);


    g.selectAll(".xTicks")
        .data(x.ticks(15))
        .enter().append("svg:line")
        .attr("class", "xTicks")
        .attr("x1", function(d) { return x(d); })
        .attr("y1", -1 * y(0))
        .attr("x2", function(d) { return x(d); })
        .attr("y2", -1 * y(-0.3));

    g.selectAll(".yTicks")
        .data(y.ticks(15))
        .enter().append("svg:line")
        .attr("class", "yTicks")
        .attr("y1", function(d) { return -1 * y(d); })
        .attr("x1", x(-0.1))
        .attr("y2", function(d) { return -1 * y(d); })
        .attr("x2", x(0));
};
