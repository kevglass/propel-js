import { physics } from "../../../dist/index.js";

export function gooInit(): physics.World {
    const world = physics.createWorld();
    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect);
    const rect2 = physics.createRectangle(world, { x: 200, y: 410 }, 50, 50, 0, 0.5, 0.5);
    physics.addBody(world, rect2);
    const rect3 = physics.createRectangle(world, { x: 300, y: 410 }, 50, 50, 0, 0.5, 0.5);
    physics.addBody(world, rect3);

    const ptCount = 20;
    const size = 40;
    const bodies: physics.Body[] = [];
    for (let i=0;i<ptCount;i++) {
        const x = 250 + (Math.cos((Math.PI * 2 / ptCount) * i) * size);
        const y = 100 + (Math.sin((Math.PI * 2 / ptCount) * i) * size);
        const point = physics.createCircle(world, { x, y }, 6, 1, 0.0, 0.0);
        bodies.push(point);
        physics.addBody(world, point);
    }

    for (let i=0;i<ptCount;i++) {
        let j = (i + Math.floor(ptCount / 2)) % ptCount;
        physics.createJoint(world, bodies[i], bodies[j], 0.005, 0.01, true);
        j = (i + 1) % ptCount;
        physics.createJoint(world, bodies[i], bodies[j], 0.005, 0.01, true);
    }

    return world;
}
