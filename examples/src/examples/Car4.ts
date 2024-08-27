import { physics } from "../../../dist/index.js";

let chassis: physics.DynamicRigidBody | undefined = undefined;

// jointed car
export function car4Init() {
    const world = physics.createWorld({ x: 0, y: 300 });
    world.damp = 0.99;

    const friction = 1;
    let lastAngle = 0.1;

    for (let i=0;i<50;i++) {
        let rect = physics.createRectangle(world, { x: 250 + (i * 390), y: 420 }, 400, 30, 0, friction, 0.5);
        physics.addBody(world, rect);

        physics.rotateBody(rect, i % 2 === 0 ? 0.2 : -0.2 )
    }
    const circle1 = physics.createCircle(world, { x: 150, y: 0 }, 15, 3, friction, 0);
    physics.addBody(world, circle1);
    const circle2 = physics.createCircle(world, { x: 190, y: 0 }, 15, 3, friction, 0);
    physics.addBody(world, circle2);

    const leftAnchor = physics.createCircleShape(world, { x: 150, y: 0 }, 3, true);
    const rightAnchor = physics.createCircleShape(world, { x: 190, y: 0 }, 3, true);
    const base = physics.createRectangleShape(world, { x: 170, y: -25 }, 60, 20, 0);
    chassis = physics.createRigidBody(world, { x: 170, y: 0 }, 1, friction, 0, [base, leftAnchor, rightAnchor]) as physics.DynamicRigidBody
    physics.addBody(world, chassis);
    physics.excludeCollisions(world, chassis, circle1);
    physics.excludeCollisions(world, chassis, circle2);
    physics.createJoint(world, circle1, leftAnchor, 1, 0);
    physics.createJoint(world, circle2, rightAnchor, 1, 0);
    return world;
}

export function car4Update() {
    chassis.velocity.x = 150;
    return chassis;
}