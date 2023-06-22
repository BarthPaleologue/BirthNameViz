import * as d3 from "d3";
import {NamePopularity} from "./dataset";

const MIN_YEAR = 1900;
const MAX_YEAR = 2019;

// Create a graph class that will be used to create the popularity graph with d3
export class PopularityGraph {

    // popularity = Dataset.getNamesPopularity();
    constructor(popularity: NamePopularity[]) {
        // We create the svg element
        const svg = d3.select("body").append("svg")
            .attr("width", 800)
            .attr("height", 350);

        // We create the x axis
        const x = d3.scaleLinear()
            .domain([MIN_YEAR, MAX_YEAR])
            .range([0, 800]);

        // We create the y axis
        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([0, 350]);

        // Add a rect for each year
        svg.selectAll("rect")
            .data(popularity)
            .enter()
            .append("rect")
            .attr("x", (d, i) => x(d.year))
            .attr("y", (d, i) => 350 - y(d.percentage))
            .attr("width", 800 / (MAX_YEAR - MIN_YEAR))
            .attr("height", (d, i) => y(d.percentage))
            .attr("fill", "blue");

        // Add the x axis and label
        svg.append("g")
            .attr("transform", `translate(0, 350)`)
            .call(d3.axisBottom(x));
        svg.append("text")
            .attr("x", 400)
            .attr("y", 350)
            .attr("text-anchor", "middle")
            .text("Année");

        // Add the y axis and label, remove the domain line
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(0));
        svg.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("transform", `translate(-50, 175) rotate(-90)`)
            .text("Popularité");

        // Add the title
        svg.append("text")
            .attr("x", 400)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text("Popularité du prénom");

        // Add a tooltip that displays the name when you hover over the rectanble
        svg.selectAll("rect")
            .on("mouseover", (i, d) => {
                svg.append("text")
                    .attr("id", "tooltip")
                    .attr("x", x(i.year))
                    .attr("y", 350 - y(i.percentage) - 10)
                    .attr("text-anchor", "middle")
                    .text(i.name);
            }
            );

        // Remove the tooltip when you stop hovering over the rectangle
        svg.selectAll("rect")
            .on("mouseout", (i, d) => {
                svg.select("#tooltip").remove();
            });

        return svg;
    }
}