import birthNamesCSV from '../assets/dpt2020.csv';
import '../styles/index.scss';

import { Dataset, Sex } from './dataset';
import { InteractiveMap } from './map';
import { SliderSelector} from './selectors';
import "./window";

// most of this code comes from https://www.datavis.fr/d3js/map-firststep

const dataset = new Dataset();
window.dataset = dataset;

await dataset.loadCSV(birthNamesCSV);
dataset.optimize();

console.log(dataset.filterByYearRange(1990, 2015).filterByDepartement(75).filterByName("Daniel").toArray());

console.log(dataset.filterByYearRange(1990, 2015).filterByName("Manon").aggregateByYear());

console.log(dataset.filterByYearRange(1960, 2015).filterByName("Claude").filterBySex(Sex.Female).aggregateByYear());

console.log(dataset.getBestYearFor("Adrien"));

const data = dataset.toArray();

console.log(data[0]);

const DEFAULT_MIN_YEAR = 2000;
const DEFAULT_MAX_YEAR = 2020;

const map = new InteractiveMap(dataset, DEFAULT_MIN_YEAR, DEFAULT_MAX_YEAR);
window.map = map;

const selectors = new SliderSelector(DEFAULT_MIN_YEAR, DEFAULT_MAX_YEAR);
window.selectors = selectors;
selectors.addOnValueChangeCallback((minYear: number, maxYear: number) => {
    map.updateYearRange(minYear, maxYear);
});

document.querySelector("#loader")?.remove();
