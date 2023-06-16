import departementsJSON from '../assets/departments.json'

// declare the type of the imported JSON
interface GeoJSON {
    type: string;
    features: any[];
    bbox: number[];
}

export interface Departement {
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

// enforce type checking on the imported JSON
export const departements: GeoJSON = departementsJSON;

console.log(departements);