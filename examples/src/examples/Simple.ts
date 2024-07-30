import { physics } from "../../../dist/index.js";

// simple shapes
export function simpleInit(): physics.World {
    const world = physics.createWorld();
    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect);
    const circle = physics.createCircle(world, { x: 250, y: 150 }, 40, 1, 0.5, 0.5);
    physics.addBody(world, circle);
    const box = physics.createRectangle(world, { x: 255, y: 0 }, 40, 40, 1, 0.5, 0.5);
    physics.addBody(world, box);

    return world;
}
