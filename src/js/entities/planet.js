import { scaledSizes } from "../constants";

export default class Planet {
    constructor(angle, color) {
        const { PLANET_SIZE, ORBIT_SIZE } = scaledSizes();
        this.sizeGround = PLANET_SIZE;
        this.sizeAtmosphere = PLANET_SIZE;

        this.startAngle = angle;
        this.angle = angle;
        this.orbit = ORBIT_SIZE;
        this.color = color;
        this.speedRatio = 0;            
    }

    update(nob) {
        const { PLANET_SIZE, ORBIT_SIZE, ORBIT_BOUNCE, PLANET_BOUNCE, PLANET_MINSIZE, HEIGHT, WIDTH } = scaledSizes();
        const {clock, controls } = global.app;

        this.angle = this.startAngle + 10 * Math.PI / 180 * clock.time;
        this.angle = this.angle % (Math.PI * 2);

        this.orbit += (ORBIT_SIZE + ORBIT_BOUNCE * nob - this.orbit) * 0.6;

        let orthoSize = PLANET_SIZE + PLANET_BOUNCE * nob;
        let size = PLANET_MINSIZE + orthoSize * this.getDepth() * (1 - Math.abs(controls.yaxis)) + orthoSize * Math.abs(controls.yaxis);
    

        this.posX = Math.cos(this.angle + Math.PI / 2) * this.orbit + WIDTH / 2;
        this.posY = Math.sin(this.angle + Math.PI / 2) * this.orbit * controls.yaxis + HEIGHT / 2;

        this.sizeGround += (size - this.sizeGround) * 0.6;
        this.sizeAtmosphere += (size * 1.5 - this.sizeAtmosphere) * 0.1;
        this.drawGround();
        this.drawAtmosphere();
    }

    drawGround() {
        const { ctx } = global.app;
        ctx.save();
        ctx.translate(this.posX, this.posY);
        ctx.beginPath();
        ctx.arc(0, 0, this.sizeGround, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    drawAtmosphere() {
        const { ctx } = global.app;
        ctx.save();
        ctx.translate(this.posX, this.posY);
        ctx.beginPath();
        ctx.arc(0, 0, this.sizeAtmosphere, 0, 2 * Math.PI);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    getDepth() {
        return Math.abs(Math.PI - this.angle) / Math.PI;
    }
}

export function sortPlanets(a, b) {
    if (a.getDepth() < b.getDepth())
        return -1;
    else if (a.getDepth() > b.getDepth())
        return 1;
    else
        return 0;
};