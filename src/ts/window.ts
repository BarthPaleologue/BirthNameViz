import { Dataset } from "./dataset";
import { InteractiveMap } from "./map";
import { SliderSelector} from './selectors';

declare global {
    interface Window {
        dataset: Dataset;
        selectors: SliderSelector;
        map: InteractiveMap;
    }
}