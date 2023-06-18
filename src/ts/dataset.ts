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

export enum Sex {
    Male = 1,
    Female = 2
}

export class Dataset {
    private csv: DataRow[] | null = null;

    constructor(data: DataRow[] | null = null) {
        this.csv = data;
    }

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

    toArray(): DataRow[] {
        if (this.csv === null) throw new Error("CSV was not loaded when getCSV was called");
        return this.csv;
    }

    filterByYearRange(startYear: number, endYear: number): Dataset {
        if (this.csv === null) throw new Error("CSV was not loaded when getDatasetForYearRange was called");

        const filteredCSV = this.csv.filter((row) => {
            return row.annais >= startYear && row.annais <= endYear;
        });

        return new Dataset(filteredCSV);
    }

    filterByYear(year: number): Dataset {
        return this.filterByYearRange(year, year);
    }

    filterByDepartements(departements: number[]): Dataset {
        if (this.csv === null) throw new Error("CSV was not loaded when getDatasetForDepartements was called");

        const filteredCSV = this.csv.filter((row) => {
            return departements.includes(row.dpt);
        });

        return new Dataset(filteredCSV);
    }

    filterByDepartement(departement: number): Dataset {
        return this.filterByDepartements([departement]);
    }

    filterByNames(names: string[]): Dataset {
        if (this.csv === null) throw new Error("CSV was not loaded when getDatasetForNames was called");

        const uppercasedNames = names.map((name) => {
            return name.toUpperCase();
        });

        const filteredCSV = this.csv.filter((row) => {
            return uppercasedNames.includes(row.preusuel);
        });

        return new Dataset(filteredCSV);
    }

    filterByName(name: string): Dataset {
        return this.filterByNames([name]);
    }

    filterBySex(sex: Sex): Dataset {
        if(this.csv === null) throw new Error("CSV was not loaded when getDatasetForSex was called");

        const filteredCSV = this.csv.filter((row) => {
            return row.sexe === sex
        });

        return new Dataset(filteredCSV);
    }
}