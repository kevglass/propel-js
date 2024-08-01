import { physics } from "../../dist/index.js";
import { simpleInit } from "./examples/Simple.js";
import { stackInit } from "./examples/Stack.js";
import { pileInit, pileUpdate } from "./examples/Pile.js";
import { jointsInit } from "./examples/Joints.js";
import { carInit } from "./examples/Car.js";
import { avianInit } from "./examples/Avian.js";
import { platformerInit, platformerInput, platformerUpdate } from "./examples/Platformer.js";

const canvas = document.getElementById("render") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
canvas.width = 500;
canvas.height = 500;

window.addEventListener("keydown", (e) => {
    if (currentDemo.input) {
        currentDemo.input(world, e.key, true);
    }
});

window.addEventListener("keyup", (e) => {
    if (currentDemo.input) {
        currentDemo.input(world, e.key, false);
    }
});

document.getElementById("demo").addEventListener("change", selectDemo);
document.getElementById("restart").addEventListener("click", restart);

let world;
let currentDemo;

export type DemoInit = () => physics.World;
export type DemoUpdate = (world: physics.World, collisions: physics.Collision[]) => void;
export type DemoInput = (world: physics.World, input: string, on: boolean) => void;

export interface Demo {
    name: string;
    init: DemoInit;
    update?: DemoUpdate;
    input?: DemoInput;
}


function render() {
    requestAnimationFrame(render);
    const collisions = physics.worldStep(60, world);

    if (currentDemo.update) {
        currentDemo.update(world, collisions);
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
        } else if ((body as physics.DynamicRigidBody).restingTime > world.restTime) {
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
    world = currentDemo.init();
} 

const DEMOS: Demo[] = [
    { name: "Simple", init: simpleInit },
    { name: "Stacks", init: stackInit },
    { name: "Pile", init: pileInit, update: pileUpdate },
    { name: "Joints", init: jointsInit },
    { name: "Car", init: carInit },
    { name: "Upset Avians", init: avianInit },
    { name: "Platformer", init: platformerInit, input: platformerInput, update: platformerUpdate },
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

