export const DEFAULT_FILE =  "Noisestorm - Breakout.mp3";
export const PLANET_COLORS = ["#b9b9b9", "#ffa31a", "#00ace6", "#fe3d1b", "#d6b78f", "#ffc266", "#cce6ff", "#0073e6"];
export const SUN_COLOR = "#ffff9f";



export const sizes = {
    PLANET_SIZE: 30,
    PLANET_BOUNCE: 150,
    PLANET_MINSIZE: 1,
    ORBIT_SIZE: 500,
    ORBIT_BOUNCE: 300,
    SUN_SIZE: 100,
    SUN_AURA_SIZE: 200,
    SUN_GRADIENT_SIZE: 400,
}

export const scaledSizes = () => {
    const res = {};
    for (const [key, value] of Object.entries(sizes)) {
        res[key] = value * global.app.controls.zoom;
    }
    res.WIDTH = global.app.ctx.canvas.width;
    res.HEIGHT = global.app.ctx.canvas.height;
    return res;
}