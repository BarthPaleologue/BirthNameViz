import * as d3 from 'd3';

import departementsJSON from '../assets/departments.json'
import '../styles/index.scss';

// declare the type of the imported JSON
interface GeoJSON {
    type: string;
    features: any[];
    bbox: number[];
}

// enforce type checking on the imported JSON
const departements: GeoJSON = departementsJSON;

console.log(departements);

// most of this code comes from https://www.datavis.fr/d3js/map-firststep

const width = 975;
const height = 610;

const path = d3.geoPath();

const projection = d3.geoConicConformal()
    .center([2.454071, 46.279229])
    .scale(2600)
    .translate([width / 2, height / 2]);

path.projection(projection);

const svg = d3.select('body').append("svg")
    .attr("id", "svg")
    .attr("width", width)
    .attr("height", height);

const deps = svg.append("g")
    .attr("id", "departements");

deps.selectAll("path")
    .data(departements.features)
    .enter()
    .append("path")
    .attr("d", path as any)
    .attr("class", "departement")