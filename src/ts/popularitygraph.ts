import * as d3 from "d3";
import { Dataset } from "./dataset";
import { MAX_YEAR, MIN_YEAR } from "./settings";

// Create a graph class that will be used to create the popularity graph with d3
export class PopularityGraph {
    dataset: Dataset;

    filteredName: string | null = null;

    // popularity = Dataset.getNamesPopularity();
    constructor(dataset: Dataset) {
        this.dataset = dataset;

        this.filteredName = "Jean";

        // map<year, number>
        const popularity = dataset.getPercentageByYearForName(this.filteredName);

        console.log(popularity)

        const years = Array.from(popularity.keys());
        const percentages = Array.from(popularity.values()).map((v) => v);

        // normalize the percentages
        const maxPercentage = Math.max(...percentages);
        percentages.forEach((v, i) => {
            percentages[i] = 100 * v / maxPercentage;
        });

        console.log(years);
        console.log(percentages);

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

        // Add a rect for each yearHow do baby names evolve over time? Are there names that have consistently remained popular or unpopular? Are there some that have were suddenly or briefly popular or unpopular? Are there trends in time
        svg.selectAll("rect")
            .data(popularity)
            .enter()
            .append("rect")
            .attr("x", (d, i) => x(years[i]))
            .attr("y", (d, i) => 350 - y(percentages[i]))
            .attr("width", 0.9 * 800 / (MAX_YEAR - MIN_YEAR))
            .attr("height", (d, i) => y(percentages[i]))
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
            .text(`Popularité du prénom ${this.filteredName}`);

        // Add a tooltip that displays the name when you hover over the rectanble
        svg.selectAll("rect")
            .data(popularity)
            .on("mouseover", (e: MouseEvent, d) => {
                svg.append("text")
                    .attr("id", "tooltip")
                    .attr("x", x(e.clientX))
                    .attr("y", 350 - y(e.clientY) - 10)
                    .attr("text-anchor", "middle")
                    .text(this.filteredName + ": " + d[1].toFixed(2) + "%" + "année: " + d[0]);
                console.log(this.filteredName + " : " + d[1].toFixed(2) + "%" + "année: " + d[0]);
            }
            );

        // Remove the tooltip when you stop hovering over the rectangle
        svg.selectAll("rect")
            .on("mouseout", (i, d) => {
                svg.select("#tooltip").remove();
            });
    }

    setFilteredName(name: string | null) {
        if(this.filteredName === name) return;
        this.filteredName = name;
    }
}

export class popularityCurve {

    // popularity curve

    constructor(namesPopularity: string[]) {
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
            .range([0, 800]);


        // Create a curve graph


        // ...

        return svg;

    }

}