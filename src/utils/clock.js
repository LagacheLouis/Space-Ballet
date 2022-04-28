export default class Clock{
    constructor(){ 
        this.time = performance.now() / 1000;
        this.delta = 0;
    }

    update(){
        const t = performance.now() / 1000;
        this.delta = t - this.time;
        this.time = t;
    }
}