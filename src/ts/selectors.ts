import * as d3 from "d3";
import { MAX_YEAR } from "./settings";

enum Gender {
    MALE = 0,
    BOTH,
    FEMALE,
}

export class SliderSelector {
    ////////////Constants////////////
    readonly widthColumn1 = 975;
    readonly heightMap = 610;
    readonly heightSelectors = 200;
    readonly minYear = 1900;
    readonly maxYear = 2020;
    readonly leftPerSel: any;
    readonly rightPerSel: any;
    readonly leftYear: any;
    readonly rightYear: any;

    private onYearRangeChangeCallbacks: ((minYear: number, maxYear: number) => void)[] = [];
    private onNameChangeCallbacks: ((name: string | null) => void)[] = [];

    private filteredName: string | null = null;

    private animationInterval: number | null = null;

    private minYearSelected: number;
    private maxYearSelected: number;
    private genderSelected = Gender.BOTH;

    private dragOn = false;
    private timerId: number | undefined;

    constructor(minYear: number, maxYear: number) {
        this.minYearSelected = minYear;
        this.maxYearSelected = maxYear;

        const panel = d3.select('body').append("div").lower()
            .attr("class", "panel")
            .attr("id", "selectors")
            .attr("width", this.widthColumn1)
            .attr("height", this.heightSelectors);

        panel.append("h2")
            .html("Filter by year");

        const rangeAndPlayContainer = panel.append("div").attr("class", "rangeAndPlayContainer");
        const playButton = rangeAndPlayContainer.append("button")
            .attr("id", "playButton")
            .attr("type", "button")
            .html("Play");

        playButton
            .on("click", () => {
                if (this.animationInterval === null) {
                    this.animationInterval = setInterval(() => {
                        const min = this.minYearSelected;
                        const max = this.maxYearSelected;

                        const newMin = Math.min(MAX_YEAR, min + 1);
                        const newMax = Math.min(MAX_YEAR, max + 1);

                        if(newMax === MAX_YEAR && this.animationInterval !== null) {
                            clearInterval(this.animationInterval);
                            this.animationInterval = null;
                            playButton.html("Play");
                        }

                        this.setRange(newMin, newMax);
                    }, 1000);

                    playButton.html("Stop");
                } else {
                    clearInterval(this.animationInterval);
                    this.animationInterval = null;

                    playButton.html("Play");
                }
            });

        const periodSel = rangeAndPlayContainer.append("div").attr("class", "rangeContainer");
        const labels = panel.append("div").attr("class", "rangeLabelContainer");

        this.leftPerSel = periodSel.append("input")
            .attr("type", "range")
            .attr("scale", "{x => -x}")
            .attr("id", "leftPeriod")
            .attr("min", -(this.maxYear + this.minYear) / 2)
            .attr("max", -this.minYear)

        this.leftYear = labels.append("div")
            .attr("class", "left")
            .append("label").html(this.minYear.toString());
        this.rightYear = labels.append("div")
            .attr("class", "right")
            .append("label").html(this.maxYear.toString());

        this.rightPerSel = periodSel.append("input")
            .attr("type", "range")
            .attr("id", "rightPeriod")
            .attr("min", (this.maxYear + this.minYear) / 2)
            .attr("max", this.maxYear)

        this.leftPerSel.on('input', this.leftHandleInput.bind(this));
        this.rightPerSel.on('input', this.rightHandleInput.bind(this));
        this.leftPerSel.on("mouseup", this.mouseUpLeftHandler.bind(this));
        this.rightPerSel.on("mouseup", this.mouseUpRightHandler.bind(this));

        this.setRange(minYear, maxYear);

        const nameInput = panel.append("div").attr("class", "nameInputContainer");
        nameInput.append("h2")
            .html("Filter by name");
        nameInput.append("input")
            .attr("type", "text")
            .attr("id", "nameInput")
            .attr("placeholder", "Enter a name")
            .attr("name", "nameInput")
            .on("input", () => {
                const name = (document.getElementById("nameInput") as HTMLInputElement).value;
                if (name === "") {
                    (document.getElementById("nameInputButton") as HTMLButtonElement).disabled = true;
                    this.nameInputHandler();
                } else {
                    (document.getElementById("nameInputButton") as HTMLButtonElement).disabled = false;
                }
            })
            .on("keyup", (event) => {
                if (event.key === "Enter") {
                    this.nameInputHandler();
                }
            });
        nameInput.append("button")
            .attr("id", "nameInputButton")
            .attr("type", "button")
            .html("Filter")
            .on("click", this.nameInputHandler.bind(this));
    }

