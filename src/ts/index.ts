import * as d3 from 'd3';
import { loadCSV } from './loadCSV';
import { departements } from './loadMapData'

import birthNamesCSV from '../assets/dpt2020.csv';
import '../styles/index.scss';

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

interface Departement {
    properties: {
        CODE_CHF: string;
        CODE_DEPT: string;
        CODE_REG: string;
        ID_GEOFLA: number;
        NOM_CHF: string;
        NOM_DEPT: string;
        NOM_REGION: string;
        X_CENTROID: number;
        X_CHF_LIEU: number;
        Y_CENTROID: number;
        Y_CHF_LIEU: number;
    }
}

deps.selectAll("path")
    .data(departements.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", function (d: Departement) { return `${d.properties.NOM_DEPT} departement`; })
    .attr("id", function (d: Departement) { return "d" + d.properties.CODE_DEPT; })



const data = await loadCSV(birthNamesCSV);

document.querySelector("#loader")?.remove();

console.log(data[0]);