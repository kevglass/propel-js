import { physics } from "../../../dist/index.js";
// simple shapes
export function compoundInit() {
    const world = physics.createWorld();
    world.damp = 0.98;
    world.restTime = 0.25;
    const restitution = 0.1;
    const friction = 0.5;
    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, friction, restitution);
    physics.addBody(world, rect);
    const rect2 = physics.createRectangle(world, { x: 230, y: 300 }, 20, 30, 0, friction, restitution);
    physics.addBody(world, rect2);
    const shape1 = physics.createRectangleShape({ x: 255, y: 50 }, 40, 40);
    const shape2 = physics.createRectangleShape({ x: 225, y: 50 }, 20, 80, Math.PI * 1.4);
    const shape3 = physics.createRectangleShape({ x: 275, y: 50 }, 20, 60);
    const body = physics.createRigidBody(world, { x: 255, y: 50 }, 1, friction, restitution, [shape1, shape2, shape3]);
    physics.addBody(world, body);
    const shape4 = physics.createCircleShape({ x: 145, y: 0 }, 20);
    const shape5 = physics.createRectangleShape({ x: 125, y: 0 }, 20, 80, Math.PI * 1.4);
    const body2 = physics.createRigidBody(world, { x: 145, y: 0 }, 1, friction, restitution, [shape4, shape5]);
    physics.addBody(world, body2);
    return world;
}
