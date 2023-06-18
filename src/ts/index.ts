import * as d3 from 'd3';
import { Departement, departements } from './loadMapData'

import birthNamesCSV from '../assets/dpt2020.csv';
import '../styles/index.scss';
import { Dataset, Sex } from './dataset';

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
    .attr("d", path)
    .attr("class", function (d: Departement) { return `${d.properties.NOM_DEPT} departement`; })
    .attr("id", function (d: Departement) { return "d" + d.properties.CODE_DEPT; })

const dataset = new Dataset();
window.dataset = dataset;

await dataset.loadCSV(birthNamesCSV);

console.log(dataset.filterByYearRange(1990, 2015).filterByDepartement(75).filterByName("Daniel").toArray());

console.log(dataset.filterByYearRange(1990, 2015).filterByName("Manon").aggregateByYear());

console.log(dataset.filterByYearRange(1960, 2015).filterByName("Claude").filterBySex(Sex.Female).aggregateByYear());

console.log(dataset.getBestYearFor("Adrien"));

const data = dataset.toArray();

document.querySelector("#loader")?.remove();

console.log(data[0]);