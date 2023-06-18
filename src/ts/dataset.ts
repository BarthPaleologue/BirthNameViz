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

export class Dataset {
    private csv: DataRow[] | null = null;

    async loadCSV(csvPath: string): Promise<DataRow[]> {
        const rawData = await d3.csv(csvPath) as RawDataRow[];

        // cast nombre to number on each row
        const parsedCSV = rawData.map((row) => {
            return {
                annais: parseInt(row.annais),
                dpt: parseInt(row.dpt),
                nombre: parseInt(row.nombre),
                preusuel: row.preusuel,
                sexe: parseInt(row.sexe)
            } as DataRow;
        });

        console.log(parsedCSV);

        this.csv = parsedCSV;

        return parsedCSV;
    }

    getCSV(): DataRow[] {
        if (this.csv === null) throw new Error("CSV was not loaded when getCSV was called");
        return this.csv;
    }
}