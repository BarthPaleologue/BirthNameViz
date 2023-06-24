import * as d3 from "d3";
import { Dataset } from "./dataset";
import { MAX_YEAR, MIN_YEAR } from "./settings";

// Create a graph class that will be used to create the popularity graph with d3
export class PopularityGraph {
    dataset: Dataset;

    filteredName: string | null = null;

    popularity: Map<number, number> = new Map<number, number>();

    svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;

    x: d3.ScaleLinear<number, number, never>;
    y: d3.ScaleLinear<number, number, never>;

    constructor(dataset: Dataset) {
        this.dataset = dataset;

        this.filteredName = "Jean";

        this.popularity = dataset.getPercentageByYearForName(this.filteredName);

        const years = Array.from(this.popularity.keys());
        const percentages = Array.from(this.popularity.values()).map((v) => v);

        // normalize the percentages
        const maxPercentage = Math.max(...percentages);
        percentages.forEach((v, i) => {
            percentages[i] = 100 * v / maxPercentage;
        });

        // We create the svg element
        this.svg = d3.select("#viz").append("svg")
            .attr("class", "panel")
            .attr("width", 800)
            .attr("height", 350);

        // We create the x axis
        this.x = d3.scaleLinear()
            .domain([MIN_YEAR, MAX_YEAR])
            .range([0, 800]);

        // We create the y axis
        this.y = d3.scaleLinear()
            .domain([0, 100])
            .range([0, 350]);

        // Add a rect for each yearHow do baby names evolve over time? Are there names that have consistently remained popular or unpopular? Are there some that have were suddenly or briefly popular or unpopular? Are there trends in time
        this.svg.selectAll("rect")
            .data(this.popularity)
            .enter()
            .append("rect")
            .attr("x", (d, i) => this.x(years[i]))
            .attr("y", (d, i) => 350 - this.y(percentages[i]))
            .attr("width", 0.9 * 800 / (MAX_YEAR - MIN_YEAR))
            .attr("height", (d, i) => this.y(percentages[i]))
            .attr("fill", "blue");

        // Add the x axis and label
        this.svg.append("g")
            .attr("transform", `translate(0, 350)`)
            .call(d3.axisBottom(this.x));
        this.svg.append("text")
            .attr("x", 400)
            .attr("y", 350)
            .attr("text-anchor", "middle")
            .text("Année");

        // Add the y axis and label, remove the domain line
        this.svg.append("g")
            .call(d3.axisLeft(this.y).tickSize(0));
        this.svg.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("transform", `translate(-50, 175) rotate(-90)`)
            .text("Popularité");

        // Add the title
        this.svg.append("text")
            .attr("x", 400)
            .attr("y", 20)
            .attr("class", "popularity-title")
            .attr("text-anchor", "middle")
            .text(`Popularité du prénom ${this.filteredName}`);

        // Add a tooltip that displays the name when you hover over the rectanble
        this.svg.selectAll("rect")
            .data(this.popularity)
            .on("mouseover", (e: MouseEvent, d) => {
                this.svg.append("text")
                    .attr("id", "tooltip")
                    .attr("x", e.clientX)
                    .attr("y", 350 - e.clientY - 10)
                    .attr("text-anchor", "middle")
                    .text(this.filteredName + ": " + d[1].toFixed(2) + "%" + "année: " + d[0]);
                console.log(this.filteredName + " : " + d[1].toFixed(2) + "%" + "année: " + d[0]);
            });

        // Remove the tooltip when you stop hovering over the rectangle
        this.svg.selectAll("rect")
            .on("mouseout", (i, d) => {
                this.svg.select("#tooltip").remove();
            });
    }

    filterByName(name: string | null) {
        if (this.filteredName === name) return;
        if (name === null) name = "Jean";
        this.filteredName = name;

        this.popularity = this.dataset.getPercentageByYearForName(this.filteredName);

        const years = Array.from(this.popularity.keys());
        const percentages = Array.from(this.popularity.values()).map((v) => v);

        // normalize the percentages
        const maxPercentage = Math.max(...percentages);
        percentages.forEach((v, i) => {
            percentages[i] = 100 * v / maxPercentage;
        });

        this.svg.selectAll("rect")
            .data(this.popularity)
            .attr("x", (d, i) => this.x(years[i]))
            .attr("y", (d, i) => 350 - this.y(percentages[i]))
            .attr("width", 0.9 * 800 / (MAX_YEAR - MIN_YEAR))
            .attr("height", (d, i) => this.y(percentages[i]))
            .attr("fill", "blue");

        this.svg.select(".popularity-title")
            .text(`Popularité du prénom ${this.filteredName}`);
    }
}

export class popularityCurve {

    // popularity curve

    constructor(namesPopularity: string[]) {
        const svg = d3.select("#viz").append("svg")
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