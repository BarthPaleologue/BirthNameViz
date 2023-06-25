import * as d3 from "d3";
import { Dataset } from "./dataset";
import { MAX_YEAR, MIN_YEAR } from "./settings";
import { RegionName } from "./region";

// Create a graph class that will be used to create the popularity graph with d3
export class PopularityGraph {
    private dataset: Dataset;

    private filteredName: string | null = null;
    private filteredRegion: RegionName | null = null;

    private popularityByRegion: Map<RegionName, Map<number, number>> | null = null;
    private popularityNational: Map<number, number> | null = null;

    private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;

    private x: d3.ScaleLinear<number, number, never>;
    private y: d3.ScaleLinear<number, number, never>;

    private minYear: number;
    private maxYear: number;

    private readonly width = (window.innerWidth - 70) / 2;
    private readonly height = 400;

    private onYearRangeChangedCallbacks: ((minYear: number, maxYear: number) => void)[] = [];

    constructor(dataset: Dataset, minYear: number, maxYear: number) {
        this.dataset = dataset;

        this.minYear = minYear;
        this.maxYear = maxYear;

        this.filteredName = null;

        this.popularityByRegion = this.dataset.getPercentageByRegionByYearForName('Jean');
        this.popularityNational = this.dataset.getNationalPercentageByYearForName('Jean');

        const years = Array.from(this.popularityNational.keys());
        const percentages = Array.from(this.popularityNational.values()).map((v) => v);

        // normalize the percentages
        const maxPercentage = Math.max(...percentages);

        percentages.forEach((v, i) => {
            percentages[i] = 100 * v / maxPercentage;
        });

        // We create the svg element
        this.svg = d3.select("#viz").append("svg")
            .attr("id", "popularityPanel")
            .attr("class", "panel")
            .attr("width", this.width)
            .attr("height", this.height);

        // We create the x axis
        this.x = d3.scaleLinear()
            .domain([MIN_YEAR, MAX_YEAR])
            .range([50, this.width - 50]);

        // We create the y axis
        this.y = d3.scaleLinear()
            .domain([0, 100])
            .range([0, this.height - 100]);

        // Add a rect for each yearHow do baby names evolve over time? Are there names that have consistently remained popular or unpopular? Are there some that have were suddenly or briefly popular or unpopular? Are there trends in time
        this.svg.selectAll("rect")
            .data(this.popularityNational)
            .enter()
            .append("rect")
            .attr("x", (d, i) => this.x(years[i]))
            .attr("y", (d, i) => 350 - this.y(percentages[i]))
            .attr("width", 0.9 * 800 / (MAX_YEAR - MIN_YEAR))
            .attr("height", (d, i) => this.filteredName ? this.y(percentages[i]) : 0)
            .attr("fill", (d, i) => (years[i] >= this.minYear && years[i] <= this.maxYear) ? "blue" : "grey");

        // Add the x axis and label
        this.svg.append("g")
            .attr("transform", `translate(0, 350)`)
            .call(d3.axisBottom(this.x));
        this.svg.append("text")
            .attr("x", 400)
            .attr("y", 390)
            .attr("text-anchor", "middle")
            .text("Année");

        // Add the y axis and label, remove the domain line
        this.svg.append("g")
            .attr("transform", `translate(50, 0)`)
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
            .attr("y", this.height / 2)
            .attr("class", "popularity-title")
            .attr("text-anchor", "middle")
            .text(`Enter a name to see its popularity over time`);

        // Add a tooltip that displays the name when you hover over the rectanble
        this.svg.selectAll("rect")
            .data(this.popularityNational)
            .on("mouseover", (e: MouseEvent, d) => {
                d3.select('#tooltip').remove();
                d3.select("body").append("p")
                    .attr("id", "tooltip")
                    .style("position", "absolute")
                    .style("left", (e.pageX + 10) + "px")
                    .style("top", (e.pageY - 10) + "px")
                    .text(`${d[0]}: ${d[1].toFixed(2)}%`);
            })

        // when drag selecting a range of years, log the min and max year
        this.svg.on("mousedown", (e: MouseEvent) => {
            if (this.filteredName === null) return;

            const x = e.offsetX;
            const y = e.offsetY;

            const rect = this.svg.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", 0)
                .attr("height", 0)
                .attr("fill", "grey")
                .attr("opacity", 0.5);

            const mousemove = (e: MouseEvent) => {
                const x = e.offsetX;
                const y = e.offsetY;

                rect.attr("width", Math.max(0, x - parseInt(rect.attr("x"))))
                    .attr("height", Math.max(0, y - parseInt(rect.attr("y"))));
            }

            const mouseup = (e: MouseEvent) => {
                const x = e.offsetX;

                const year1 = Math.floor(this.x.invert(parseInt(rect.attr("x"))));
                const year2 = Math.floor(this.x.invert(x));

                // this is a weakness, here the callback will trigger the selector that will change the year range here.
                // this breaks encapsulation
                // there should be an origin mechanism for callbacks to know where they come from so we would not fear loops
                if (Math.abs(year1 - year2) > 0) this.dispatchYearRangeChanged(Math.min(year1, year2), Math.max(year1, year2));

                rect.remove();
                this.svg.on("mousemove", null);
                this.svg.on("mouseup", null);
            }

            this.svg.on("mousemove", mousemove);
            this.svg.on("mouseup", mouseup);
        });

        // Remove the tooltip when you stop hovering over the rectangle
        this.svg.selectAll("rect")
            .on("mouseout", (e, d) => {
                d3.select("#tooltip").remove();
            });
    }