    /*Update the slider to fit the specified range */
    public setRange(min: number, max: number): void {
        const mid = Math.round(((max - min) / 2) + min);
        const frac = (mid - this.minYear) / (this.maxYear - this.minYear);
        this.updateWidth(frac);
        console.log(mid, frac, min, max);
        this.leftPerSel.attr('min', -mid); //Update the max value of the left range input
        this.rightPerSel.attr('min', mid); //Update the min value of the left range input

        //Update the value
        this.minYearSelected = min;
        this.maxYearSelected = max;
        this.leftPerSel.property('value', -min);
        this.rightPerSel.property('value', max);
        this.leftYear.html(min.toString());
        this.rightYear.html(max.toString());

        this.dispatchYearRangeCallbacks();
    }

    //Handle Functions
    private leftHandleClick(): void {
        this.maxYearSelected = Number(this.rightPerSel.property('value')); //Save the value of the right range input
        this.rightPerSel.property('value', this.rightPerSel.attr('min')); //Set the right range input to the minimum
        const frac = (this.maxYearSelected - this.minYear) / (this.maxYear - this.minYear); //Compute the new proportion of left range input
        this.leftPerSel.attr('min', -this.maxYearSelected); //Set the maximum value of the left range input to the right selected year
        this.updateWidth(frac);
    }

    private rightHandleClick(): void {
        this.minYearSelected = -this.leftPerSel.property('value'); //Save the value of the left input
        this.leftPerSel.property('value', this.leftPerSel.attr('min'))//Set the left range input to the maximum value
        const frac = (this.minYearSelected - this.minYear) / (this.maxYear - this.minYear);
        this.rightPerSel.attr('min', this.minYearSelected); //Set the minimum value of the right range input to the left selected year
        this.updateWidth(frac);
    }

    private leftHandleInput(): void {
        if (!this.dragOn) {
            this.dragOn = true;
            this.leftHandleClick();
        }
        this.leftYear.html((-this.leftPerSel.property('value')).toString());
    }

    private rightHandleInput(): void {
        if (!this.dragOn) {
            this.dragOn = true;
            this.rightHandleClick();
        }
        this.rightYear.html((this.rightPerSel.property('value')).toString());
    }

    private mouseUpLeftHandler(): void {
        this.rightPerSel.property('value', this.maxYearSelected);
        this.minYearSelected = -this.leftPerSel.property('value'); //Save the value selected
        const mid = Math.round((Number(this.minYearSelected) + Number(this.maxYearSelected)) / 2);
        const frac = (mid - this.minYear) / (this.maxYear - this.minYear);
        this.rightPerSel.attr('min', mid);
        this.leftPerSel.attr('min', -mid);
        this.updateWidth(frac);

        // Reset the flag with a delay
        clearTimeout(this.timerId);
        this.timerId = setTimeout(() => {
            this.dragOn = false;
        }, 100);

        console.log(this.minYearSelected, this.maxYearSelected);

        this.dispatchYearRangeCallbacks();
    }

    private mouseUpRightHandler(): void {
        this.leftPerSel.property('value', -this.minYearSelected);
        this.maxYearSelected = this.rightPerSel.property('value');//Save the value selected
        const mid = Math.round((Number(this.minYearSelected) + Number(this.maxYearSelected)) / 2);
        const frac = (mid - this.minYear) / (this.maxYear - this.minYear);
        this.leftPerSel.attr('min', -mid);
        this.rightPerSel.attr('min', mid);
        this.updateWidth(frac);

        // Reset the flag with a delay
        clearTimeout(this.timerId);
        this.timerId = setTimeout(() => {
            this.dragOn = false;
        }, 100);

        console.log(this.minYearSelected, this.maxYearSelected);

        this.dispatchYearRangeCallbacks();
    }

    /*Update the width of the input range respecting a given proportion for the left (between 0 and 1) */
    private updateWidth(frac: number): void {
        this.leftPerSel.style('width', ((frac * 100).toString() + "%"));
        this.rightPerSel.style('width', ((100 - frac * 100).toString() + "%"));
    }


    public addOnYearRangeChangeCallback(callback: (minYear: number, maxYear: number) => void): void {
        this.onYearRangeChangeCallbacks.push(callback);
    }

    private dispatchYearRangeCallbacks(): void {
        for (const callback of this.onYearRangeChangeCallbacks) {
            callback(this.minYearSelected, this.maxYearSelected);
        }
    }

    private nameInputHandler(): void {
        const name = (document.getElementById("nameInput") as HTMLInputElement).value;
        this.filteredName = name === "" ? null : name;
        this.dispatchNameChangeCallbacks();
    }

    public addOnNameChangeCallback(callback: (name: string | null) => void): void {
        this.onNameChangeCallbacks.push(callback);
    }

    private dispatchNameChangeCallbacks(): void {
        for (const callback of this.onNameChangeCallbacks) {
            callback(this.filteredName);
        }
    }
}