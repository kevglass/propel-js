import { physics } from "../../../dist/index.js";
export function wobblyJointsInit() {
    const world = physics.createWorld();
    const width = 200;
    const center = { x: 250, y: 300 };
    const leftAnchorPosition = { x: center.x - width / 2, y: center.y };
    const rightAnchorPosition = { x: center.x + width / 2, y: center.y };
    const leftAnchor = physics.createCircleShape(world, leftAnchorPosition, 5);
    const rightAnchor = physics.createCircleShape(world, rightAnchorPosition, 5);
    const shape = physics.createRectangleShape(world, center, width, 50);
    const leftCircle = physics.createCircle(world, leftAnchorPosition, 5, 0, 0.3, 0.3);
    physics.addBody(world, leftCircle);
    const rightCircle = physics.createCircle(world, rightAnchorPosition, 5, 0, 0.3, 0.3);
    physics.addBody(world, rightCircle);
    const rect = physics.createRigidBody(world, center, 1000, 0.3, 0.3, [shape, leftAnchor, rightAnchor]);
    physics.addBody(world, rect);
    physics.createJoint(world, leftAnchor, leftCircle, 0, 0);
    physics.createJoint(world, rightAnchor, rightCircle, 0, 0);
    physics.excludeCollisions(world, rect, leftCircle);
    physics.excludeCollisions(world, rect, rightCircle);
    return world;
}
