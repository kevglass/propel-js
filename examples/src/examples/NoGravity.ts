import { physics } from "../../../dist/index.js";

// simple shapes
export function noGravityInit(): physics.World {
    const world = physics.createWorld({ x: 0, y: 0 }, 20);
    const circle = physics.createCircle(world, { x: 250, y: 150 }, 40, 1, 0.5, 0.5);
    physics.addBody(world, circle);
    const box = physics.createRectangle(world, { x: 255, y: 0 }, 40, 40, 1, 0.5, 0.5) as physics.DynamicRigidBody;
    physics.addBody(world, box);

    box.velocity.y = 25;

    return world;
}
