import { physics } from "../../../dist/index.js";
let chassis = undefined;
let circle1 = undefined;
let circle2 = undefined;
let left = false;
let right = false;
// jointed car
export function carInteractiveInit() {
    const world = physics.createWorld({ x: 0, y: 300 });
    world.damp = 0.99;
    const friction = 1;
    let rect = physics.createRectangle(world, { x: 250, y: 458 }, 400, 30, 0, friction, 0.5);
    physics.addBody(world, rect);
    for (let i = 1; i < 50; i++) {
        let rect = physics.createRectangle(world, { x: 250 + (i * 390), y: 420 }, 400, 30, 0, friction, 0.5);
        physics.addBody(world, rect);
        physics.rotateBody(rect, i % 2 === 0 ? 0.2 : -0.2);
    }
    circle1 = physics.createCircle(world, { x: 150, y: 0 }, 15, 3, friction, 0);
    physics.addBody(world, circle1);
    circle2 = physics.createCircle(world, { x: 190, y: 0 }, 15, 3, friction, 0);
    physics.addBody(world, circle2);
    const leftAnchor = physics.createCircleShape(world, { x: 150, y: 0 }, 3, true);
    const rightAnchor = physics.createCircleShape(world, { x: 190, y: 0 }, 3, true);
    const base = physics.createRectangleShape(world, { x: 170, y: -25 }, 60, 20, 0);
    chassis = physics.createRigidBody(world, { x: 170, y: 0 }, 1, friction, 0, [base, leftAnchor, rightAnchor]);
    physics.addBody(world, chassis);
    physics.excludeCollisions(world, chassis, circle1);
    physics.excludeCollisions(world, chassis, circle2);
    physics.createJoint(world, circle1, leftAnchor, 1, 0);
    physics.createJoint(world, circle2, rightAnchor, 1, 0);
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
    chassis.restingTime = 0;
    circle1.restingTime = 0;
    circle2.restingTime = 0;
    const delta = 1 / 60;
    const input = (right ? 1 : 0) - (left ? 1 : 0);
    // question: not sure why such a high value is needed?
    const torque = 10000000000;
    circle1.angularAcceleration = (input * torque * delta) / circle1.inertia;
    circle2.angularAcceleration = (input * torque * delta) / circle2.inertia;
    /**
     * after landing on the ground, there are 18 collisions:
     * bodyAId is either 102 or 104 (I guess these are the circles / wheels)
     * bodyBId is 2 (I guess this is the ground)
     *
     * question: why are there multiple collisions in the same tick for the same bodies? is that intended?
     *
     * after tipping the right or left arrow key for a split second, moving the car a few pixels forward, this changes.
     * there are either 9, 10, 17 or no collisions.
     * question: is this because the car is jumping a bit? there are quite a lot of ticks with no collision.
     */
    console.log(collisions);
    const hasCollisionCircle1 = collisions.some(c => c.bodyAId === circle1.id || c.bodyBId === circle1.id);
    const hasCollisionCircle2 = collisions.some(c => c.bodyAId === circle2.id || c.bodyBId === circle2.id);
    const isMidAir = !hasCollisionCircle1 && !hasCollisionCircle2;
    // fake tilting of the car
    // question: this is so much lower than is needed for the wheels, why is that?
    const chassisTorque = -1;
    if (isMidAir) {
        chassis.angularAcceleration = (input * chassisTorque * delta) / chassis.inertia;
    }
    else {
        chassis.angularAcceleration = 0;
    }
    return chassis;
}
