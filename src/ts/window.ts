import { Dataset } from "./dataset";
import { InteractiveMap } from "./map";

declare global {
    interface Window {
        dataset: Dataset;
        map: InteractiveMap;
    }
}