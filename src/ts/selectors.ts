import * as d3 from "d3";
import "./window";

export class SliderSelector {
    ////////////Constants////////////
    readonly widthColumn1 = 975;
    readonly heightMap = 610;
    readonly heightSelectors = 200;
    readonly minYear = 1900; //TODO: Change that according to the data
    readonly maxYear = 2010; //TODO: Change that according to the data
    readonly leftPerSel : any;
    readonly rightPerSel: any;
    readonly leftYear   : any;
    readonly rightYear  : any;

    private minYearSelected = 1900;
    private maxYearSelected = 2010;

    private dragOn = false;
    private timerId: number | undefined;

    constructor() {
        const selectors = d3.select('body').append("div")
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
            .attr("min", -(this.maxYear+this.minYear)/2)
            .attr("max", -this.minYear);

        this.leftYear = labels.append("div")
            .attr("class", "left")
            .append("label").html(this.minYear.toString());
        this.rightYear = labels.append("div")
            .attr("class", "right")
            .append("label").html(this.maxYear.toString());

        this.rightPerSel = periodSel.append("input")
            .attr("type", "range")
            .attr("id", "rightPeriod")
            .attr("min", (this.maxYear+this.minYear)/2)
            .attr("max", this.maxYear)
            .attr("value", this.maxYear);

        this.leftPerSel.on('input', this.leftHandleInput.bind(this));
        this.rightPerSel.on('input', this.rightHandleInput.bind(this));
        this.leftPerSel.on("mouseup", this.mouseUpLeftHandler.bind(this));
        this.rightPerSel.on("mouseup", this.mouseUpRightHandler.bind(this));
}

public getMinYear() : Number {
    return this.minYearSelected;
}

public getMaxYear() : Number {
    return this.maxYearSelected;
}

//Handle Functions
private leftHandleClick() : void {
    this.maxYearSelected = this.rightPerSel.property('value'); //Save the value of the right range input
    this.rightPerSel.property('value', this.rightPerSel.attr('min')); //Set the right range input to the minimum
    let pourcentage = (this.maxYearSelected-this.minYear)/(this.maxYear-this.minYear); //Compute the new proportion of left range input
    this.leftPerSel.attr('min', -this.maxYearSelected); //Set the maximum value of the left range input to the right selected year
    this.updateWidth(pourcentage);

}

private rightHandleClick() : void {
    this.minYearSelected = -this.leftPerSel.property('value'); //Save the value of the left input
    this.leftPerSel.property('value', this.leftPerSel.attr('min'))//Set the left range input to the maximum value
    let pourcentage = (this.minYearSelected-this.minYear)/(this.maxYear-this.minYear);
    this.rightPerSel.attr('min', this.minYearSelected); //Set the minimum value of the right range input to the left selected year
    this.updateWidth(pourcentage);
}

private leftHandleInput() : void {
    if (!this.dragOn) {
        this.dragOn = true;
        this.leftHandleClick();
    }
    this.leftYear.html((-this.leftPerSel.property('value')).toString());
}

private rightHandleInput() : void {
    if (!this.dragOn) {
        this.dragOn = true;
        this.rightHandleClick();
    }
    this.rightYear.html((this.rightPerSel.property('value')).toString());
}

private mouseUpLeftHandler() : void {
    this.rightPerSel.property('value', this.maxYearSelected);
    this.minYearSelected = -this.leftPerSel.property('value'); //Save the value selected
    let mid = Math.round((Number(this.minYearSelected)+Number(this.maxYearSelected))/2);
    let pourcentage = (mid-this.minYear)/(this.maxYear-this.minYear);
    this.rightPerSel.attr('min', mid);
    this.leftPerSel.attr('min', -mid);
    this.updateWidth(pourcentage);

    // Reset the flag with a delay
    clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      this.dragOn = false;
    }, 100);

    console.log(this.minYearSelected, this.maxYearSelected);
    window.map.updateYearRange(this.minYearSelected, this.maxYearSelected);
}

private mouseUpRightHandler() : void {
    this.leftPerSel.property('value', -this.minYearSelected);
    this.maxYearSelected = this.rightPerSel.property('value');//Save the value selected
    let mid = Math.round((Number(this.minYearSelected)+Number(this.maxYearSelected))/2);
    let pourcentage = (mid-this.minYear)/(this.maxYear-this.minYear);
    this.leftPerSel.attr('min', -mid);
    this.rightPerSel.attr('min', mid);
    this.updateWidth(pourcentage);

    // Reset the flag with a delay
    clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
        this.dragOn = false;
    }, 100);

    console.log(this.minYearSelected, this.maxYearSelected);
    window.map.updateYearRange(this.minYearSelected, this.maxYearSelected);
}

private updateWidth(pourcentage : number) : void {
    this.leftPerSel.style('width', ((pourcentage*100).toString()+"%"));
    this.rightPerSel.style('width', ((100-pourcentage*100).toString()+"%"));
}

}