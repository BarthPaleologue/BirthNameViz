import * as d3 from 'd3';

import departementsJSON from '../assets/departments.json'
import birthNamesCSV from '../assets/dpt2020.csv';
import '../styles/index.scss';

////////////Constants////////////
const widthColumn1 = 975;
const heightMap = 610;
const heightSelectors = 200;
const minYear = 1900; //TODO: Change that according to the data
const maxYear = 2010; //TODO: Change that according to the data


////////////Interfaces////////////
// declare the type of the imported JSON
interface GeoJSON {
    type: string;
    features: any[];
    bbox: number[];
}

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


////////////Loading data////////////
// load csv
d3.csv(birthNamesCSV).then(function (data) {
    console.log(data);
});

////////////Seletor pannel////////////
const selectors = d3.select('body').append("div")
    .attr("class", "pannel")
    .attr("id", "selectors")
    .attr("width", widthColumn1)
    .attr("height", heightSelectors);

const periodSel = selectors.append("div");

periodSel.append("input")
    .attr("type", "range")
    .attr("id", "period")
    .attr("min", minYear)
    .attr("max", maxYear);

periodSel.append("label").html("Period");

////////////Map pannel////////////

// enforce type checking on the imported JSON
const departements: GeoJSON = departementsJSON;

console.log(departements);

// most of this code comes from https://www.datavis.fr/d3js/map-firststep

const path = d3.geoPath();

const projection = d3.geoConicConformal()
    .center([2.454071, 46.279229])
    .scale(2600)
    .translate([widthColumn1 / 2, heightMap / 2]);

path.projection(projection);

const map = d3.select('body').append("svg")
    .attr("class", "pannel")
    .attr("id", "map")
    .attr("width", widthColumn1)
    .attr("height", heightMap);

const deps = map.append("g")
    .attr("id", "departements");

deps.selectAll("path")
    .data(departements.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", function (d: Departement) { return `${d.properties.NOM_DEPT} departement`; })
    .attr("id", function (d: Departement) { return "d" + d.properties.CODE_DEPT; })