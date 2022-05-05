import { LIGHTRANGE, scaledSizes } from "../constants";
import { colorTemperatureToRGB } from "../utils/helpers";

export default class Sun {
    constructor() {
        this.temp = 1000;
    }

    update(nob) {
        const { WIDTH, HEIGHT } = scaledSizes();

        this.posX = WIDTH / 2;
        this.posY = HEIGHT / 2;

        this.temp += (1000 + 10000 * nob - this.temp) * 1;
        this.lightcolor = colorTemperatureToRGB(this.temp);
        this.coreColor = colorTemperatureToRGB(this.temp + 300);
        
        this.drawLight();
        this.drawAura();
        this.drawCore();
    }

    drawCore() {
        const { ctx } = global.app;
        const { SUN_SIZE } = scaledSizes();

        ctx.save();
        ctx.translate(this.posX, this.posY);
        ctx.beginPath();
        ctx.arc(0, 0, SUN_SIZE, 0, 2 * Math.PI);
        ctx.fillStyle = this.coreColor;
        ctx.fill();
        ctx.restore();
    }

    drawAura() {
        const { ctx, analyser, clock } = global.app;
        const { SUN_AURA_SIZE, SUN_SIZE } = scaledSizes();

        let j = 0;
        let x0 = 0;
        let y0 = 0;
        ctx.save();
        ctx.translate(this.posX, this.posY);
        ctx.rotate(clock.time * 0.15);
        ctx.beginPath();

        for (let i = 0; i < 100; i++) {
            let moy = analyser.getAverage({min: j, max: j+1});
            j++;
            if (j > 25) {
                j = 0;
            }

            let angle = i / 100 * Math.PI * 2;
            let x = Math.cos(angle) * (moy * SUN_AURA_SIZE + SUN_SIZE - 2);
            let y = Math.sin(angle) * (moy * SUN_AURA_SIZE + SUN_SIZE - 2);

            if (i == 0) {
                x0 = x;
                y0 = y;
            }

            ctx.lineTo(x, y);
        }

        ctx.lineTo(x0, y0);

        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = this.coreColor;
        ctx.stroke();
        ctx.restore();
    }

    drawLight(){     
        const { ctx } = global.app;
        const { SUN_SIZE, SUN_GRADIENT_SIZE } = scaledSizes();

        let grad = ctx.createRadialGradient(0,0,0,0,0,SUN_GRADIENT_SIZE);
        grad.addColorStop(SUN_SIZE/SUN_GRADIENT_SIZE,"white");
        grad.addColorStop(SUN_SIZE/SUN_GRADIENT_SIZE + 0.2,this.lightcolor);
        grad.addColorStop(1,"rgba(0,0,0,0)");
        ctx.save();
        ctx.translate(this.posX, this.posY);
        ctx.beginPath();
        ctx.arc(0, 0, SUN_GRADIENT_SIZE, 0, 2 * Math.PI);
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}