import { physics } from "../../dist/index.js";
import { simpleInit } from "./examples/Simple.js";
import { stackInit } from "./examples/Stack.js";
import { pileInit, pileUpdate } from "./examples/Pile.js";
import { jointsInit } from "./examples/Joints.js";
import { carInit } from "./examples/Car.js";
import { avianInit } from "./examples/Avian.js";
import { platformerInit, platformerInput, platformerUpdate } from "./examples/Platformer.js";
import { compoundInit } from "./examples/Compound.js";
import { sensorInit } from "./examples/Sensor.js";
import { polyboxInit } from "./examples/Polybox.js";
import { exclusionsInit } from "./examples/Exclusions.js";
import { gooInit } from "./examples/Goo.js";

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

    ctx.clearRect(0, 0, 500, 500);

    const bodies = physics.allBodies(world);
    for (const joint of world.joints) {
        ctx.strokeStyle = "yellow";

        const bodyA = bodies.find(b => b.id === joint.bodyA);
        const bodyB = bodies.find(b => b.id === joint.bodyB);
        ctx.beginPath();
        ctx.moveTo(bodyA.center.x, bodyA.center.y);
        ctx.lineTo(bodyB.center.x, bodyB.center.y);
        ctx.stroke();
    }
    for (const body of bodies.sort((a, b) => (a.static ? 0 : 1) - (b.static ? 0 : 1))) {
        for (const shape of body.shapes) {
            ctx.strokeStyle = "white";
            ctx.setLineDash([]);
            if (body.static) {
                ctx.strokeStyle = "grey";
            } else if ((body as physics.DynamicRigidBody).restingTime > world.restTime) {
                ctx.strokeStyle = "green";
            } 

            if (shape.sensor) {
                ctx.strokeStyle = "yellow";
                ctx.setLineDash([5, 3])
            }
            if (shape.type === physics.ShapeType.CIRCLE) {
                ctx.save();
                ctx.translate(shape.center.x, shape.center.y);
                ctx.rotate(body.angle);

                ctx.beginPath();
                ctx.arc(0, 0, shape.bounds, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, shape.bounds);
                ctx.stroke();

                if (shape.sensor && shape.sensorColliding) {
                    ctx.fillStyle = "yellow";
                    ctx.beginPath();
                    ctx.arc(0, 0, shape.bounds, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, shape.bounds);
                    ctx.fill();
                }

                ctx.restore();
            }
            if (shape.type === physics.ShapeType.RECTANGLE) {
                ctx.fillStyle = "yellow";
                ctx.save();
                ctx.translate(shape.center.x, shape.center.y);
                ctx.rotate(body.angle + shape.angle);
                ctx.strokeRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);

                if (shape.sensor && shape.sensorColliding) {
                    ctx.fillRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
                }
                ctx.restore();
            }
        }


        if (!body.static) {
            const dynamic = body as physics.DynamicRigidBody;
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(dynamic.centerOfPhysics.x, dynamic.centerOfPhysics.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(body.center.x, body.center.y, 2, 0, Math.PI * 2);
        ctx.fill();


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
    { name: "Sensor", init: sensorInit },
    { name: "Compound", init: compoundInit },
    { name: "Polybox", init: polyboxInit },
    { name: "Exclusions", init: exclusionsInit },
    { name: "Goo", init: gooInit },
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

