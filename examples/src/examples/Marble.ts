import { physics } from "../../../dist/index.js";

// simple shapes
export function marbleInit(): physics.World {
    const world = physics.createWorld();
    world.damp = 0.99;
    world.angularDamp = 0.95;

    const slope1 = physics.createRectangle(world, { x: 200, y: 200 }, 200, 10, 0, 0.3, 0.3);
    physics.rotateBody(slope1, Math.PI / 6);
    physics.addBody(world, slope1);

    const slope2 = physics.createRectangle(world, { x: 400, y: 300 }, 200, 10, 0, 0.3, 0.3);
    physics.rotateBody(slope2, -Math.PI / 6);
    physics.addBody(world, slope2);

    const wheelWing1 = physics.createRectangleShape(world, { x: 200, y: 400 }, 10, 100);
    const wheelWing2 = physics.createRectangleShape(world, { x: 200, y: 400 }, 10, 100, Math.PI / 2);
    const wheel = physics.createRigidBody(world, { x: 200, y: 400 }, 1, 0.3, 0.3, [wheelWing1, wheelWing2]);
    physics.addBody(world, wheel);

    const wheelJoint = physics.createCircle(world, { x: 200, y: 400 }, 10, 0, 0.3, 0.3, false);
    physics.addBody(world, wheelJoint);
    physics.excludeCollisions(world, wheel, wheelJoint);
    physics.createJoint(world, wheel, wheelJoint, 0, 0);

    const marble1 = physics.createCircle(world, { x: 225, y: -100 }, 20, 2, 0.3, 0.3);
    physics.addBody(world, marble1);

    const marble2 = physics.createCircle(world, { x: 275, y: -200 }, 20, 2, 0.3, 0.3);
    physics.addBody(world, marble2);

    return world;
}
