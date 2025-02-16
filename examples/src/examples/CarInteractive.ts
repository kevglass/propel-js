import { physics } from "../../../dist/index.js";

let chassisId: number;
let circle1Id: number;
let circle2Id: number;

let left: boolean = false;
let right: boolean = false;

const MAX_VELOCITY: number = 10000;
const CAR_ACCEL: number = 2000;
const CAR_TILT: number = 2

let lastOnGround = Date.now();
let rightSensorId: number;
let leftSensorId: number;

// jointed car
export function carInteractiveInit() {
    const world = physics.createWorld({ x: 0, y: 300 });
    world.damp = 0.99;
    world.angularDamp = 0.95;
    const friction = 1;

    let rect = physics.createRectangle(world, { x: 250, y: 458 }, 400, 30, 0, friction, 0);
    physics.addBody(world, rect);
    for (let i=1;i<50;i++) {
        let rect = physics.createRectangle(world, { x: 250 + (i * 390), y: 420 }, 400, 30, 0, friction, 0);
        physics.addBody(world, rect);

        physics.rotateBody(rect, i % 2 === 0 ? 0.2 : -0.2 )
    }

    const leftAnchor = physics.createCircleShape(world, { x: 150, y: 0 }, 3);
    const rightAnchor = physics.createCircleShape(world, { x: 190, y: 0 }, 3);

    // give them a bit of padding to consume the resolution of wheels against floor
    const leftSensor = physics.createCircleShape(world, { x: 150, y: 0 }, 16.5, true);
    const rightSensor = physics.createCircleShape(world, { x: 190, y: 0 }, 16.5, true);
    leftSensorId = leftSensor.id
    rightSensorId = rightSensor.id

    const base = physics.createRectangleShape(world, { x: 170, y: -25 }, 60, 20, 0);
    const chassis = physics.createRigidBody(world, { x: 170, y: 10 }, 1, friction, 0, [base, leftAnchor, rightAnchor,leftSensor, rightSensor]) as physics.DynamicRigidBody
    const circle1 = physics.createCircle(world, { x: 150, y: 0 }, 15, 3, friction, 0) as physics.DynamicRigidBody;
    const circle2 = physics.createCircle(world, { x: 190, y: 0 }, 15, 3, friction, 0) as physics.DynamicRigidBody;

    chassisId = chassis.id;
    circle1Id = circle1.id;
    circle2Id = circle2.id;

    physics.addBody(world, chassis);
    physics.addBody(world, circle1);
    physics.addBody(world, circle2);

    
    physics.excludeCollisions(world, chassis, circle1);
    physics.excludeCollisions(world, chassis, circle2);
    physics.createJoint(world, circle1, leftSensor, 1, 0);
    physics.createJoint(world, circle2, rightSensor, 1, 0);
    return world;
}

export function carInteractiveInput(world: physics.World, input: string, on: boolean) {
    if (on) {
        if (input === "a" || input === "ArrowLeft") {
            left = true;
        }
        if (input === "d" || input === "ArrowRight") {
            right = true;
        }
    } else {
        if (input === "a" || input === "ArrowLeft") {
            left = false;
        }
        if (input === "d" || input === "ArrowRight") {
            right = false;
        }
    }
}

export function carInteractiveUpdate(world: physics.World, collisions: physics.Collision[]) {
    const chassis = world.dynamicBodies.find((b) => b.id === chassisId)!
    const circle1 = world.dynamicBodies.find((b) => b.id === circle1Id)!
    const circle2 = world.dynamicBodies.find((b) => b.id === circle2Id)!

    const leftSensor = chassis.shapes.find((s) => s.id === leftSensorId)!
    const rightSensor = chassis.shapes.find((s) => s.id === rightSensorId)!

    const isMidAir = !leftSensor.sensorColliding && !rightSensor.sensorColliding

    chassis.restingTime = 0;
    circle1.restingTime = 0;
    circle2.restingTime = 0;

    const delta = 1 / 60;

    // since we're sure the body is on the ground it ok to drive the chassis forward since it
    // gives uniform velocity to the wheels
    if (!isMidAir) {
        if (left) {
            chassis.velocity.x = Math.max(-MAX_VELOCITY, chassis.velocity.x - CAR_ACCEL * delta)
        } 
        if (right) {
            chassis.velocity.x = Math.min(MAX_VELOCITY, chassis.velocity.x + CAR_ACCEL * delta)
        }
    }

    // if we've been off the ground for a bit then allow explicitly tilting the car. Note that
    // this is totally non-physical so we're giving the player direct control of the car's angle
    // and want to ignore any other velocity/acceleration on it
    if (isMidAir) {
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
