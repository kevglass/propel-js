import { physics } from "../../../dist/index.js";

export function createNShapes(center: physics.Vector2, size: number, sides: number, edgeDepth: number = 10): physics.Shape[] {
    const edgeLength = 2 * size * Math.sin(Math.PI / sides);
    const dis = (size * Math.cos(Math.PI / sides)) - (edgeDepth / 2);
    const shapes: physics.Shape[] = [];
    for (let i = 0; i < sides; i++) {
        const ang = (Math.PI * 2 / sides) * i;
        const shape = physics.createRectangleShape({ x: center.x + (Math.cos(ang) * dis), y: center.y + (Math.sin(ang) * dis) }, edgeDepth, edgeLength, ang);
        shapes.push(shape);
    }

    return shapes;

}

// simple shapes
export function polyboxInit(): physics.World {
    const world = physics.createWorld();
    world.damp = 0.98;
    world.restTime = 0.25;

    const restitution = 0.1;
    const friction = 0.5;

    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, friction, restitution);
    physics.addBody(world, rect);


    const body = physics.createRigidBody(world, { x: 255, y: 50 }, 1, friction, restitution, createNShapes({ x: 255, y: 50}, 40, 5, 10));
    physics.addBody(world, body);
    const body2 = physics.createRigidBody(world, { x: 135, y: 50 }, 1, friction, restitution, createNShapes({ x: 135, y: 50}, 30, 3, 1));
    physics.addBody(world, body2);
    const body3 = physics.createRigidBody(world, { x: 205, y: 0 }, 1, friction, restitution, createNShapes({ x: 205, y: 0}, 30, 6, 3));
    physics.addBody(world, body3);

    return world;
}
