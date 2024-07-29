import { physics } from "../../dist/physics.js";

const canvas = document.getElementById("render") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = 500;
canvas.height = 500;

document.getElementById("demo").addEventListener("change", selectDemo);
document.getElementById("restart").addEventListener("click", restart);

let world = physics.createWorld();
let currentDemo;

// simple shapes
export function example1() {
    world = physics.createWorld();
    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect);
    const circle = physics.createCircle(world, { x: 250, y: 150 }, 40, 1, 0.5, 0.5);
    physics.addBody(world, circle);
    const box = physics.createRectangle(world, { x: 255, y: 0 }, 40, 40, 1, 0.5, 0.5);
    physics.addBody(world, box);
}

// stack of blocks
export function example2() {
    world = physics.createWorld();
    world.restTime = 0.25;
    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect);

    for (let i=0;i<5;i++) {
        const width = 5 - i;
        for (let x=0;x<width;x++) {
            const p = 275 - (width * 50 / 2) + (x * 50);
            const box = physics.createRectangle(world, { x: p, y: 400-(i*50) }, 45, 45, 1, 0.5, 0.1);
            physics.addBody(world, box);
        }
    }
}

// every growing pile
let frameCount = 0;

export function example3() {
    world = physics.createWorld();
    world.restTime = 1000;
    const rect = physics.createRectangle(world, { x: 250, y: 450 }, 400, 30, 0, 0.5, 0.5);
    physics.addBody(world, rect);
}

export function example3Update() {
    if (frameCount % 30 === 0) {
        if (Math.random() < 0.5) {
            const circle = physics.createCircle(world, { x: 50 + Math.floor(Math.random()* 400), y: 0 }, 20 + (Math.random() * 20), 1, 0.5, 1);
            physics.setRotation(circle as physics.DynamicRigidBody, Math.random() * Math.PI * 2);
            physics.addBody(world, circle);
        } else {
            const box = physics.createRectangle(world, { x: 50 + Math.floor(Math.random()* 400), y: 0 }, 20 + (Math.random() * 20), 20 + (Math.random() * 20), 1, 0.5, 1);
            physics.setRotation(box as physics.DynamicRigidBody, Math.random() * Math.PI * 2);
            physics.addBody(world, box);
        }
    }

    for (const body of world.dynamicBodies) {
        if (body.center.y > 600) {
            physics.removeBody(world, body);
        }
    }
    frameCount++;
}

// simple joints
export function example4() {
    world = physics.createWorld();

    for (let i=0;i<3;i++) {
        const rect = physics.createRectangle(world, { x: 150 + (i*70), y: 50 }, 30, 30, 0, 0, 0.5);
        physics.addBody(world, rect);
        const circle = physics.createCircle(world, { x: 150 + (i*70), y: 250 }, 20, 1, 0, 0.5);
        physics.addBody(world, circle);
        const joint = physics.createJoint(world, rect, circle, 0.5, 0.5);

        if (i === 0) {
            (circle as physics.DynamicRigidBody).velocity.x = -150;
        }
    }
}

// jointed car
export function example5() {
    world = physics.createWorld({ x: 0, y: 300 });

    let rect = physics.createRectangle(world, { x: 150, y: 80 }, 400, 30, 0, 0.5, 0.5);
    physics.rotateBody(rect, Math.PI / 6);
    physics.addBody(world, rect);
    rect = physics.createRectangle(world, { x: 350, y: 250 }, 400, 30, 0, 0.5, 0.5);
    physics.rotateBody(rect, -Math.PI / 8);
    physics.addBody(world, rect);
    rect = physics.createRectangle(world, { x: 150, y: 420 }, 400, 30, 0, 0.5, 0.5);
    physics.rotateBody(rect, Math.PI / 8);
    physics.addBody(world, rect);

    const circle1 = physics.createCircle(world, { x: 50, y: 0 }, 15, 3, 0.5, 1);
    physics.addBody(world, circle1);
    const circle2 = physics.createCircle(world, { x: 90, y: 0 }, 15, 3, 0.5, 1);
    physics.addBody(world, circle2);
    physics.createJoint(world, circle1, circle2, 0.5, 0.5);
}

function render() {
    requestAnimationFrame(render);
    physics.worldStep(60, world);

    if (currentDemo.update) {
        currentDemo.update();
    }

    ctx.lineWidth = 3;

    ctx.clearRect(0,0,500,500);

    const bodies = physics.allBodies(world);
    for (const joint of world.joints) {
        ctx.strokeStyle = "yellow";

        const bodyA = bodies.find(b => b.id === joint.bodyA);
        const bodyB= bodies.find(b => b.id === joint.bodyB);
        ctx.beginPath();
        ctx.moveTo(bodyA.center.x, bodyA.center.y);
        ctx.lineTo(bodyB.center.x, bodyB.center.y);
        ctx.stroke();
    }
    for (const body of bodies) {
        ctx.strokeStyle = "white";
        if (body.static) {
            ctx.strokeStyle = "grey";
        } else if ((body as physics.DynamicRigidBody).restingTime > 1) {
            ctx.strokeStyle = "green";
        }
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
            ctx.strokeRect(-body.width/2, -body.height/2, body.width, body.height);
            ctx.restore();
        }
    }
}

export function selectDemo() {
    const demo = (document.getElementById("demo") as HTMLSelectElement).value;
    currentDemo = DEMOS.find(d => d.name === demo);
    restart();
}

export function restart() {
    currentDemo.init();
} 

const DEMOS = [
    { name: "Simple", init: example1 },
    { name: "Stacks", init: example2 },
    { name: "Pile", init: example3, update: example3Update },
    { name: "Joints", init: example4 },
    { name: "Car", init: example5 },
];

const demoList = document.getElementById("demo");
for (const demo of DEMOS) {
    const option = document.createElement("option") as HTMLOptionElement;
    option.value = demo.name;
    option.innerHTML = demo.name;
    demoList.appendChild(option);
}
currentDemo = DEMOS[0];

restart();
requestAnimationFrame(render);

