import { physics } from "../../../dist/index.js";
let frameCount = 0;
let teleporter;
let teleporterSpawn;
export function teleporterInit() {
    const world = physics.createWorld();
    world.restTime = 1000;
    // teleporter
    teleporter = physics.createRectangle(world, { x: 140, y: 450 }, 180, 30, 0, 0.5, 0.5, true);
    physics.addBody(world, teleporter);
    // ground
    const rect = physics.createRectangle(world, { x: 360, y: 450 }, 180, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect);
    // this is not really needed as a physical object, it's just here to reference its position
    teleporterSpawn = physics.createRectangle(world, { x: 360, y: 150 }, 50, 50, 0, 0.5, 0.5);
    physics.addBody(world, teleporterSpawn);
    return world;
}
export function teleporterUpdate(world) {
    // spawn a new body every second
    if (frameCount % 60 === 0) {
        const spawnPosition = { x: 50 + Math.floor(Math.random() * 180), y: 0 };
        let body;
        if (Math.random() < 0.5) {
            body = physics.createCircle(world, spawnPosition, 20 + (Math.random() * 20), 1, 0.5, 1, false, { debug: 'circle' });
        }
        else {
            body = physics.createRectangle(world, spawnPosition, 20 + (Math.random() * 20), 20 + (Math.random() * 20), 1, 0.5, 1, false, { debug: 'rectangle' });
        }
        physics.setRotation(body, Math.random() * Math.PI * 2);
        physics.excludeCollisions(world, body, teleporterSpawn);
        physics.addBody(world, body);
    }
    // teleport bodies that touch the teleporter
    for (const teleporterShape of teleporter.shapes.filter(shape => shape.sensor)) {
        for (const collidingShapeId of teleporterShape.sensorCollisions) {
            const collidingBody = world.dynamicBodies.find(body => body.shapes.some(s => s.id === collidingShapeId));
            if (collidingBody) {
                // teleport the body to the spawn position
                physics.setCenter(collidingBody, teleporterSpawn.center);
                // reset the body's velocity and angular velocity
                // - or keep their original values for maximum chaos :-)
                collidingBody.velocity = { x: 0, y: 0 };
                collidingBody.angularVelocity = 0;
            }
        }
    }
    // remove bodies that fell off the screen
    for (const body of world.dynamicBodies) {
        if (body.center.y > 600) {
            physics.removeBody(world, body);
        }
    }
    frameCount++;
    return;
}
