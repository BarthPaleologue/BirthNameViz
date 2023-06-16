import departementsJSON from '../assets/departments.json'

// declare the type of the imported JSON
interface GeoJSON {
    type: string;
    features: any[];
    bbox: number[];
}

// enforce type checking on the imported JSON
export const departements: GeoJSON = departementsJSON;

console.log(departements);