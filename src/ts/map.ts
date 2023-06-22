import * as d3 from "d3";
import { Region, regions } from "./loadRegionMapData";
import { Dataset, Sex } from "./dataset";
import { parseRegionName } from "./region";

export class InteractiveMap {
    private readonly width = 800;
    private readonly height = 800;

    private readonly centroids: { x: number, y: number }[];

    private readonly regionContainers: d3.Selection<d3.BaseType, any, SVGGElement, unknown>;

    private readonly dataset: Dataset;

    constructor(dataset: Dataset, minYear: number, maxYear: number) {

        this.dataset = dataset;

        const svg = d3.select('body').append("svg")
            .attr("id", "svg")
            .attr("class", "panel")
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

        this.regionContainers = regionMap.selectAll(".regionContainer")
            .data(regions.features);

        // Enter
        const newRegionContainers = this.regionContainers.enter()
            .append("g")
            .attr("class", "regionContainer");

        // Update
        this.regionContainers.merge(newRegionContainers as any)
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
        this.regionContainers.merge(newRegionContainers as any)
            .append("text")
            .attr("x", (d: Region, i: number) => this.centroids[i].x)
            .attr("y", (d: Region, i: number) => this.centroids[i].y + 12)
            .attr("class", "region-label")

        this.updateYearRange(minYear, maxYear);

        // Exit
        this.regionContainers.exit().remove();
    }

    updateYearRange(minYear: number, maxYear: number) {
        const bestNames = regions.features.map((d: Region) => {
            const filteredDataset = this.dataset.filterByRegionAndYearRange(parseRegionName(d.properties.nom), minYear, maxYear);
            const [bestMaleName, bestFemaleName] = filteredDataset.getBestMaleAndFemaleName();

            return [bestMaleName, bestFemaleName];
        });

        // see http://vrl.cs.brown.edu/color for good palettes
        const colorPalette = ["#b25aed", "#918cb4", "#239eb3", "#668e57", "#19a71f", "#577cf5", "#d76bac", "#f228a0"];

        const maleNameToColor = new Map<string, string>();
        const femaleNameToColor = new Map<string, string>();

        for (const [bestMaleName, bestFemaleName] of bestNames) {
            if (!maleNameToColor.has(bestMaleName)) {
                maleNameToColor.set(bestMaleName, colorPalette[maleNameToColor.size]);
            }
            if (!femaleNameToColor.has(bestFemaleName)) {
                femaleNameToColor.set(bestFemaleName, colorPalette[femaleNameToColor.size]);
            }
        }

        let currentSex: Sex;
        currentSex = Sex.Male;
        currentSex = Sex.Male;

        d3.selectAll(".region")
            .data(regions.features)
            .style("fill", function (d: Region, i: number) {
                const [bestMaleName, bestFemaleName] = bestNames[i];

                switch (currentSex) {
                    case Sex.Male:
                        return maleNameToColor.get(bestMaleName) as string;
                    case Sex.Female:
                        return femaleNameToColor.get(bestFemaleName) as string;
                }
            });



        d3.selectAll(".region-label")
            .data(regions.features)
            .html((d: Region, i: number) => {
                const [bestMaleName, bestFemaleName] = bestNames[i];
                return `<tspan class="bestMaleName" x="${this.centroids[i].x}" dy="-1.2em">${bestMaleName}</tspan><tspan class="bestFemaleName" x="${this.centroids[i].x}" dy="1.2em">${bestFemaleName}</tspan>`;
            });
    }
}