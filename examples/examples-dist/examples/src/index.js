import { physics } from "../../src/index";
import { simpleInit } from "./examples/Simple";
import { stackInit } from "./examples/Stack";
import { pileInit, pileUpdate } from "./examples/Pile";
import { jointsInit } from "./examples/Joints";
import { carInit } from "./examples/Car";
import { avianInit } from "./examples/Avian";
import { platformerInit, platformerInput, platformerUpdate } from "./examples/Platformer";
import { compoundInit } from "./examples/Compound";
import { sensorInit } from "./examples/Sensor";
import { polyboxInit } from "./examples/Polybox";
import { exclusionsInit } from "./examples/Exclusions";
import { gooInit } from "./examples/Goo";
import { compoundJointInit } from "./examples/CompoundJoint";
import { noGravityInit } from "./examples/NoGravity";
import { car3Init } from "./examples/Car3";
import { car4Init, car4Update } from "./examples/Car4";
import { carInteractiveInit, carInteractiveInput, carInteractiveUpdate } from "./examples/CarInteractive";
import { marbleInit } from "./examples/Marble";
import { wobblyJointsInit } from "./examples/WobblyJoints";
import { teleporterInit, teleporterUpdate } from "./examples/Teleporter";
const canvas = document.getElementById("render");
const ctx = canvas.getContext("2d");
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
function render() {
    requestAnimationFrame(render);
    const collisions = physics.worldStep(60, world);
    let focusBody = undefined;
    if (currentDemo.update) {
        focusBody = currentDemo.update(world, collisions);
    }
    ctx.reset();
    ctx.resetTransform();
    ctx.lineWidth = 3;
    ctx.clearRect(0, 0, 500, 500);
    if (focusBody) {
        ctx.translate(-(focusBody.center.x - 250), -(focusBody.center.y - 250));
    }
    const bodies = physics.allBodies(world);
    for (const joint of world.joints) {
        ctx.strokeStyle = "yellow";
        const bodyA = bodies.find(b => b.id === joint.bodyA);
        const centerA = joint.shapeA ? bodyA.shapes.find(s => s.id === joint.shapeA).center : bodyA.center;
        const bodyB = bodies.find(b => b.id === joint.bodyB);
        const centerB = joint.shapeB ? bodyB.shapes.find(s => s.id === joint.shapeB).center : bodyB.center;
        ctx.beginPath();
        ctx.moveTo(centerA.x, centerA.y);
        ctx.lineTo(centerB.x, centerB.y);
        ctx.stroke();
    }
    for (const body of bodies.sort((a, b) => (a.static ? 0 : 1) - (b.static ? 0 : 1))) {
        for (const shape of body.shapes) {
            ctx.strokeStyle = "white";
            ctx.setLineDash([]);
            if (body.static) {
                ctx.strokeStyle = "grey";
            }
            else if (body.restingTime > world.restTime) {
                ctx.strokeStyle = "green";
            }
            if (shape.sensor) {
                ctx.strokeStyle = "yellow";
                ctx.setLineDash([5, 3]);
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
                    ctx.fillStyle = "rgba(255,255,0,0.7)";
                    ctx.beginPath();
                    ctx.arc(0, 0, shape.bounds, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "yellow";
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, shape.bounds);
                    ctx.fill();
                }
                ctx.restore();
            }
            if (shape.type === physics.ShapeType.RECTANGLE) {
                ctx.fillStyle = "rgba(255,255,0,0.7)";
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
            const dynamic = body;
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
    const demo = document.getElementById("demo").value;
    currentDemo = DEMOS.find(d => d.name === demo);
    restart();
}
export function restart() {
    world = currentDemo.init();
}
const DEMOS = [
    { name: "Simple", init: simpleInit },
    { name: "Stacks", init: stackInit },
    { name: "Pile", init: pileInit, update: pileUpdate },
    { name: "Joints", init: jointsInit },
    { name: "Wobbly Joints", init: wobblyJointsInit },
    { name: "Car", init: carInit },
    { name: "Upset Avians", init: avianInit },
    { name: "Platformer", init: platformerInit, input: platformerInput, update: platformerUpdate },
    { name: "Sensor", init: sensorInit },
    { name: "Teleporter", init: teleporterInit, update: teleporterUpdate },
    { name: "Compound", init: compoundInit },
    { name: "Polybox", init: polyboxInit },
    { name: "Exclusions", init: exclusionsInit },
    { name: "Goo", init: gooInit },
    { name: "Compound Joint", init: compoundJointInit },
    { name: "No Gravity", init: noGravityInit },
    { name: "Car Flat", init: car3Init },
    { name: "Car Road", init: car4Init, update: car4Update },
    { name: "Car Interactive", init: carInteractiveInit, input: carInteractiveInput, update: carInteractiveUpdate },
    { name: "Marble", init: marbleInit },
];
const demoList = document.getElementById("demo");
for (const demo of DEMOS) {
    const option = document.createElement("option");
    option.value = demo.name;
    option.innerHTML = demo.name;
    demoList.appendChild(option);
}
currentDemo = DEMOS[0];
restart();
requestAnimationFrame(render);
