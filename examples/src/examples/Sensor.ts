import { physics } from "../../../dist/index.js";

// simple shapes
export function sensorInit(): physics.World {
    const world = physics.createWorld();

    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, 1, 0);
    physics.addBody(world, rect);

    const staticSensor = physics.createRectangle(world, { x: 255, y: 200 }, 20, 20, 0, 0.5, 0.5, true);
    physics.addBody(world, staticSensor);

    const shape = physics.createRectangleShape({ x: 255, y: 0 }, 40, 40);
    const sensor = physics.createRectangleShape({ x: 255, y: 20 }, 40, 10, true);

    const box = physics.createRigidBody(world, {x: 255, y: 0 }, 1, 1, 0, [shape, sensor]) as physics.DynamicRigidBody;
    box.fixedRotation = true;
    physics.addBody(world, box);

    return world;
}
