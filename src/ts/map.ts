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
    let currentScale = 1;

    regionMap.selectAll("path")
        .data(regions.features)
        .enter()
        .append("g")
        .append("path")
        .attr("d", path)
        .attr("class", function (d: Region) { return `${d.properties.nom} region`; })
        .attr("id", function (d: Region) { return "d" + d.properties.code; })
        .on("mouseover", function (d: Region) {
            d3.select(this)
        })
        .on("mouseout", function (d: Region) {
            d3.select(this)
        })
        .on("wheel", function (e: WheelEvent, d: Region) {
            // zoom on the mouse position
            const mouse = d3.pointer(e, this);

            currentScale += e.deltaY * -0.002;

            currentScale = Math.max(1, Math.min(8, currentScale));

            const scale = currentScale;
            const translate = [width / 2 - scale * mouse[0], height / 2 - scale * mouse[1]];

            regionMap.transition()
                .duration(750)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ") scale(" + scale + ")");

            e.preventDefault();
        })
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


    // add text containing names
    regionMap.selectAll("g").data(regions.features)
        .append("text")
        .attr("x", function (d: Region) { return path.centroid(d as any)[0]; })
        .attr("y", function (d: Region) { return path.centroid(d as any)[1] + 12; })
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .attr("class", "region-label")
        .html(function (d: Region) {
            const [bestMaleName, bestFemaleName] = dataset.filterByYearRange(2000, 2015).filterByRegion(parseRegionName(d.properties.nom)).getBestMaleAndFemaleName();
            
            return `<tspan x="${path.centroid(d as any)[0]}" dy="-1.2em">${bestMaleName}</tspan><tspan x="${path.centroid(d as any)[0]}" dy="1.2em">${bestFemaleName}</tspan>`;
        });
}