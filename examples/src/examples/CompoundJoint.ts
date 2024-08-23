import { physics } from "../../../dist/index.js";

// simple shapes
export function compoundJointInit(): physics.World {
    const world = physics.createWorld();
    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect);
    const rect2 = physics.createRectangle(world, { x: 250, y: 50 }, 100, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect2);
    
    const restitution = 0.1;
    const friction = 0.5;
    const shape4 = physics.createCircleShape(world, { x: 255, y: 150 }, 20);
    const shape5 = physics.createRectangleShape(world, { x: 225, y: 150 }, 20, 80);
    const shape6 = physics.createRectangleShape(world, { x: 205, y: 120 }, 20, 20);
    const body2 = physics.createRigidBody(world, { x: 245, y: 150 }, 1, friction, restitution, [shape4, shape5, shape6]);
    physics.addBody(world, body2);

    physics.createJoint(world, rect2, shape6)

    return world;
}
