import * as d3 from "d3";
import { Region, regions } from "./loadRegionMapData";
import { Dataset, Sex } from "./dataset";
import { parseRegionName } from "./region";

enum MapMode {
    BestName,
    NamePopularity
}

export class InteractiveMap {
    private readonly width = 800;
    private readonly height = 800;

    private minYear: number;
    private maxYear: number;

    private readonly centroids: { x: number, y: number }[];

    private readonly regionContainers: d3.Selection<d3.BaseType, any, SVGGElement, unknown>;

    private readonly dataset: Dataset;

    private mode: MapMode = MapMode.BestName;

    private filteredName: string | null = null;

    // see http://vrl.cs.brown.edu/color for good palettes
    private colorPalette = ["#5f86b7", "#48a421", "#b25aed", "#6f7d43", "#f90da0", "#0ba47e", "#eb1241", "#bd854a", "#6778f5", "#e96c2e"];
    private nameToColor = new Map<string, string>();

    constructor(dataset: Dataset, minYear: number, maxYear: number) {

        this.dataset = dataset;
        this.minYear = minYear;
        this.maxYear = maxYear;

        const svg = d3.select('#viz').append("svg")
            .attr("id", "svg")
            .attr("class", "panel")
            .attr("width", this.width)
            .attr("height", this.height);

        const path = d3.geoPath();

        const projection = d3.geoConicConformal()
            .center([2.454071, 46.279229])
            .fitSize([this.width, this.height], regions as any)
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
        this.minYear = minYear;
        this.maxYear = maxYear;

        switch (this.mode) {
            case MapMode.BestName:
                this.updateBestNameRepresentation();
                break;
            case MapMode.NamePopularity:
                this.updateNamePopularityRepresentation();
                break;
        }
    }

    private updateBestNameRepresentation() {
        const bestNamesBothSex: [string, string][] = regions.features.map((d: Region) => {
            const filteredDataset = this.dataset.filterByRegionAndYearRange(parseRegionName(d.properties.nom), this.minYear, this.maxYear);
            const [bestMaleName, bestFemaleName] = filteredDataset.getBestMaleAndFemaleName();

            return [bestMaleName, bestFemaleName];
        });

        const bestMaleNames = bestNamesBothSex.map((d: [string, string]) => d[0]);
        const bestFemaleNames = bestNamesBothSex.map((d: [string, string]) => d[1]);


        let currentSex = 1 > 0 ? Sex.Male : Sex.Female;

        const bestNames = currentSex === Sex.Male ? bestMaleNames : bestFemaleNames;

        // iterate over nameToColor and remove the entries that are not in bestMaleNames or bestFemaleNames
        for (const [name, color] of this.nameToColor) {
            if (!bestNames.includes(name)) {
                this.nameToColor.delete(name);
                this.colorPalette.push(color);
            }
        }

        console.log("Persisted:", this.nameToColor.size);

        for (const name of bestNames) {
            if (this.nameToColor.has(name)) continue;

            const color = this.colorPalette.pop();
            if (color === undefined) throw new Error("No more colors available");
            this.nameToColor.set(name, color);
        }

        d3.selectAll(".region")
            .data(regions.features)
            .style("fill", (d: Region, i: number) => {
                const bestMaleName = bestMaleNames[i];
                const bestFemaleName = bestFemaleNames[i];

                return this.nameToColor.get(currentSex === Sex.Male ? bestMaleName : bestFemaleName) as string;
            });



        d3.selectAll(".region-label")
            .data(regions.features)
            .html((d: Region, i: number) => {
                const [bestMaleName, bestFemaleName] = bestNamesBothSex[i];
                return `<tspan class="bestMaleName" x="${this.centroids[i].x}" dy="-1.2em">${bestMaleName}</tspan><tspan class="bestFemaleName" x="${this.centroids[i].x}" dy="1.2em">${bestFemaleName}</tspan>`;
            });
    }

    public filterByName(name: string | null) {
        this.filteredName = name;

        if (this.filteredName === null && this.mode === MapMode.NamePopularity) {
            this.mode = MapMode.BestName;
            this.updateBestNameRepresentation();
        } else if (this.filteredName !== null && this.mode === MapMode.BestName) {
            this.mode = MapMode.NamePopularity;
            this.updateNamePopularityRepresentation();
        } else if (this.filteredName !== null && this.mode === MapMode.NamePopularity) {
            this.updateNamePopularityRepresentation();
        }
    }

    private updateNamePopularityRepresentation() {
        if (this.filteredName === null) throw new Error("Cannot update name popularity representation without a name filter");

        const rankings = regions.features.map((d: Region) => {
            const filteredDataset = this.dataset.filterByRegionAndYearRange(parseRegionName(d.properties.nom), this.minYear, this.maxYear);

            /*const filteredByName = filteredDataset.filterByName(this.filteredName as string);

            const accrossYears = filteredByName.aggregateByYear();

            const summedPopularity = accrossYears.reduce((acc, cur) => acc + cur.nombre, 0);*/

            return filteredDataset.getRankingOfName(this.filteredName as string);
        });

        // normalize the popularity values
        const normalizedPopularities = rankings.map((ranking: [number | null, number]) => {
            const nameCount = ranking[1];
            const rank = ranking[0] ?? nameCount;

            return (nameCount - rank + 1) / nameCount;
        });

        const colorScale = d3.scaleSequential(d3.interpolateBuPu)

        d3.selectAll(".region")
            .data(regions.features)
            .style("fill", function (d: Region, i: number) {
                return colorScale(normalizedPopularities[i]);
            });

        d3.selectAll(".region-label")
            .data(regions.features)
            .text((d: Region, i: number) => {
                const ranking = rankings[i][0];
                const nameCount = rankings[i][1];

                if (ranking === null) {
                    return ``;
                } else {
                    return `${ranking}e / ${nameCount}`;
                }
            });
    }
}