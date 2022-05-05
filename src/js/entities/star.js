import { scaledSizes } from "../constants";

export default class Star {
    constructor(simplex) {
        const {WIDTH, HEIGHT} = scaledSizes();
        this.posX = Math.random() * WIDTH;
        this.posY = Math.random() * HEIGHT;
        this.noiseX = Math.random() * 100;
        this.noiseY = Math.random() * 100;
        this.brightness = Math.random();
        this.simplex = simplex;
    }

    update(nob) {
        const {WIDTH, HEIGHT} = scaledSizes();
        const {clock, controls} = global.app;
        if (this.posX < 0) {
            this.posX = WIDTH;
        }
        if (this.posX > WIDTH) {
            this.posX = 0;
        }

        if (this.posY < 0) {
            this.posY = HEIGHT;
        }
        if (this.posY > HEIGHT) {
            this.posY = 0;
        }


        let dirX = this.simplex.noise2D(0, this.noiseX / 5) * 250 * nob * nob;
        let dirY = this.simplex.noise2D(0, this.noiseY / 5) * 250 * nob * nob;

        this.noiseX += clock.delta;
        this.noiseY += clock.delta;
        this.posX += dirX * clock.delta;
        this.posY += dirY * clock.delta;

        this.globalY = this.posY - controls.yaxis * HEIGHT * 2;
        while(this.globalY > HEIGHT)
            this.globalY -= HEIGHT;
        while(this.globalY < 0)
            this.globalY += HEIGHT;

        this.draw(nob);
    }

    draw(nob) {
        const {ctx} = global.app;
        ctx.save();
        ctx.translate(this.posX, this.globalY);
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.globalAlpha = this.brightness;
        ctx.fill();
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}