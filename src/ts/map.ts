import * as d3 from "d3";
import { Region, regions } from "./loadRegionMapData";
import { Dataset } from "./dataset";
import { parseRegionName } from "./region";

export function drawMap(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, dataset: Dataset) {

    const path = d3.geoPath();

    // get width and height of the SVG element
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const projection = d3.geoConicConformal()
        .center([2.454071, 46.279229])
        .scale(4000)
        .translate([width / 2, height / 2]);

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
        .on("click", function (e: PointerEvent, d: Region) {
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
                const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
                const translate = [width / 2 - scale * x, height / 2 - scale * y];

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
    const centroids = regions.features.map((d: Region) => ({
        x: path.centroid(d as any)[0],
        y: path.centroid(d as any)[1]
    }));

    // add text containing names
    regionContainers.merge(newRegionContainers as any)
        .append("text")
        .attr("x", (d: Region, i: number) => centroids[i].x)
        .attr("y", (d: Region, i: number) => centroids[i].y + 12)
        .attr("class", "region-label")
        .html(function (d: Region, i: number) {
            const filteredDataset = dataset.filterByRegionAndYearRange(parseRegionName(d.properties.nom), 1960, 2018);
            const [bestMaleName, bestFemaleName] = filteredDataset.getBestMaleAndFemaleName();

            return `<tspan x="${centroids[i].x}" dy="-1.2em">${bestMaleName}</tspan><tspan x="${centroids[i].x}" dy="1.2em">${bestFemaleName}</tspan>`;
        });

    // Exit
    regionContainers.exit().remove();
}