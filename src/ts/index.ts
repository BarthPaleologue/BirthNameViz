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


////////////Global variable////////////
let minYearSelected = 1900;
let maxYearSelected = 2010;

let dragOn = false;
let timerId: number | undefined;


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

selectors.append("h2")
    .html("Filter by year");

const periodSel = selectors.append("div");
const labels = selectors.append("div");

const leftPerSel = periodSel.append("input")
    .attr("type", "range")
    .attr("scale", "{x => -x}")
    .attr("id", "leftPeriod")
    .attr("min", -(maxYear+minYear)/2)
    .attr("max", -minYear);

const leftYear = labels.append("div")
    .attr("class", "left")
    .append("label").html(minYear.toString());
const rightYear = labels.append("div")
    .attr("class", "right")
    .append("label").html(maxYear.toString());

const rightPerSel = periodSel.append("input")
    .attr("type", "range")
    .attr("id", "rightPeriod")
    .attr("min", (maxYear+minYear)/2)
    .attr("max", maxYear)
    .attr("value", maxYear);

leftPerSel.on('input', leftHandleInput);
rightPerSel.on('input', rightHandleInput);
leftPerSel.on("mouseup", mouseUpLeftHandler);
rightPerSel.on("mouseup", mouseUpRightHandler);

//Handle Functions
function leftHandleClick() {
    maxYearSelected = rightPerSel.property('value'); //Save the value of the right range input
    rightPerSel.property('value', rightPerSel.attr('min')); //Set the right range input to the minimum
    let pourcentage = (maxYearSelected-minYear)/(maxYear-minYear); //Compute the new proportion of left range input
    leftPerSel.attr('min', -maxYearSelected); //Set the maximum value of the left range input to the right selected year
    updateWidth(pourcentage);
    console.log("Mouse In");

}

function rightHandleClick() {
    minYearSelected = -leftPerSel.property('value'); //Save the value of the left input
    leftPerSel.property('value', leftPerSel.attr('min'))//Set the left range input to the maximum value
    let pourcentage = (minYearSelected-minYear)/(maxYear-minYear);
    rightPerSel.attr('min', minYearSelected); //Set the minimum value of the right range input to the left selected year
    updateWidth(pourcentage);
    console.log("Mouse In");
}

function leftHandleInput() {
    if (!dragOn) {
        dragOn = true;
        leftHandleClick();
    }
    leftYear.html((-leftPerSel.property('value')).toString());
}

function rightHandleInput() {
    if (!dragOn) {
        dragOn = true;
        rightHandleClick();
    }
    rightYear.html((rightPerSel.property('value')).toString());
}

function mouseUpLeftHandler() {
    rightPerSel.property('value', maxYearSelected);
    let valueL = leftPerSel.property('value');
    let mid = Math.round((-Number(valueL)+Number(maxYearSelected))/2);
    let pourcentage = (mid-minYear)/(maxYear-minYear);
    console.log("Mouse UP");
    rightPerSel.attr('min', mid);
    leftPerSel.attr('min', -mid);
    updateWidth(pourcentage);

    // Reset the flag with a delay
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      dragOn = false;
      console.log(leftPerSel.property('value'), rightPerSel.property('value'));
    }, 100);
}

function mouseUpRightHandler() {
    leftPerSel.property('value', -minYearSelected);
    let valueL = leftPerSel.property('value');
    let valueR = rightPerSel.property('value');
    let mid = Math.round((-Number(valueL)+Number(valueR))/2);
    let pourcentage = (mid-minYear)/(maxYear-minYear);
    console.log("Mouse Up");
    leftPerSel.attr('min', -mid);
    rightPerSel.attr('min', mid);
    updateWidth(pourcentage);

    // Reset the flag with a delay
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      dragOn = false;
      console.log(leftPerSel.property('value'), rightPerSel.property('value'));
    }, 100);
}

function updateWidth(pourcentage : number) {
    leftPerSel.style('width', ((pourcentage*100).toString()+"%"));
    rightPerSel.style('width', ((100-pourcentage*100).toString()+"%"));
}

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