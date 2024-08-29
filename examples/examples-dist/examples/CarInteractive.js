import { physics } from "../../../dist/index.js";
let chassis = undefined;
let circle1 = undefined;
let circle2 = undefined;
let left = false;
let right = false;
const MAX_VELOCITY = 10000;
const CAR_ACCEL = 1000;
const CAR_TILT = 2;
let lastOnGround = Date.now();
// jointed car
export function carInteractiveInit() {
    const world = physics.createWorld({ x: 0, y: 300 });
    world.damp = 0.99;
    world.angularDamp = 0.95;
    const friction = 1;
    let rect = physics.createRectangle(world, { x: 250, y: 458 }, 400, 30, 0, friction, 0);
    physics.addBody(world, rect);
    for (let i = 1; i < 50; i++) {
        let rect = physics.createRectangle(world, { x: 250 + (i * 390), y: 420 }, 400, 30, 0, friction, 0);
        physics.addBody(world, rect);
        physics.rotateBody(rect, i % 2 === 0 ? 0.2 : -0.2);
    }
    circle1 = physics.createCircle(world, { x: 150, y: 0 }, 15, 3, friction, 0);
    physics.addBody(world, circle1);
    circle2 = physics.createCircle(world, { x: 190, y: 0 }, 15, 3, friction, 0);
    physics.addBody(world, circle2);
    const leftAnchor = physics.createCircleShape(world, { x: 150, y: 0 }, 3);
    const rightAnchor = physics.createCircleShape(world, { x: 190, y: 0 }, 3);
    const leftSensor = physics.createCircleShape(world, { x: 150, y: 0 }, 15, true);
    const rightSensor = physics.createCircleShape(world, { x: 190, y: 0 }, 15, true);
    const base = physics.createRectangleShape(world, { x: 170, y: -25 }, 60, 20, 0);
    chassis = physics.createRigidBody(world, { x: 170, y: 10 }, 1, friction, 0, [base, leftAnchor, rightAnchor, leftSensor, rightSensor]);
    physics.addBody(world, chassis);
    physics.excludeCollisions(world, chassis, circle1);
    physics.excludeCollisions(world, chassis, circle2);
    physics.createJoint(world, circle1, leftSensor, 1, 0);
    physics.createJoint(world, circle2, rightSensor, 1, 0);
    return world;
}
export function carInteractiveInput(world, input, on) {
    if (on) {
        if (input === "a" || input === "ArrowLeft") {
            left = true;
        }
        if (input === "d" || input === "ArrowRight") {
            right = true;
        }
    }
    else {
        if (input === "a" || input === "ArrowLeft") {
            left = false;
        }
        if (input === "d" || input === "ArrowRight") {
            right = false;
        }
    }
}
export function carInteractiveUpdate(world, collisions) {
    const hasCollisionCircle1 = collisions.some(c => c.bodyAId === circle1.id || c.bodyBId === circle1.id);
    const hasCollisionCircle2 = collisions.some(c => c.bodyAId === circle2.id || c.bodyBId === circle2.id);
    const isMidAir = !hasCollisionCircle1 && !hasCollisionCircle2;
    if (!isMidAir) {
        lastOnGround = Date.now();
    }
    // single wheels are constantly bouncing we can get frames where they're both off the
    // ground (just) so account for these
    const inFlight = Date.now() - lastOnGround > 50;
    chassis.restingTime = 0;
    circle1.restingTime = 0;
    circle2.restingTime = 0;
    const delta = 1 / 60;
    const input = (right ? 1 : 0) - (left ? 1 : 0);
    // since we're sure the body is on the ground it ok to drive the chassis forward since it
    // gives uniform velocity to the wheels
    if (!inFlight) {
        if (left) {
            chassis.velocity.x = Math.max(-MAX_VELOCITY, chassis.velocity.x - CAR_ACCEL * delta);
        }
        if (right) {
            chassis.velocity.x = Math.min(MAX_VELOCITY, chassis.velocity.x + CAR_ACCEL * delta);
        }
    }
    // if we've been off the ground for a bit then allow explicitly tilting the car. Note that
    // this is totally non-physical so we're giving the player direct control of the car's angle
    // and want to ignore any other velocity/acceleration on it
    if (inFlight) {
        if (left) {
            physics.rotateBody(chassis, -CAR_TILT * delta);
            chassis.angularVelocity = 0;
        }
        if (right) {
            physics.rotateBody(chassis, CAR_TILT * delta);
            chassis.angularVelocity = 0;
        }
    }
    return chassis;
}
