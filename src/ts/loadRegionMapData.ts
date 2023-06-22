import regionsJSON from '../assets/regions-avant-redecoupage-2015-simplified.json'

// declare the type of the imported JSON
interface GeoJSON {
    type: string;
    features: any[];
    bbox: number[];
}

export interface Region {
    properties: {
        code: string;
        nom: string;
    }
}

// enforce type checking on the imported JSON
export const regions: GeoJSON = regionsJSON;

console.log(regions);