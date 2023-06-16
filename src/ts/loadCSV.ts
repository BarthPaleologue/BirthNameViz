import * as d3 from "d3";

interface RawDataRow {
    annais: string;
    dpt: string;
    nombre: string;
    preusuel: string;
    sexe: string;
}

export interface DataRow {
    annais: number;
    dpt: number;
    nombre: number;
    preusuel: string;
    sexe: number;
}

export async function loadCSV(csvPath: string): Promise<DataRow[]> {
    const rawData = await d3.text(csvPath)
    // replace ; by ,
    const rawDataCSV = rawData.replace(/;/g, ",");

    // parse the CSV
    const parsedCSV = d3.csvParse(rawDataCSV) as RawDataRow[];

    // cast nombre to number on each row
    const finalCSV = parsedCSV.map((row) => {
        return {
            annais: parseInt(row.annais),
            dpt: parseInt(row.dpt),
            nombre: parseInt(row.nombre),
            preusuel: row.preusuel,
            sexe: parseInt(row.sexe)
        } as DataRow;
    });

    console.log(finalCSV);

    return finalCSV;
}