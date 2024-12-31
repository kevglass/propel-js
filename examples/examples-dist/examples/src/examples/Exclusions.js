import { physics } from "../../../dist/index.js";
// simple shapes with exclusions
export function exclusionsInit() {
    const world = physics.createWorld();
    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect);
    const circle = physics.createCircle(world, { x: 250, y: 150 }, 40, 1, 0.5, 0.5);
    physics.addBody(world, circle);
    const circle2 = physics.createCircle(world, { x: 200, y: 150 }, 40, 1, 0.5, 0.5);
    physics.addBody(world, circle2);
    physics.excludeCollisions(world, circle, circle2);
    return world;
}
