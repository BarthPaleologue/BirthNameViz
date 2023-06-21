import * as d3 from "d3";
import { RegionName, getRegionFromDepartement } from "./region";

// adds the dataset to the window object so it can be accessed from the console
declare global {
    interface Window {
        dataset: Dataset;
    }
}

/**
 * Represents a row in the raw CSV file
 * @private
 * @internal
 */
interface RawDataRow {
    annais: string;
    dpt: string;
    nombre: string;
    preusuel: string;
    sexe: string;
}

/**
 * Represents a row in the parsed CSV file
 */
export interface DataRow {
    annais: number;
    dpt: number;
    region: RegionName;
    nombre: number;
    preusuel: string;
    sexe: Sex;
}

/**
 * Represents a row in the CSV file when the data are agregated by year
 */
export interface YearAggregatedDataRow {
    annais: number;
    preusuel: string;
    nombre: number;
    sexe: Sex;
}

/**
 * Represents a row in the CSV file when the data are agregated by region
 */
export interface RegionAggregatedDataRow {
    annais: number;
    preusuel: string;
    nombre: number;
    sexe: number;
    region: RegionName;
}

/**
 * An enum to manipulate Sex data in a more readable way
 */
export enum Sex {
    Male = 1,
    Female = 2
}

/**
 * A wrapper around the CSV data to make it easier to manipulate
 */
export class Dataset {
    private csv: DataRow[] | null = null;

    private filteredByDepartements: Map<number, DataRow[]> | null = null;
    private filteredBySex: Map<Sex, DataRow[]> | null = null;
    private filteredByRegion: Map<RegionName, DataRow[]> | null = null;
    private filteredByYear: Map<number, DataRow[]> | null = null;

    constructor(data: DataRow[] | null = null) {
        this.csv = data;
    }

    /**
     * Loads the CSV file at the given path and wraps it in the class
     * @param csvPath The path to the CSV file
     * @returns The loaded CSV file
     */
    async loadCSV(csvPath: string): Promise<DataRow[]> {
        const rawCSV = await d3.csv(csvPath) as RawDataRow[];

        // remove rows with NaN values
        const filteredNaNCSV = rawCSV.filter((row) => {
            return !isNaN(+row.annais) && !isNaN(+row.dpt) && !isNaN(+row.nombre) && !isNaN(+row.sexe);
        });

        const NaNPercentage = (rawCSV.length - filteredNaNCSV.length) / rawCSV.length * 100;

        console.log(`Droped ${rawCSV.length - filteredNaNCSV.length} rows with NaN values (${NaNPercentage.toFixed(2)}%)`);

        // remove rows with preusuel === "_PRENOMS_RARES"
        const filteredRareCSV = filteredNaNCSV.filter((row) => {
            return row.preusuel !== "_PRENOMS_RARES";
        });

        const rarePercentage = (rawCSV.length - filteredRareCSV.length) / rawCSV.length * 100;

        console.log(`Droped ${rawCSV.length - filteredRareCSV.length} rows with preusuel === "_PRENOMS_RARES" (${rarePercentage.toFixed(2)}%)`);

        // cast nombre to number on each row
        const parsedCSV: DataRow[] = filteredRareCSV.map((row) => {
            return {
                annais: parseInt(row.annais),
                dpt: parseInt(row.dpt),
                region: getRegionFromDepartement(parseInt(row.dpt)),
                nombre: parseInt(row.nombre),
                preusuel: row.preusuel,
                sexe: parseInt(row.sexe)
            };
        });

        console.log(parsedCSV);

        this.csv = parsedCSV;

        return parsedCSV;
    }