    setYearRange(minYear: number, maxYear: number) {
        if (this.minYear === minYear && this.maxYear === maxYear) return;
        this.minYear = minYear;
        this.maxYear = maxYear;

        if (this.filteredName === null) return;

        this.update();
    }

    filterByName(name: string | null) {
        if (this.filteredName === name) return;
        else this.filteredName = name;

        if (this.filteredName === null) {
            d3.select('.popularity-title')
                .attr("y", this.height / 2)
                .text("Enter a name to see its popularity over time");
            d3.selectAll("rect")
                .attr("height", 0);
        } else {
            this.popularityByRegion = this.dataset.getPercentageByRegionByYearForName(this.filteredName);
            this.popularityNational = this.dataset.getNationalPercentageByYearForName(this.filteredName);

            this.update();
        }
    }

    filterByRegion(region: RegionName | null) {
        console.log(region);
        if (this.filteredRegion === region) return;
        this.filteredRegion = region;

        if (this.filteredName === null) return;

        this.update();
    }

    private update() {
        if (this.popularityByRegion === null) throw new Error("Popularity by region is null");
        if (this.popularityNational === null) throw new Error("Popularity national is null");

        const popularity = this.filteredRegion === null ? this.popularityNational : this.popularityByRegion.get(this.filteredRegion);
        if (popularity === undefined) throw new Error(`Could not get popularity for region ${this.filteredRegion}`);

        const years = Array.from(popularity.keys());
        const percentages = Array.from(popularity.values()).map((v) => v);

        // for years that are not in the dataset, we set the popularity to 0
        for (let year = MIN_YEAR; year <= MAX_YEAR; year++) {
            if (years.includes(year)) continue;
            years.push(year);
            percentages.push(0);
        }

        // normalize the percentages
        const maxPercentage = Math.max(...percentages);
        percentages.forEach((v, i) => percentages[i] = 100 * v);

        const popularities = years.map((v, i) => [years[i], percentages[i]]);

        this.svg.selectAll("rect")
            .data(popularities)
            .attr("x", (d, i) => this.x(years[i]))
            .attr("y", (d, i) => 350 - this.y(percentages[i] / maxPercentage))
            .attr("width", 0.9 * 800 / (MAX_YEAR - MIN_YEAR))
            .attr("height", (d, i) => this.y(percentages[i] / maxPercentage))
            .attr("fill", (d, i) => (years[i] >= this.minYear && years[i] <= this.maxYear) ? "blue" : "grey");

        this.svg.select(".popularity-title")
            .attr("y", 20)
            .text(`Popularité du prénom ${this.filteredName}`);
    }

    public addOnYearRangeChangedCallback(callback: (minYear: number, maxYear: number) => void) {
        this.onYearRangeChangedCallbacks.push(callback);
    }

    public dispatchYearRangeChanged(minYear: number, maxYear: number) {
        this.onYearRangeChangedCallbacks.forEach((callback) => callback(minYear, maxYear));
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