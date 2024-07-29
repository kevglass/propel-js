import { physics } from "../../dist/physics.js";
const canvas = document.getElementById("render");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;
document.getElementById("demo").addEventListener("change", selectDemo);
document.getElementById("restart").addEventListener("click", restart);
let world = physics.createWorld();
let currentDemo = "example1";
export function example1() {
    world = physics.createWorld();
    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect);
    const circle = physics.createCircle(world, { x: 250, y: 150 }, 40, 1, 0.5, 0.5);
    physics.addBody(world, circle);
    const box = physics.createRectangle(world, { x: 255, y: 0 }, 40, 40, 1, 0.5, 0.5);
    physics.addBody(world, box);
}
export function example2() {
    world = physics.createWorld();
    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect);
    for (let i = 0; i < 5; i++) {
        const width = 5 - i;
        for (let x = 0; x < width; x++) {
            const p = 275 - (width * 50 / 2) + (x * 50);
            const box = physics.createRectangle(world, { x: p, y: 400 - (i * 50) }, 45, 45, 1, 0.5, 0.1);
            physics.addBody(world, box);
        }
    }
}
function render() {
    requestAnimationFrame(render);
    physics.worldStep(60, world);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.clearRect(0, 0, 500, 500);
    for (const body of physics.allBodies(world)) {
        if (body.type === physics.ShapeType.CIRCLE) {
            ctx.save();
            ctx.translate(body.center.x, body.center.y);
            ctx.rotate(body.angle);
            ctx.beginPath();
            ctx.arc(0, 0, body.bounds, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, body.bounds);
            ctx.stroke();
            ctx.restore();
        }
        if (body.type === physics.ShapeType.RECTANGLE) {
            ctx.save();
            ctx.translate(body.center.x, body.center.y);
            ctx.rotate(body.angle);
            ctx.strokeRect(-body.width / 2, -body.height / 2, body.width, body.height);
            ctx.restore();
        }
    }
}
export function selectDemo() {
    const demo = document.getElementById("demo").value;
    currentDemo = demo;
    restart();
}
export function restart() {
    DEMOS[currentDemo]();
}
const DEMOS = {
    "example1": example1,
    "example2": example2,
};
restart();
requestAnimationFrame(render);