    optimize() {
        if (this.csv === null) throw new Error("CSV was not loaded when optimize was called");
        else console.log("Optimizing dataset");

        this.filteredByDepartements = new Map();
        this.filteredBySex = new Map();
        this.filteredByRegion = new Map();
        this.filteredByYear = new Map();
        for (const row of this.csv) {
            if (!this.filteredByDepartements.has(row.dpt)) {
                this.filteredByDepartements.set(row.dpt, []);
            }
            this.filteredByDepartements.get(row.dpt)?.push(row);

            if (!this.filteredBySex.has(row.sexe)) {
                this.filteredBySex.set(row.sexe, []);
            }
            this.filteredBySex.get(row.sexe)?.push(row);

            if (!this.filteredByRegion.has(row.region)) {
                this.filteredByRegion.set(row.region, []);
            }
            this.filteredByRegion.get(row.region)?.push(row);

            if (!this.filteredByYear.has(row.annais)) {
                this.filteredByYear.set(row.annais, []);
            }
            this.filteredByYear.get(row.annais)?.push(row);
        }

        console.log("Optimization done");
    }

    /**
     * Unwraps the dataset from the class to a simple array
     * @returns An array of DataRows
     */
    toArray(): DataRow[] {
        if (this.csv === null) throw new Error("CSV was not loaded when getCSV was called");
        return this.csv;
    }

    /**
     * Returns a new Dataset with only the rows that match the given year range (inclusive)
     * @param startYear The first year to include
     * @param endYear The last year to include
     * @returns A new Dataset with only the rows that match the given year range (inclusive)
     */
    filterByYearRange(startYear: number, endYear: number): Dataset {
        if (this.csv === null) throw new Error("CSV was not loaded when getDatasetForYearRange was called");

        if (this.filteredByYear !== null) {
            const filteredCSV = [];
            for (let i = startYear; i <= endYear; i++) {
                filteredCSV.push(...(this.filteredByYear.get(i) ?? []));
            }
            return new Dataset(filteredCSV);
        }

        const filteredCSV = this.csv.filter((row) => {
            return row.annais >= startYear && row.annais <= endYear;
        });

        return new Dataset(filteredCSV);
    }

    /**
     * Returns a new Dataset with only the rows that match the given year
     * @param year The year to include
     * @returns A new Dataset with only the rows that match the given year
     */
    filterByYear(year: number): Dataset {
        return this.filterByYearRange(year, year);
    }

    /**
     * Returns a new Dataset with only the rows that match the given departements
     * @param departements The departements to include
     * @returns A new Dataset with only the rows that match the given departements
     */
    filterByDepartements(departements: number[]): Dataset {
        if (this.csv === null) throw new Error("CSV was not loaded when getDatasetForDepartements was called");

        if (this.filteredByDepartements !== null) {
            const filteredCSV = departements.map((departement) => {
                return this.filteredByDepartements?.get(departement) ?? [];
            }).flat();

            return new Dataset(filteredCSV);
        }

        const filteredCSV = this.csv.filter((row) => {
            return departements.includes(row.dpt);
        });

        return new Dataset(filteredCSV);
    }

    /**
     * Returns a new Dataset with only the rows that match the given departement
     * @param departement The departement to include
     * @returns A new Dataset with only the rows that match the given departement
     */
    filterByDepartement(departement: number): Dataset {
        return this.filterByDepartements([departement]);
    }

    filterByRegion(region: RegionName): Dataset {
        if(this.csv === null) throw new Error("CSV was not loaded when filterByRegion was called");
        if(this.filteredByRegion !== null) {
            const filteredCSV = this.filteredByRegion.get(region) ?? [];
            return new Dataset(filteredCSV);
        } 

        const filteredCSV = this.csv.filter((row) => {
            return row.region === region;
        });
        return new Dataset(filteredCSV);
    }

    /**
     * Returns a new Dataset with only the rows that match the given names **(the names are automatically uppercased)**
     * @param names The names to include
     * @returns A new Dataset with only the rows that match the given names
     */
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

    /**
     * Returns a new Dataset with only the rows that match the given name **(the name is automatically uppercased)**
     * @param name The name to include
     * @returns A new Dataset with only the rows that match the given name
     */
    filterByName(name: string): Dataset {
        return this.filterByNames([name]);
    }

