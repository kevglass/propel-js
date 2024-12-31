import { physics } from "../../../dist/index.js";

export function avianUpdate(world: physics.World) {
    if (world.frameCount === 120) {
        const friction = 0.5;
        const rest = 0.5;
        const ball = physics.createCircle(world, { x: 80, y: 400 }, 10, 20, friction, rest) as physics.DynamicRigidBody;
        physics.addBody(world, ball);
        ball.velocity.x = 500 + Math.floor(Math.random() * 100);
        ball.velocity.y = -400 + Math.floor(Math.random() * 300);
    }

    return undefined
}

export function avianInit(): physics.World {
    const world = physics.createWorld({ x: 0, y: 300 });
    world.damp = 0.98;
    world.restTime = 10;
    
    const friction = 0.5;
    const rest = 0.5;

    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 600, 30, 0, friction, rest);
    physics.addBody(world, rect);
    const box = physics.createRectangle(world, { x: 40, y: 410 }, 60, 20, 0, friction, rest);
    physics.setRotation(box as physics.DynamicRigidBody, -Math.PI / 6);
    physics.addBody(world, box);
    const circle = physics.createCircle(world, { x: 30, y: 420 }, 15, 0, friction, rest);
    physics.addBody(world, circle);


    let crate = physics.createRectangle(world, { x: 330, y: 400 }, 170, 15,1, friction, rest);
    physics.addBody(world, crate);
    crate = physics.createRectangle(world, { x: 280, y: 420 }, 15, 30,1, friction, rest);
    physics.addBody(world, crate);
    crate = physics.createRectangle(world, { x: 380, y: 420 }, 15, 30,1, friction, rest);
    physics.addBody(world, crate);

    crate = physics.createRectangle(world, { x: 300, y: 370 }, 15, 30,1, friction, rest);
    physics.addBody(world, crate);
    crate = physics.createRectangle(world, { x: 360, y: 370 }, 15, 30,1, friction, rest);
    physics.addBody(world, crate);
    crate = physics.createRectangle(world, { x: 330, y: 350 }, 140, 15,1, friction, rest);
    physics.addBody(world, crate);

    crate = physics.createRectangle(world, { x: 330, y: 330 }, 30, 50,1, friction, rest);
    physics.addBody(world, crate);

    crate = physics.createRectangle(world, { x: 330, y: 300 }, 140, 15,1, friction, rest);
    physics.addBody(world, crate);

    crate = physics.createRectangle(world, { x: 310, y: 270 }, 15, 30,1, friction, rest);
    physics.addBody(world, crate);
    crate = physics.createRectangle(world, { x: 330, y: 270 }, 15, 30,1, friction, rest);
    physics.addBody(world, crate);
    crate = physics.createRectangle(world, { x: 350, y: 270 }, 15, 30,1, friction, rest);
    physics.addBody(world, crate);

    return world;
}
