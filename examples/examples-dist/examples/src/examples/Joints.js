import { physics } from "../../../dist/index.js";
// simple joints
export function jointsInit() {
    const world = physics.createWorld();
    for (let i = 0; i < 3; i++) {
        const rect = physics.createRectangle(world, { x: 150 + (i * 70), y: 50 }, 30, 30, 0, 0, 0.5);
        physics.addBody(world, rect);
        const circle = physics.createCircle(world, { x: 150 + (i * 70), y: 250 }, 20, 1, 0, 1);
        physics.addBody(world, circle);
        physics.createJoint(world, rect, circle, 1, 0);
        if (i === 0) {
            circle.velocity.x = -150;
        }
    }
    return world;
}
