import birthNamesCSV from '../assets/dpt2020.csv';
import '../styles/index.scss';

import { Dataset, Sex } from './dataset';
import { InteractiveMap } from './map';
import { SliderSelector} from './selectors';
import "./window";
import {PopularityGraph} from "./popularitygraph";

// most of this code comes from https://www.datavis.fr/d3js/map-firststep

const dataset = new Dataset();
window.dataset = dataset;

await dataset.loadCSV(birthNamesCSV);
dataset.optimize();

console.log(dataset.filterByYearRange(1990, 2015).filterByDepartement(75).filterByName("Daniel").toArray());

const data = dataset.toArray();

console.log(data[0]);

const DEFAULT_MIN_YEAR = 1970;
const DEFAULT_MAX_YEAR = 1981;

const selectors = new SliderSelector(DEFAULT_MIN_YEAR, DEFAULT_MAX_YEAR);
window.selectors = selectors;

const histopopularity = new PopularityGraph(dataset);
selectors.addOnNameChangeCallback((name: string | null) => {
    histopopularity.filterByName(name);
});

const map = new InteractiveMap(dataset, DEFAULT_MIN_YEAR, DEFAULT_MAX_YEAR);
window.map = map;
selectors.addOnYearRangeChangeCallback((minYear: number, maxYear: number) => {
    map.updateYearRange(minYear, maxYear);
});
selectors.addOnNameChangeCallback((name: string | null) => {
    map.filterByName(name);
});

document.querySelector("#loader")?.remove();
