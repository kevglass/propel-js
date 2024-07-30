import { physics } from "../../../dist/index.js";

// jointed car
export function carInit() {
    const world = physics.createWorld({ x: 0, y: 300 });

    let rect = physics.createRectangle(world, { x: 150, y: 80 }, 400, 30, 0, 0.5, 0.5);
    physics.rotateBody(rect, Math.PI / 6);
    physics.addBody(world, rect);
    rect = physics.createRectangle(world, { x: 350, y: 250 }, 400, 30, 0, 0.5, 0.5);
    physics.rotateBody(rect, -Math.PI / 8);
    physics.addBody(world, rect);
    rect = physics.createRectangle(world, { x: 150, y: 420 }, 400, 30, 0, 0.5, 0.5);
    physics.rotateBody(rect, Math.PI / 8);
    physics.addBody(world, rect);

    const circle1 = physics.createCircle(world, { x: 50, y: 0 }, 15, 3, 0.5, 1);
    physics.addBody(world, circle1);
    const circle2 = physics.createCircle(world, { x: 90, y: 0 }, 15, 3, 0.5, 1);
    physics.addBody(world, circle2);
    physics.createJoint(world, circle1, circle2, 0.5, 0.5);

    return world;
}