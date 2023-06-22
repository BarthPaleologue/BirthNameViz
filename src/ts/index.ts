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

const selectors = new SliderSelector();
window.selectors = selectors;

const map = new InteractiveMap(dataset, 1960, 2015);
window.map = map;

document.querySelector("#loader")?.remove();