    /**
     * Returns a new dataset filtered by sex
     * @param sex The sex to filter with (use the Sex enum)
     * @returns A new dataset filtered by sex
     */
    filterBySex(sex: Sex): Dataset {
        if (this.csv === null) throw new Error("CSV was not loaded when getDatasetForSex was called");

        const filteredCSV = this.csv.filter((row) => {
            return row.sexe === sex
        });

        return new Dataset(filteredCSV);
    }

    /**
     * Returns a new Dataset with the rows summed by year. The departement data is agregated, so the departement column is not included in the returned data.
     * @returns A new Dataset with the rows summed by year
     */
    aggregateByYear(): YearAggregatedDataRow[] {
        if (this.csv === null) throw new Error("CSV was not loaded when aggregateByYear was called");

        const aggregatedCSV = this.csv.reduce((accumulator, currentValue) => {
            const index = accumulator.findIndex((element) => {
                return element.annais === currentValue.annais && element.preusuel === currentValue.preusuel && element.sexe === currentValue.sexe;
            });

            if (index === -1) {
                const newElement = {
                    annais: currentValue.annais,
                    preusuel: currentValue.preusuel,
                    nombre: currentValue.nombre,
                    sexe: currentValue.sexe
                };
                accumulator.push(newElement);
            } else {
                accumulator[index].nombre += currentValue.nombre;
            }

            return accumulator;
        }, [] as YearAggregatedDataRow[]);

        return aggregatedCSV;
    }


    /**
     * Returns the year with the most births for the given name
     * @param name The name to search for
     * @returns The year with the most births for the given name
     */
    getBestYearFor(name: string): number {
        if (this.csv === null) throw new Error("CSV was not loaded when getBestYearFor was called");

        const dataset = this.filterByName(name).aggregateByYear();

        let bestYear = dataset[0];
        for (let i = 1; i < dataset.length; i++) {
            if (dataset[i].nombre > bestYear.nombre) {
                bestYear = dataset[i];
            }
        }

        return bestYear.annais;
    }

    sortByPopularity(): Dataset {
        if (this.csv === null) throw new Error("CSV was not loaded when sortByPopularity was called");

        const sortedCSV = this.csv.sort((a, b) => {
            return b.nombre - a.nombre;
        });

        return new Dataset(sortedCSV);
    }

    getBestMaleAndFemaleName(): [string, string] {
        if (this.csv === null) throw new Error("CSV was not loaded when getBestMaleAndFemaleNameInYearRange was called");

        const dataset = this.aggregateByYear();

        let bestMaleName = dataset[0].preusuel;
        let bestFemaleName = dataset[0].preusuel;

        let bestMaleNameCount = dataset[0].nombre;
        let bestFemaleNameCount = dataset[0].nombre;

        for (let i = 1; i < dataset.length; i++) {
            const row = dataset[i];
            switch (row.sexe) {
                case Sex.Male:
                    if (row.nombre > bestMaleNameCount) {
                        bestMaleName = row.preusuel;
                        bestMaleNameCount = row.nombre;
                    }
                    break;
                case Sex.Female:
                    if (row.nombre > bestFemaleNameCount) {
                        bestFemaleName = row.preusuel;
                        bestFemaleNameCount = row.nombre;
                    }
                    break;
                default:
                    break;
            }
        }

        return [bestMaleName, bestFemaleName];
    }

    /**
     * Returns a deep copy of the dataset
     * @returns A deep copy of the dataset
     */
    deepCopy(): Dataset {
        if (this.csv === null) throw new Error("CSV was not loaded when deepCopy was called");

        const copiedCSV = this.csv.map((row) => {
            return {
                annais: row.annais,
                dpt: row.dpt,
                nombre: row.nombre,
                preusuel: row.preusuel,
                sexe: row.sexe
            } as DataRow;
        });

        return new Dataset(copiedCSV);
    }
}