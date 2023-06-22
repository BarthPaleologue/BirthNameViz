import * as d3 from "d3";

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

    private onValueChangeCallbacks: ((minYear: number, maxYear: number) => void)[] = [];

    private minYearSelected: number;
    private maxYearSelected: number;

    private dragOn = false;
    private timerId: number | undefined;

    constructor(minYear: number, maxYear: number) {
        this.minYearSelected = minYear;
        this.maxYearSelected = maxYear;
        
        const selectors = d3.select('body').append("div").lower()
            .attr("class", "pannel")
            .attr("id", "selectors")
            .attr("width", this.widthColumn1)
            .attr("height", this.heightSelectors);

        selectors.append("h2")
            .html("Filter by year");

        const periodSel = selectors.append("div");
        const labels = selectors.append("div");

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
    }

    //Handle Functions
    private leftHandleClick(): void {
        this.maxYearSelected = this.rightPerSel.property('value'); //Save the value of the right range input
        this.rightPerSel.property('value', this.rightPerSel.attr('min')); //Set the right range input to the minimum
        const pourcentage = (this.maxYearSelected - this.minYear) / (this.maxYear - this.minYear); //Compute the new proportion of left range input
        this.leftPerSel.attr('min', -this.maxYearSelected); //Set the maximum value of the left range input to the right selected year
        this.updateWidth(pourcentage);
    }

    private rightHandleClick(): void {
        this.minYearSelected = -this.leftPerSel.property('value'); //Save the value of the left input
        this.leftPerSel.property('value', this.leftPerSel.attr('min'))//Set the left range input to the maximum value
        const pourcentage = (this.minYearSelected - this.minYear) / (this.maxYear - this.minYear);
        this.rightPerSel.attr('min', this.minYearSelected); //Set the minimum value of the right range input to the left selected year
        this.updateWidth(pourcentage);
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
        const pourcentage = (mid - this.minYear) / (this.maxYear - this.minYear);
        this.rightPerSel.attr('min', mid);
        this.leftPerSel.attr('min', -mid);
        this.updateWidth(pourcentage);

        // Reset the flag with a delay
        clearTimeout(this.timerId);
        this.timerId = setTimeout(() => {
            this.dragOn = false;
        }, 100);

        console.log(this.minYearSelected, this.maxYearSelected);

        this.dispatchCallbacks();
    }

    private mouseUpRightHandler(): void {
        this.leftPerSel.property('value', -this.minYearSelected);
        this.maxYearSelected = this.rightPerSel.property('value');//Save the value selected
        const mid = Math.round((Number(this.minYearSelected) + Number(this.maxYearSelected)) / 2);
        const pourcentage = (mid - this.minYear) / (this.maxYear - this.minYear);
        this.leftPerSel.attr('min', -mid);
        this.rightPerSel.attr('min', mid);
        this.updateWidth(pourcentage);

        // Reset the flag with a delay
        clearTimeout(this.timerId);
        this.timerId = setTimeout(() => {
            this.dragOn = false;
        }, 100);

        console.log(this.minYearSelected, this.maxYearSelected);

        this.dispatchCallbacks();
    }

    private updateWidth(pourcentage: number): void {
        this.leftPerSel.style('width', ((pourcentage * 100).toString() + "%"));
        this.rightPerSel.style('width', ((100 - pourcentage * 100).toString() + "%"));
    }


    public addOnValueChangeCallback(callback: (minYear: number, maxYear: number) => void): void {
        this.onValueChangeCallbacks.push(callback);
    }

    private dispatchCallbacks(): void {
        for (const callback of this.onValueChangeCallbacks) {
            callback(this.minYearSelected, this.maxYearSelected);
        }
    }
}