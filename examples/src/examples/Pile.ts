import { physics } from "../../../dist/index.js";

// every growing pile
let frameCount = 0;

export function pileInit(): physics.World {
    const world = physics.createWorld();
    world.restTime = 1000;
    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect);

    return world;
}

export function pileUpdate(world: physics.World) {
    if (frameCount % 30 === 0) {
        if (Math.random() < 0.5) {
            const circle = physics.createCircle(world, { x: 50 + Math.floor(Math.random()* 400), y: 0 }, 20 + (Math.random() * 20), 1, 0.5, 1);
            physics.setRotation(circle as physics.DynamicRigidBody, Math.random() * Math.PI * 2);
            physics.addBody(world, circle);
        } else {
            const box = physics.createRectangle(world, { x: 50 + Math.floor(Math.random()* 400), y: 0 }, 20 + (Math.random() * 20), 20 + (Math.random() * 20), 1, 0.5, 1);
            physics.setRotation(box as physics.DynamicRigidBody, Math.random() * Math.PI * 2);
            physics.addBody(world, box);
        }
    }

    for (const body of world.dynamicBodies) {
        if (body.center.y > 600) {
            physics.removeBody(world, body);
        }
    }
    frameCount++;
}
