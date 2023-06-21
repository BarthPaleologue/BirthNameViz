import * as d3 from "d3";
import { Region, regions } from "./loadRegionMapData";
import { Dataset } from "./dataset";
import { parseRegionName } from "./region";

export class InteractiveMap {
    readonly width = 800;
    readonly height = 800;

    readonly centroids: { x: number, y: number }[];

    constructor(dataset: Dataset, minYear: number, maxYear: number) {

        const svg = d3.select('body').append("svg")
            .attr("id", "svg")
            .attr("width", this.width)
            .attr("height", this.height);

        const path = d3.geoPath();

        const projection = d3.geoConicConformal()
            .center([2.454071, 46.279229])
            .scale(4000)
            .translate([this.width / 2, this.height / 2]);

        path.projection(projection);

        const regionMap = svg.append("g");

        let focusedRegion: Region | null = null;

        const regionContainers = regionMap.selectAll(".regionContainer")
            .data(regions.features);

        // Enter
        const newRegionContainers = regionContainers.enter()
            .append("g")
            .attr("class", "regionContainer");

        // Update
        regionContainers.merge(newRegionContainers as any)
            .append("path")
            .attr("d", path)
            .attr("class", (d: Region) => `${d.properties.nom} region`)
            .attr("id", (d: Region) => "d" + d.properties.code)
            .on("click", (e: PointerEvent, d: Region) => {
                if (focusedRegion === d) {
                    focusedRegion = null;

                    // zoom out
                    regionMap.transition()
                        .duration(750)
                        .style("stroke-width", "1.5px")
                        .attr("transform", "");

                    regionMap.selectAll(".region-label")
                        .transition()
                        .duration(750)
                        .attr("font-size", "12px");
                } else {
                    focusedRegion = d;

                    // zoom on the clicked region
                    const bounds = path.bounds(d as any);
                    const dx = bounds[1][0] - bounds[0][0];
                    const dy = bounds[1][1] - bounds[0][1];
                    const x = (bounds[0][0] + bounds[1][0]) / 2;
                    const y = (bounds[0][1] + bounds[1][1]) / 2;
                    const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / this.width, dy / this.height)));
                    const translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

                    regionMap.transition()
                        .duration(750)
                        .style("stroke-width", 1.5 / scale + "px")
                        .attr("transform", "translate(" + translate + ") scale(" + scale + ")");


                    regionMap.selectAll(".region-label")
                        .transition()
                        .duration(750)
                        .attr("font-size", "5px");
                }
            });

        // precompute centroids
        this.centroids = regions.features.map((d: Region) => ({
            x: path.centroid(d as any)[0],
            y: path.centroid(d as any)[1]
        }));

        // add text containing names
        regionContainers.merge(newRegionContainers as any)
            .append("text")
            .attr("x", (d: Region, i: number) => this.centroids[i].x)
            .attr("y", (d: Region, i: number) => this.centroids[i].y + 12)
            .attr("class", "region-label")
            .html((d: Region, i: number) => {
                const filteredDataset = dataset.filterByRegionAndYearRange(parseRegionName(d.properties.nom), minYear, maxYear);
                const [bestMaleName, bestFemaleName] = filteredDataset.getBestMaleAndFemaleName();

                return `<tspan class="bestMaleName" x="${this.centroids[i].x}" dy="-1.2em">${bestMaleName}</tspan><tspan class="bestFemaleName" x="${this.centroids[i].x}" dy="1.2em">${bestFemaleName}</tspan>`;
            });

        // Exit
        regionContainers.exit().remove();
    }

    updateYearRange(minYear: number, maxYear: number) {
        d3.selectAll(".region-label")
            .data(regions.features)
            .html((d: Region, i: number) => {
                const filteredDataset = window.dataset.filterByRegionAndYearRange(parseRegionName(d.properties.nom), minYear, maxYear);
                const [bestMaleName, bestFemaleName] = filteredDataset.getBestMaleAndFemaleName();

                return `<tspan class="bestMaleName" x="${this.centroids[i].x}" dy="-1.2em">${bestMaleName}</tspan><tspan class="bestFemaleName" x="${this.centroids[i].x}" dy="1.2em">${bestFemaleName}</tspan>`;
            });
    }
}