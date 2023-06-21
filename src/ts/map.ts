import * as d3 from "d3";
import { Departement, departements } from "./loadMapData";

export function drawMap(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>) {

    const path = d3.geoPath();

    // get width and height of the SVG element
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const projection = d3.geoConicConformal()
        .center([2.454071, 46.279229])
        .scale(4000)
        .translate([width / 2, height / 2]);
    
    path.projection(projection);

    const departementMap = svg.append("g")
    .attr("id", "departements");

let focusedDepartement: Departement | null = null;
let currentScale = 1;

departementMap.selectAll("path")
    .data(departements.features)
    .enter()
    .append("g")
    .append("path")
    .attr("d", path)
    .attr("class", function (d: Departement) { return `${d.properties.NOM_DEPT} departement`; })
    .attr("id", function (d: Departement) { return "d" + d.properties.CODE_DEPT; })
    .on("mouseover", function (d: Departement) {
        d3.select(this)
    })
    .on("mouseout", function (d: Departement) {
        d3.select(this)
    })
    .on("wheel", function (e: WheelEvent, d: Departement) {
        // zoom on the mouse position
        const mouse = d3.pointer(e, this);
        
        currentScale += e.deltaY * -0.002;

        currentScale = Math.max(1, Math.min(8, currentScale));

        const scale = currentScale;
        const translate = [width / 2 - scale * mouse[0], height / 2 - scale * mouse[1]];

        departementMap.transition()
            .duration(750)
            .style("stroke-width", 1.5 / scale + "px")
            .attr("transform", "translate(" + translate + ") scale(" + scale + ")");

        e.preventDefault();
    })
    .on("click", function (e: PointerEvent, d: Departement) {
        if (focusedDepartement === d) {
            focusedDepartement = null;

            // zoom out
            departementMap.transition()
                .duration(750)
                .style("stroke-width", "1.5px")
                .attr("transform", "");

            departementMap.selectAll(".departement-label")
                .transition()
                .duration(750)
                .attr("font-size", "12px");
        } else {
            focusedDepartement = d;

            // zoom on the clicked departement
            const bounds = path.bounds(d as any);
            const dx = bounds[1][0] - bounds[0][0];
            const dy = bounds[1][1] - bounds[0][1];
            const x = (bounds[0][0] + bounds[1][0]) / 2;
            const y = (bounds[0][1] + bounds[1][1]) / 2;
            const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
            const translate = [width / 2 - scale * x, height / 2 - scale * y];

            departementMap.transition()
                .duration(750)
                .style("stroke-width", 1.5 / scale + "px")
                .attr("transform", "translate(" + translate + ") scale(" + scale + ")");


            departementMap.selectAll(".departement-label")
                .transition()
                .duration(750)
                .attr("font-size", "5px");
        }
    });

// add text containing departement number
departementMap.selectAll("g")
    .data(departements.features)
    .append("text")
    .attr("x", function (d: Departement) { return path.centroid(d as any)[0]; })
    .attr("y", function (d: Departement) { return path.centroid(d as any)[1]; })
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "black")
    .attr("class", "departement-label")
    .text(function (d: Departement) { return d.properties.CODE_DEPT; });
}