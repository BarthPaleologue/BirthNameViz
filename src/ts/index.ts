import * as d3 from 'd3';

import birthNamesCSV from '../assets/dpt2020.csv';
import '../styles/index.scss';
import { Dataset, Sex } from './dataset';
import { drawMap } from './map';

// most of this code comes from https://www.datavis.fr/d3js/map-firststep

const width = 800;
const height = 800;

const svg = d3.select('body').append("svg")
    .attr("id", "svg")
    .attr("width", width)
    .attr("height", height);

const dataset = new Dataset();
window.dataset = dataset;

await dataset.loadCSV(birthNamesCSV);
dataset.optimize();

console.log(dataset.filterByYearRange(1990, 2015).filterByDepartement(75).filterByName("Daniel").toArray());

console.log(dataset.filterByYearRange(1990, 2015).filterByName("Manon").aggregateByYear());

console.log(dataset.filterByYearRange(1960, 2015).filterByName("Claude").filterBySex(Sex.Female).aggregateByYear());

console.log(dataset.getBestYearFor("Adrien"));

const data = dataset.toArray();

document.querySelector("#loader")?.remove();

console.log(data[0]);

drawMap(svg, dataset);