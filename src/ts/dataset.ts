import * as d3 from "d3";
import { RegionName, getRegionFromDepartement } from "./region";

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

    private filteredByYear: Map<number, DataRow[]> | null = null;

    // This is big brain time
    private filteredByRegionByYear: Map<RegionName, Map<number, DataRow[]>> | null = null;

    constructor(data: DataRow[] | null = null) {
        this.csv = data;
    }

    /**
     * Loads the CSV file at the given path and wraps it in the class
     * @param csvPath The path to the CSV file
     * @returns The loaded CSV file
     */
    async loadCSV(csvPath: string): Promise<DataRow[]> {
        console.log(`Loading CSV...`);

        // log progress to the console
        const rawCSV = await d3.csv(csvPath) as RawDataRow[];

        console.log(`Loaded ${rawCSV.length} rows from ${csvPath}`);

        // remove rows with NaN values and preusuel === "_PRENOMS_RARES"
        const parsedCSV = rawCSV.reduce((acc, row) => {
            if (
                !isNaN(+row.annais) &&
                !isNaN(+row.dpt) &&
                !isNaN(+row.nombre) &&
                !isNaN(+row.sexe) &&
                row.preusuel !== "" &&
                row.preusuel !== "_PRENOMS_RARES"
            ) {
                acc.push({
                    annais: parseInt(row.annais),
                    dpt: parseInt(row.dpt),
                    region: getRegionFromDepartement(parseInt(row.dpt)),
                    nombre: parseInt(row.nombre),
                    preusuel: row.preusuel,
                    sexe: parseInt(row.sexe)
                } as DataRow);
            }
            return acc;
        }, [] as DataRow[]);

        const NaNPercentage = (rawCSV.length - parsedCSV.length) / rawCSV.length * 100;

        console.log(`Dropped ${rawCSV.length - parsedCSV.length} rows with NaN values and _PRENOMS_RARES (${NaNPercentage.toFixed(2)}%)`);


        this.csv = parsedCSV;

        return parsedCSV;
    }

    /**
     * Optimizes the dataset to make it faster to filter using hashmaps
     */
    optimize() {
        if (this.csv === null) throw new Error("CSV was not loaded when optimize was called");
        else console.log("Optimizing dataset");

        this.filteredByYear = new Map();
        this.filteredByRegionByYear = new Map();

        for (const row of this.csv) {
            if (!this.filteredByYear.has(row.annais)) {
                this.filteredByYear.set(row.annais, []);
            }
            this.filteredByYear.get(row.annais)?.push(row);

            if (!this.filteredByRegionByYear.has(row.region)) {
                this.filteredByRegionByYear.set(row.region, new Map());
            }
            if (!this.filteredByRegionByYear.get(row.region)?.has(row.annais)) {
                this.filteredByRegionByYear.get(row.region)?.set(row.annais, []);
            }
            this.filteredByRegionByYear.get(row.region)?.get(row.annais)?.push(row);
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

    /**
     * Returns a new Dataset with only the rows that match the given region
     * @param region The region to include
     * @returns A new Dataset with only the rows that match the given region
     */
    filterByRegion(region: RegionName): Dataset {
        if (this.csv === null) throw new Error("CSV was not loaded when filterByRegion was called");
        if (this.filteredByRegionByYear !== null) {
            const filteredByRegion = this.filteredByRegionByYear.get(region);
            const filteredCSV = [];
            for (const year of filteredByRegion?.keys() ?? []) {
                filteredCSV.push(...(filteredByRegion?.get(year) ?? []));
            }
            return new Dataset(filteredCSV);
        }

        const filteredCSV = this.csv.filter((row) => {
            return row.region === region;
        });
        return new Dataset(filteredCSV);
    }

    /**
     * Returns a new Dataset with only the rows that match the given region and year range
     * @param region The region to filter with
     * @param startYear The start of the year range (inclusive)
     * @param endYear The end of the year range (inclusive)
     * @returns A new Dataset with only the rows that match the given region and year range
     */
    filterByRegionAndYearRange(region: RegionName, startYear: number, endYear: number): Dataset {
        if (this.csv === null) throw new Error("CSV was not loaded when filterByRegionAndYearRange was called");

        if (this.filteredByRegionByYear !== null) {
            const filteredCSV = [];
            for (let i = startYear; i <= endYear; i++) {
                filteredCSV.push(...(this.filteredByRegionByYear.get(region)?.get(i) ?? []));
            }
            return new Dataset(filteredCSV);
        }

        return this.filterByRegion(region).filterByYearRange(startYear, endYear);
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
     * Returns a new Dataset with the rows sorted by the number of births
     * @returns A new Dataset with the rows sorted by the number of births
     */
    sortByNumberOfBirth(): Dataset {
        if (this.csv === null) throw new Error("CSV was not loaded when sortByPopularity was called");

        const sortedCSV = this.csv.sort((a, b) => b.nombre - a.nombre);

        return new Dataset(sortedCSV);
    }

    getPercentageByYearForNames(names: string[]): Map<string, Map<number, number>> {
        if (this.csv === null) throw new Error("CSV was not loaded when sumByYearForNames was called");

        const uppercasedNames = names.map((name) => {
            return name.toUpperCase();
        });

        const filteredCSV = this.csv.filter((row) => {
            return uppercasedNames.includes(row.preusuel);
        });

        const accrossYears = filteredCSV.reduce((acc, cur) => {
            if (!acc.has(cur.preusuel)) {
                acc.set(cur.preusuel, new Map<number, number>());
            }
            const map = acc.get(cur.preusuel) as Map<number, number>;
            if (!map.has(cur.annais)) {
                map.set(cur.annais, 0);
            }
            map.set(cur.annais, map.get(cur.annais) as number + cur.nombre);
            return acc;
        }, new Map<string, Map<number, number>>());

        const percentages = new Map<string, Map<number, number>>();

        for (const [name, map] of accrossYears.entries()) {
            const totalBirths = Array.from(map.values()).reduce((acc, cur) => acc + cur, 0);
            const percentageMap = new Map<number, number>();
            for (const [year, births] of map.entries()) {
                percentageMap.set(year, births / totalBirths * 100);
            }
            percentages.set(name, percentageMap);
        }

        return percentages;
    }

    getPercentageByYearForName(name: string): Map<number, number> {
        if (this.csv === null) throw new Error("CSV was not loaded when sumByYearForName was called");

        const uppercasedName = name.toUpperCase();

        const filteredCSV = this.csv.filter((row) => {
            return row.preusuel === uppercasedName;
        });

        const accrossYears = filteredCSV.reduce((acc, cur) => {
            if (!acc.has(cur.annais)) {
                acc.set(cur.annais, 0);
            }
            acc.set(cur.annais, acc.get(cur.annais) as number + cur.nombre);
            return acc;
        }, new Map<number, number>());

        const totalBirths = Array.from(accrossYears.values()).reduce((acc, cur) => acc + cur, 0);

        const percentages = new Map<number, number>();

        for (const [year, births] of accrossYears.entries()) {
            percentages.set(year, births / totalBirths * 100);
        }

        return percentages;
    }

    /**
     * Returns a tuple containing the name of the most given male and female in the dataset
     * @returns [A, B] A is the most given male name and B is the most given female name
     */
    getBestMaleAndFemaleName(): [string, string] {
        const sorted = this.getMaleAndFemaleNamesSortedByNumberOfBirth();
        const bestMaleNames = sorted[0];
        if (bestMaleNames.length === 0) throw new Error("Sorted names by birth name gave an empty list, maybe the dataset is empty");
        const bestFemaleNames = sorted[1];
        if (bestFemaleNames.length === 0) throw new Error("Sorted names by birth name gave an empty list, maybe the dataset is empty");
        return [sorted[0][0][0], sorted[1][0][0]];
    }

    /**
     * Returns two arrays of tuples containing the name and the total number of births for each name, sorted by the number of births
     * @returns Two arrays of tuples containing the name and the total number of births for each name, sorted by the number of births
     */
    getMaleAndFemaleNamesSortedByNumberOfBirth(): [[string, number][], [string, number][]] {
        if (this.csv === null) throw new Error("CSV was not loaded when getBestMaleAndFemaleNameInYearRange was called");

        const bestMaleNames = new Map<string, number>();
        const bestFemaleNames = new Map<string, number>();

        for (const row of this.csv) {
            switch (row.sexe) {
                case Sex.Male:
                    if (!bestMaleNames.has(row.preusuel)) bestMaleNames.set(row.preusuel, 0);
                    bestMaleNames.set(row.preusuel, bestMaleNames.get(row.preusuel) as number + row.nombre);
                    break;
                case Sex.Female:
                    if (!bestFemaleNames.has(row.preusuel)) bestFemaleNames.set(row.preusuel, 0);
                    bestFemaleNames.set(row.preusuel, bestFemaleNames.get(row.preusuel) as number + row.nombre);
                    break;
            }
        }

        const bestMaleNamesSorted = Array.from(bestMaleNames.entries()).sort((a, b) => b[1] - a[1]);
        const bestFemaleNamesSorted = Array.from(bestFemaleNames.entries()).sort((a, b) => b[1] - a[1]);

        return [bestMaleNamesSorted, bestFemaleNamesSorted];
    }

    /**
     * Returns an array of tuples containing the name and the total number of births for each name, sorted by the number of births
     * @returns An array of tuples containing the name and the total number of births for each name, sorted by the number of births
     */
    getAllNamesSortedByNumberOfBirth(): [string, number][] {
        if (this.csv === null) throw new Error("CSV was not loaded when getAllNamesSortedByPopularity was called");

        const names = new Map<string, number>();

        for (const row of this.csv) {
            if (!names.has(row.preusuel)) {
                names.set(row.preusuel, 0);
            }
            names.set(row.preusuel, names.get(row.preusuel) as number + row.nombre);
        }

        const namesSorted = Array.from(names.entries()).sort((a, b) => {
            return b[1] - a[1];
        });

        return namesSorted;
    }

    /**
     * Returns the ranking of the given name in the dataset and the total number of names
     * Ranking is based on the number of births in the entire dataset.
     * Ranking starts at 1 and ends at the number of names in the dataset.
     * @param name The name to search for. The name is automatically uppercased.
     * @returns The ranking of the given name in the dataset and the total number of names (best rank is 1, worst rank is the number of names)
     */
    getRankingOfName(name: string): [number | null, number] {
        if (this.csv === null) throw new Error("CSV was not loaded when getRankingOfName was called");

        const names = this.getAllNamesSortedByNumberOfBirth();

        const index = names.findIndex((element) => element[0] === name.toUpperCase());

        if (index === -1) return [null, names.length];
        return [index + 1, names.length];
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


