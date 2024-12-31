import { physics } from "../../../dist/index.js";
let player;
let left = false;
let right = false;
let onFloor = false;
const MOVE_SPEED = 60;
const JUMP_SPEED = 200;
// simple shapes
export function platformerInit() {
    const world = physics.createWorld({ x: 0, y: 300 });
    world.damp = 1;
    world.angularDamp = 1;
    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect);
    const rect2 = physics.createRectangle(world, { x: 435, y: 335 }, 30, 200, 0, 0.5, 0.5);
    physics.addBody(world, rect2);
    player = physics.createRectangle(world, { x: 255, y: 400 }, 30, 60, 1, 0, 0.5);
    player.fixedRotation = true;
    physics.addBody(world, player);
    const box = physics.createRectangle(world, { x: 100, y: 400 }, 40, 40, 0, 0.5, 0.5);
    physics.addBody(world, box);
    const box2 = physics.createRectangle(world, { x: 250, y: 330 }, 140, 10, 0, 0.5, 0.5);
    physics.addBody(world, box2);
    const circle = physics.createCircle(world, { x: 250, y: 150 }, 20, 5, 0.5, 0.5);
    physics.addBody(world, circle);
    return world;
}
export function platformerInput(world, input, on) {
    if (on) {
        if (input === "a" || input === "ArrowLeft") {
            left = true;
        }
        if (input === "d" || input === "ArrowRight") {
            right = true;
        }
        if (input === " " || input === "ArrowUp" || input === "w") {
            if (onFloor) {
                player.velocity.y = -JUMP_SPEED;
            }
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
export function platformerUpdate(world, collisions) {
    player.velocity.x = (left ? -MOVE_SPEED : 0) + (right ? MOVE_SPEED : 0);
    player.restingTime = 0;
    const allBodies = physics.allBodies(world);
    onFloor = collisions.find(c => {
        if (c.bodyAId === player.id) {
            const other = allBodies.find(b => b.id === c.bodyBId);
            return other?.center.y > player.center.y;
        }
        if (c.bodyBId === player.id) {
            const other = allBodies.find(b => b.id === c.bodyAId);
            return other?.center.y > player.center.y;
        }
        return false;
    }) != undefined;
    return;
}
