import { physics } from "../../../dist/index.js";

export function stackInit() {
    const world = physics.createWorld();
    world.restTime = 0.25;
    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect);

    for (let i=0;i<5;i++) {
        const width = 5 - i;
        for (let x=0;x<width;x++) {
            const p = 275 - (width * 50 / 2) + (x * 50);
            const box = physics.createRectangle(world, { x: p, y: 400-(i*50) }, 45, 45, 1, 0.5, 0.1);
            physics.addBody(world, box);
        }
    }

    return world;
}