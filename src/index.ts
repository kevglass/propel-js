
// MINI 2D PHYSICS
// ===============
// Port of https://github.com/xem/mini2Dphysics/tree/gh-pages

/**
 * A stateless functional physics engine based off the fantastic work here:
 * 
 * https://github.com/xem/mini2Dphysics/tree/gh-pages
 */
export namespace physics {
    /** The shape of a body */
    export enum ShapeType {
        /** A circular shape */
        CIRCLE = 0,
        /** A rectangle shape */
        RECTANGLE = 1,
    }

    export type Shape = Rectangle | Circle;

    export type BaseShape = {
        /** The id given to this shape */
        id: number,
        /** The radius of a bounding circle around the body */
        bounds: number,
        /** The boding box around the body - used for efficient bounds tests */
        boundingBox: Vector2,
        /** The center of the body */
        center: Vector2,
        /** The shape type of the body */
        type: ShapeType,
        /** True if this a sensor not a real body shape */
        sensor: boolean;
        /** True if this sensor is currently triggered */
        sensorColliding: boolean;
        /** The IDs of the shapes that are colliding with this sensor */
        sensorCollisions: number[];
        /** The inertia applied when this shape is colliding */
        inertia: number;
        /** The ID of the body this shape is part of */
        bodyId?: number;
    }

    export type Circle = {
        type: ShapeType.CIRCLE;
    } & BaseShape;

    export type Rectangle = {
        type: ShapeType.RECTANGLE;
        /** The width of the body if its a rectangle */
        width: number,
        /** The height of the body if its a rectangle */
        height: number,
        /** The normals of the faces of the rectangle */
        faceNormals: Vector2[]
        /** The vertices of the corners of the rectangle */
        vertices: Vector2[],
        /** The angle of the rectangle */
        angle: number,
    } & BaseShape;

    /**
     * Two dimension vector
     */
    export interface Vector2 {
        /** The x coordinate of the vector */
        x: number;
        /** The y coordinate of the vector */
        y: number;
    }

    /**
     * A joint between two bodies that should be enforced
     */
    export interface Joint {
        /** The ID of the first body connected to the joint */
        bodyA: number;
        /** The ID of the second body connected to the joint */
        bodyB: number;
        /** The distance the joint is trying to maintain  */
        distance: number;
        /** Factor of how much the joint will compress */
        rigidity: number;
        /** Factor of how much the joint will stretch */
        elasticity: number;
        /** True if the joint is soft, i.e. it doesn't force movement but only applies velocities */
        soft: boolean;
        /** The ID of the shape body A is connected by */
        shapeA?: number;
        /** The ID of the shape body B is connected by */
        shapeB?: number;
    }

    /**
     * A collision that has occurred in the world
     */
    interface CollisionDetails {
        /** The depth of the collision */
        depth: number;
        /** The normal of the collision point between the two shapes */
        normal: Vector2;
        /** The starting point of the collision */
        start: Vector2;
        /** The ending point of the collision */
        end: Vector2;
        /** The first shape */
        shapeA?: Shape;
        /** The second shape */
        shapeB?: Shape;
    }

    /**
     * Description of a collision that occurred for the client app
     */
    export interface Collision {
        /** The ID of the first body in the collision */
        bodyAId: number;
        /** The ID of the second body in the collision */
        bodyBId: number;
        /** The penetration depth of the collision */
        depth: number;
        /** The starting position of the collision */
        start: Vector2;
    }

    interface BodyCore {
        /** The unique ID of this body */
        id: number;
        shapes: Shape[];
        /** The friction to apply for this body in a collision */
        friction: number,
        /** The restitution to apply for this body in a collision */
        restitution: number,
        /** User data associated with the body  */
        data: any;
        /** Permeability of the object - anything other than zero will stop collision response */
        permeability: number;
        /** The center of the body */
        center: Vector2,
        /** The current angle of rotation of the body */
        angle: number,
        /** True if this body is static - i.e. it doesn't moved or rotate */
        static: boolean;
        /** Discriminator */
        type: "BODY"
    }

    export interface StaticRigidBody extends BodyCore {
        static: true;
    }

    /**
     * A rigid body in the physical world
     */
    export interface DynamicRigidBody extends BodyCore {
        static: false;
        /** The center of the body on average - this keeps things stable */
        averageCenter: Vector2;
        /** The mass of the body - must be non-zero for dynamic bodies */
        mass: number,
        /** The last magnitude of velocity - check to see if user applied velocity */
        velMag: number,
        /** The current velocity of the body */
        velocity: Vector2,
        /** The current acceleration of the body */
        acceleration: Vector2,
        /** The average angle of rotation of the bod - this keeps things stable */
        averageAngle: number;
        /** The current angular velocity of the body */
        angularVelocity: number,
        /** The current angular acceleration of the body */
        angularAcceleration: number,
        /** The current inertia of the body */
        inertia: number,
        /** The amount of time this body has been resting for */
        restingTime: number;
        /** True if this body can not rotate */
        fixedRotation: boolean;
        /** True if this body can not move */
        fixedPosition: boolean;
        /** The center of rotation based on the last collision */
        centerOfPhysics: Vector2;
        /** True if the body isn't effected by gravity */
        floating: boolean;
    }

    export type Body = StaticRigidBody | DynamicRigidBody

    /**
     * The world in which the physics engine runs
     */
    export interface World {
        /** The list of bodies that can move or rotate */
        dynamicBodies: DynamicRigidBody[];

        /** The list of bodies that don't move or rotate */
        staticBodies: StaticRigidBody[];

        /** Disabled bodies (can be either static or dynamic) */
        disabledBodies: Body[];

        /** The gravity to apply to all dynamic bodies */
        gravity: Vector2;
        /** The amount of damping to apply on angular velocity - 1 = none */
        angularDamp: number;
        /** The amount of damping to apply on velocity - 1 = none */
        damp: number;
        /** The next ID to assign to a body */
        nextId: number;
        /** The list of joints to be enforced */
        joints: Joint[];
        /** The number of frames */
        frameCount: number;
        /** The restriction to apply on joints to get them to stop faster */
        jointRestriction: number;
        /** The time it takes for a non-moving dynamic body to go into resting state */
        restTime: number;
        /** Any collision exclusions between bodies */
        exclusions: Record<number, number[]>;
        /** True if the world is paused */
        paused: boolean;
    }

    /**
     * Get a list of all bodies in the system
     * 
     * @param world The world containing the bodies
     * @returns The list of bodies in the world
     */
    export function allBodies(world: World, dynamics?: DynamicRigidBody[]): Body[] {
        return [...(dynamics ?? world.dynamicBodies), ...world.staticBodies, ...world.disabledBodies];
    }

    /**
     * Get a list of all bodies that are enabled in the system
     * 
     * @param world The world containing the bodies
     * @returns The list of bodies in the world
     */
    export function enabledBodies(world: World, dynamics?: DynamicRigidBody[]): Body[] {
        return [...(dynamics ?? world.dynamicBodies), ...world.staticBodies];
    }

    export function disableBody(world: World, body: Body, dynamics?: DynamicRigidBody[]): void {
        const dynamicBodiesId = (dynamics ?? world.dynamicBodies).findIndex((b) => b.id === body.id);
        if (dynamicBodiesId !== -1) {
            (dynamics ?? world.dynamicBodies).splice(dynamicBodiesId, 1);
        }
        const staticBodiesId = world.staticBodies.findIndex((b) => b.id === body.id);
        if (staticBodiesId !== -1) {
            world.staticBodies.splice(staticBodiesId, 1);
        }
        if (!world.disabledBodies.includes(body)) {
            world.disabledBodies.push(body);
        }
    }

    export function enableBody(world: World, body: Body, dynamics?: DynamicRigidBody[]): void {
        if (!body.static && !(dynamics ?? world.dynamicBodies).find((b) => b.id === body.id)) {
            (dynamics ?? world.dynamicBodies).push(body);
        }
        if (body.static && !world.staticBodies.includes(body)) {
            world.staticBodies.push(body);
        }
        if (world.disabledBodies.includes(body)) {
            world.disabledBodies.splice(world.disabledBodies.indexOf(body), 1);
        }
    }

    /**
     * Get the bounds of the world
     * 
     * @param world The world to calculate the bounds of
     * @param staticOnly Only include static bodies
     * @returns The minimum and maximum coordinates of any body in the world
     */
    export function getWorldBounds(world: World, staticOnly = false, dynamics?: DynamicRigidBody[]): { min: Vector2, max: Vector2 } {
        const bodies = staticOnly ? world.staticBodies : allBodies(world, dynamics);

        if (bodies.length === 0) {
            return {
                min: newVec2(0, 0),
                max: newVec2(0, 0)
            };
        }

        const firstBody: Body = bodies[0];
        let min = newVec2(firstBody.shapes[0].center.x - firstBody.shapes[0].bounds, firstBody.center.y - firstBody.shapes[0].bounds);
        let max = newVec2(firstBody.shapes[0].center.x + firstBody.shapes[0].bounds, firstBody.center.y + firstBody.shapes[0].bounds);

        for (const b of bodies) {
            for (const shape of b.shapes) {
                if (shape.type === ShapeType.CIRCLE) {
                    min.x = Math.min(min.x, shape.center.x - shape.bounds);
                    min.y = Math.min(min.y, shape.center.y - shape.bounds);
                    max.x = Math.max(max.x, shape.center.x + shape.bounds);
                    max.y = Math.max(max.y, shape.center.y + shape.bounds);
                } else if (shape.type === ShapeType.RECTANGLE) {
                    for (const vert of shape.vertices) {
                        min.x = Math.min(min.x, vert.x);
                        min.y = Math.min(min.y, vert.y);
                        max.x = Math.max(max.x, vert.x);
                        max.y = Math.max(max.y, vert.y);
                    }
                }
            }
        }

        return { min, max };
    }

    /**
     * Create a new world for bodies to live in
     * 
     * @param gravity The gravity to apply to bodies in this system
     * @param restTime The time it takes for a body to go into "resting" state (default 1=second)
     * @returns The newly created world
     */
    export function createWorld(gravity?: Vector2, restTime: number = 1): World {
        return {
            staticBodies: [],
            dynamicBodies: [],
            disabledBodies: [],
            gravity: gravity ?? newVec2(0, 100),
            angularDamp: 1,
            damp: 1,
            nextId: 1,
            joints: [],
            frameCount: 0,
            jointRestriction: 1,
            restTime,
            exclusions: {},
            paused: false
        }
    };

    /**
     * Exclude collisions between the two bodies specified. They'll no longer collide or
     * have collision response
     * 
     * @param world The world in which we want the exclusion to take place
     * @param bodyA First body to exclude from colliding with bodyB
     * @param bodyB Second body to exclude from colliding with bodyA
     */
    export function excludeCollisions(world: World, bodyA: Body, bodyB: Body): void {
        world.exclusions[bodyA.id] = world.exclusions[bodyA.id] ?? []
        if (!world.exclusions[bodyA.id].includes(bodyB.id)) {
            world.exclusions[bodyA.id].push(bodyB.id);
        }
        world.exclusions[bodyB.id] = world.exclusions[bodyB.id] ?? []
        if (!world.exclusions[bodyB.id].includes(bodyA.id)) {
            world.exclusions[bodyB.id].push(bodyA.id);
        }
    }

    /**
     * Include collisions between the two bodies specified. They'll collide and
     * have collision response. This undoes any exclusion 
     * 
     * @param world The world in which we want the exclusion to take place
     * @param bodyA First body to exclude from colliding with bodyB
     * @param bodyB Second body to exclude from colliding with bodyA
     */
    export function includeCollisions(world: World, bodyA: Body, bodyB: Body): void {
        if (world.exclusions[bodyA.id]) {
            world.exclusions[bodyA.id] = world.exclusions[bodyA.id].filter(id => bodyB.id === id)
        }
        if (world.exclusions[bodyB.id]) {
            world.exclusions[bodyB.id] = world.exclusions[bodyA.id].filter(id => bodyA.id === id)
        }
    }

    /**
     * Create a joint between two bodies in the world
     * 
     * @param world The world in which to create the joint
     * @param bodyA The first body to connect to the joint
     * @param bodyB The second body to connect to the joint
     * @param rigidity The amount the joint will compress 
     * @param elasticity The amount the joint will stretch
     */
    export function createJoint(world: World, bodyA: Body | Shape, bodyB: Body | Shape, rigidity: number = 1, elasticity: number = 0, soft = false): void {

        const joint = {
            bodyA: bodyA.type === "BODY" ? bodyA.id : bodyA.bodyId!,
            bodyB: bodyB.type === "BODY" ? bodyB.id : bodyB.bodyId!,
            distance: 0,
            rigidity,
            elasticity,
            soft,
            shapeA: bodyA.type !== "BODY" ? bodyA.id : 0,
            shapeB: bodyB.type !== "BODY" ? bodyB.id : 0,
        };


        const a = allBodies(world).find(b => b.id === joint.bodyA);
        const b = allBodies(world).find(b => b.id === joint.bodyB);

        if (!a) {
            throw "Body A is not part of world. Joints must be connected to elements in the world"
        }
        if (!b) {
            throw "Body A is not part of world. Joints must be connected to elements in the world"
        }
        const centerA = joint.shapeA ? a.shapes.find(s => s.id === joint.shapeA)!.center : a.center
        const centerB = joint.shapeB ? b.shapes.find(s => s.id === joint.shapeB)!.center : b.center

        joint.distance = lengthVec2(subtractVec2(centerA, centerB));
        world.joints.push(joint)
    };

    /**
     * Create a body with a circular shape
     * 
     * @param world The world in which to create the body
     * @param center The center of the body
     * @param radius The radius of the circle shape to attach
     * @param mass The mass to give the newly created body
     * @param friction The friction to apply during collisions with the new body
     * @param restitution The friction to apply during collisions with the new body
     * @returns The newly created body
     */
    export function createCircle(world: World, center: Vector2, radius: number, mass: number, friction: number, restitution: number, sensor: boolean = false, data?: any): Body {
        const circle = createCircleShape(world, center, radius, sensor);

        return createRigidBody(world, center, mass, friction, restitution, [circle], data);
    };

    /**
     * Create a body with a rectangular shape
     * 
     * @param world The world in which to create the body
     * @param center The center of the body
     * @param width The height of the rectangle shape to attach
     * @param height The width of the rectangle shape to attach
     * @param mass The mass to give the newly created body
     * @param friction The friction to apply during collisions with the new body
     * @param restitution The friction to apply during collisions with the new body
     * @returns The newly created body
     */
    export function createRectangle(world: World, center: Vector2, width: number, height: number, mass: number, friction: number, restitution: number, sensor: boolean = false, data?: any): Body {
        const rect = createRectangleShape(world, center, width, height, 0, sensor);

        return createRigidBody(world, center, mass, friction, restitution, [rect], data);
    };

    /**
     * Move a body 
     * 
     * @param body The body to move
     * @param v The amount to move
     */
    export function moveBody(body: Body, v: Vector2): void {
        _moveBody(body, v, true);
    }

    function _moveBody(body: Body, v: Vector2, force = false): void {
        if (!force) {
            if (body.static) {
                return;
            }
        }

        // Center
        body.center = addVec2(body.center, v);
        if (!body.static) {
            body.centerOfPhysics = addVec2(body.centerOfPhysics, v);
        }
        for (const shape of body.shapes) {
            shape.center = addVec2(shape.center, v);
            // Rectangle (move vertex)
            if (shape.type === ShapeType.RECTANGLE) {
                for (let i = 4; i--;) {
                    shape.vertices[i] = addVec2(shape.vertices[i], v);
                }
                updateBoundingBox(shape);
            }
        }
    };


    export function setCenter(body: Body, v: Vector2): void {
        const diff = subtractVec2(v, body.center);

        moveBody(body, diff);
    };

    export function setRotation(body: Body, angle: number): void {
        const diff = angle - body.angle;
        if (!body.static) {
            body.centerOfPhysics = { ...body.center }
        }
        rotateBody(body, diff);
    };

    /**
     * Rotate a body around its center
     * 
     * @param body The body to rotate
     * @param angle The angle in radian to rotate the body by
     */
    export function rotateBody(body: Body, angle: number): void {
        if (!angle) {
            return
        }

        // Update angle
        body.angle += angle;
        if (!body.static) {
            body.averageAngle = body.angle;
        }

        const center = body.static ? body.center : body.centerOfPhysics;
        body.center = rotateVec2(body.center, center, angle);
        for (const shape of body.shapes) {
            shape.center = rotateVec2(shape.center, center, angle);

            if (shape.type === ShapeType.RECTANGLE) {
                for (let i = 4; i--;) {
                    shape.vertices[i] = rotateVec2(shape.vertices[i], center, angle);
                }
                updateRectNormals(shape);
                updateBoundingBox(shape);
            }
        }
    };

    function applyJoint(world: World, joint: Joint, body: Body, other: Body, fps: number): void {
        const shapeId = joint.bodyA === body.id ? joint.shapeA : joint.shapeB;
        const otherShapeId = joint.bodyA === body.id ? joint.shapeB : joint.shapeA;
        const center = shapeId ? body.shapes.find(s => s.id === shapeId)!.center : body.center;
        const otherCenter = otherShapeId ? other.shapes.find(s => s.id === otherShapeId)!.center : other.center;

        let vec = subtractVec2(otherCenter, center)
        const distance = lengthVec2(vec);
        const diff = distance - joint.distance;
        if (diff != 0) {
            if (!body.static) {
                const por = subtractVec2(body.centerOfPhysics, center);
                if (lengthVec2(por) > 0) {
                    let ang = Math.atan2(-vec.y, -vec.x) - Math.atan2(por.y, por.x);
                    if (ang > Math.PI) {
                        ang = Math.PI - ang;
                    }
                    if (ang < -Math.PI) {
                        ang = (Math.PI * 2) + ang
                    }
                    body.angularVelocity += ang / fps
                }
            }
            vec = subtractVec2(otherCenter, center)
            const distance = lengthVec2(vec);
            const diff = distance - joint.distance;

            if (diff != 0) {
                if (diff > 0) {
                    vec = scaleVec2(vec, (1 / distance) * diff * (1 - joint.elasticity) * (other.static ? 1 : 0.5));
                } else {
                    vec = scaleVec2(vec, (1 / distance) * diff * joint.rigidity * (other.static ? 1 : 0.5));
                }

                // if the connected piece is a shape in a composite instead of a pure body
                // then consider rotating the shape to solve the joint rather than moving the body

                if (!joint.soft && !body.static) {
                    _moveBody(body, vec);
                }
                if (!joint.soft && !other.static) {
                    _moveBody(other, scaleVec2(vec, -1));
                }
                if (!body.static) {
                    body.velocity = addVec2(body.velocity, scaleVec2(vec, joint.soft ? 1 : fps / 2));
                }
                if (!other.static) {
                    other.velocity = addVec2(other.velocity, scaleVec2(vec, -(joint.soft ? 1 : fps / 2)));
                }
            }

        }
    }
    /**
     * Move the physics world through a step of a given time period.
     * 
     * @param fps The frames per second the world is running at. The step will be 1/fps
     * in length.
     * @param world The world to step 
     */
    export function worldStep(fps: number, world: World, dynamics?: DynamicRigidBody[]): Collision[] {
        if (world.paused) {
            return []
        }

        dynamics = dynamics ?? world.dynamicBodies;

        const allEnabled = enabledBodies(world, dynamics);
        const all = allBodies(world, dynamics);
        let collisions: Collision[] = [];

        // clear all the sensors
        for (const body of all) {
            body.shapes.forEach(s => {
                if (!body.static && body.restingTime > world.restTime) {
                    return;
                }
                s.sensorColliding = false;
                s.sensorCollisions = [];
            });
        }

        for (const body of dynamics) {
            if (!body.velocity && !body.acceleration) {
                continue
            }
            if (body.velMag !== lengthVec2(body.velocity)) {
                body.restingTime = 0
            }
            if (bodyAtRest(world, body)) {
                continue;
            }
            // Update position/rotation
            if (!body.fixedPosition) {
                body.velocity = addVec2(body.velocity, scaleVec2(body.acceleration, 1 / fps));
                _moveBody(body, scaleVec2(body.velocity, 1 / fps));
            } else {
                body.velocity.x = 0;
                body.velocity.y = 0;
            }
            if (!body.fixedRotation) {
                body.angularVelocity += body.angularAcceleration * 1 / fps;
                rotateBody(body, body.angularVelocity * 1 / fps);
            } else {
                body.angularVelocity = 0;
                body.angularAcceleration = 0;
            }
        }


        // Compute collisions and iterate to resolve
        for (let k = 9; k--;) {
            let collision = false;

            // apply velocity to try and maintain joints
            for (const body of dynamics) {
                const joints = world.joints.filter(j => j.bodyA === body.id || j.bodyB === body.id);
                for (const joint of joints) {
                    const otherId = joint.bodyA === body.id ? joint.bodyB : joint.bodyA;
                    const other = all.find(b => b.id === otherId);
                    if (other) {
                        applyJoint(world, joint, body, other, fps);

                        // if they're held together with no free move then
                        // apply the dampening
                        if (body.static || other.static) {
                            if (!body.static) {
                                body.velocity.x -= ((body.velocity.x * (1 - world.damp)) / fps) * world.jointRestriction;
                                body.velocity.y -= ((body.velocity.y * (1 - world.damp)) / fps) * world.jointRestriction;
                                body.angularVelocity -= ((body.angularVelocity * (1 - world.angularDamp)) / fps) * world.jointRestriction;
                            }

                            if (!other.static) {
                                other.velocity.x -= ((other.velocity.x * (1 - world.damp)) / fps) * world.jointRestriction;
                                other.velocity.y -= ((other.velocity.y * (1 - world.damp)) / fps) * world.jointRestriction;
                                other.angularVelocity -= ((other.angularVelocity * (1 - world.angularDamp)) / fps) * world.jointRestriction;
                            }
                        }
                    }
                }
            }

            for (let i = dynamics.length; i--;) {

                // Only moving objects can collide if they didn't last worldStep
                const bodyI = dynamics[i];
                if (!bodyI.velocity) {
                    continue
                }

                for (let j = allEnabled.length; j-- > i;) {
                    if (i === j) {
                        continue;
                    }
                    // Test bounds
                    const bodyJ = allEnabled[j];

                    if (world.exclusions[bodyJ.id]?.includes(bodyI.id)) {
                        continue;
                    }
                    if (world.exclusions[bodyI.id]?.includes(bodyJ.id)) {
                        continue;
                    }

                    // resting and static bodies don't need to collide
                    if (boundTest(bodyI, bodyJ)) {
                        // Test collision
                        let collisionInfo = EmptyCollision();
                        if (testCollision(world, bodyI, bodyJ, collisionInfo)) {
                            if (collisionInfo.shapeA && collisionInfo.shapeA.sensor) {
                                collisionInfo.shapeA.sensorColliding = true;
                                if (collisionInfo.shapeB) {
                                    collisionInfo.shapeA.sensorCollisions.push(collisionInfo.shapeB.id);
                                }
                                continue;
                            }
                            if (collisionInfo.shapeB && collisionInfo.shapeB.sensor) {
                                collisionInfo.shapeB.sensorColliding = true;
                                if (collisionInfo.shapeA) {
                                    collisionInfo.shapeB.sensorCollisions.push(collisionInfo.shapeA.id);
                                }
                                continue;
                            }

                            if (bodyJ.permeability > 0) {
                                bodyI.velocity.x *= 1 - bodyJ.permeability;
                                bodyI.velocity.y *= 1 - bodyJ.permeability;
                                bodyI.angularVelocity *= 1 - bodyJ.permeability;
                                continue;
                            }

                            if (!bodyI.static) {
                                if (bodyI.shapes.includes(collisionInfo.shapeA!) && !collisionInfo.shapeA!.sensor) {
                                    bodyI.centerOfPhysics = { ...collisionInfo.shapeA!.center }
                                    bodyI.inertia = collisionInfo.shapeA!.inertia;
                                }
                                if (bodyI.shapes.includes(collisionInfo.shapeB!) && !collisionInfo.shapeB!.sensor) {
                                    bodyI.centerOfPhysics = { ...collisionInfo.shapeB!.center }
                                    bodyI.inertia = collisionInfo.shapeB!.inertia;
                                }
                            }
                            if (!bodyJ.static) {
                                if (bodyJ.shapes.includes(collisionInfo.shapeA!) && !collisionInfo.shapeA!.sensor) {
                                    bodyJ.centerOfPhysics = { ...collisionInfo.shapeA!.center }
                                    bodyJ.inertia = collisionInfo.shapeA!.inertia;
                                }
                                if (bodyJ.shapes.includes(collisionInfo.shapeB!) && !collisionInfo.shapeB!.sensor) {
                                    bodyJ.centerOfPhysics = { ...collisionInfo.shapeB!.center }
                                    bodyJ.inertia = collisionInfo.shapeB!.inertia;
                                }
                            }

                            // Make sure the normal is always from object[i] to object[j]
                            if (dotProduct(collisionInfo.normal, subtractVec2(bodyJ.center, bodyI.center)) < 0) {
                                collisionInfo = {
                                    depth: collisionInfo.depth,
                                    normal: scaleVec2(collisionInfo.normal, -1),
                                    start: collisionInfo.end,
                                    end: collisionInfo.start,
                                    shapeA: collisionInfo.shapeB,
                                    shapeB: collisionInfo.shapeA,
                                };
                            }

                            // Resolve collision
                            if (resolveCollision(world, bodyI, bodyJ, collisionInfo)) {
                                collision = true;
                                collisions = collisions.filter(c => c.bodyAId !== bodyI.id && c.bodyBId !== bodyJ.id);

                                collisions.push({
                                    bodyAId: bodyI.id,
                                    bodyBId: bodyJ.id,
                                    depth: collisionInfo.depth,
                                    start: collisionInfo.start,
                                });
                            }
                        }
                    }
                }
            }

            // no more collisions occurred, break out
            if (!collision) {
                break;
            }
        }

        for (const body of dynamics) {
            body.restingTime += 1 / fps;

            if (Math.abs(body.center.x - body.averageCenter.x) > 0.1) {
                body.averageCenter.x = body.center.x;
                body.restingTime = 0;
            }
            if (Math.abs(body.center.y - body.averageCenter.y) > 0.1) {
                body.averageCenter.y = body.center.y;
                body.restingTime = 0;
            } 
            if (Math.abs(body.angle - body.averageAngle) >= 0.05) {
                body.averageAngle = body.angle;
                body.restingTime = 0;
            }
            // if a body has had velocity applied then consider it not at rest
            body.velMag = lengthVec2(body.velocity)
        }

        return collisions;
    }

    export function collidingWithStatic(world: World, body: DynamicRigidBody, debug = false): boolean {
        const statics = world.staticBodies;

        for (const other of statics) {
            if (boundTest(body, other)) {
                if (debug) {
                    if (debug) {
                        console.log("Collide", body.center.y, other.center.y, body.shapes[0], other.shapes[0]);
                    }
                }
                let collisionInfo = EmptyCollision();
                if (testCollision(world, body, other, collisionInfo)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check if the physics system is at rest.
     * 
     * @param world The world to check
     * @param forSeconds The number of seconds a body must be at rest to be considered stopped
     * @returns True if all bodies are at rest
     */
    export function atRest(world: World, forSeconds: number = 1, dynamics?: DynamicRigidBody[]): boolean {
        return !(dynamics ?? world.dynamicBodies).find(b => b.restingTime < forSeconds);
    }

    /**
     * Create a new vector 
     * 
     * @param x The x value of the new vector
     * @param y The y value of the new vector
     * @returns The newly created vector
     */
    export function newVec2(x: number, y: number): Vector2 {
        return ({ x, y });
    };

    /**
     * Get the length of a vector
     * 
     * @param v The vector to measure 
     * @returns The length of the vector
     */
    export function lengthVec2(v: Vector2): number {
        return dotProduct(v, v) ** .5;
    }

    /**
     * Add a vector to another
     * 
     * @param v The first vector to add
     * @param w The second vector to add
     * @returns The newly created vector containing the addition result
     */
    export function addVec2(v: Vector2, w: Vector2): Vector2 {
        return newVec2(v.x + w.x, v.y + w.y);
    }

    /**
     * Subtract a vector to another
     * 
     * @param v The vector to be subtracted from
     * @param w The vector to subtract 
     * @returns The newly created vector containing the subtraction result
     */
    export function subtractVec2(v: Vector2, w: Vector2): Vector2 {
        return addVec2(v, scaleVec2(w, -1));
    }

    /**
     * Scale a vector
     * 
     * @param v The vector to scale
     * @param n The amount to scale the vector by
     * @returns The newly created vector 
     */
    export function scaleVec2(v: Vector2, n: number): Vector2 {
        return newVec2(v.x * n, v.y * n);
    }

    /**
     * Get the dot product of two vector
     * 
     * @param v The first vector to get the dot product from
     * @param w The second vector to get the dot product from
     * @returns The dot product of the two vectors
     */
    export function dotProduct(v: Vector2, w: Vector2): number {
        return v.x * w.x + v.y * w.y;
    }

    /**
     * Get the cross product of two vector
     * 
     * @param v The first vector to get the cross product from
     * @param w The second vector to get the cross product from
     * @returns The cross product of the two vectors
     */
    export function crossProduct(v: Vector2, w: Vector2): number {
        return v.x * w.y - v.y * w.x;
    }

    /**
     * Rotate a vector around a specific point
     * 
     * @param v The vector to rotate
     * @param center The center of the rotate
     * @param angle The angle in radians to rotate the vector by
     * @returns The newly created vector result
     */
    export function rotateVec2(v: Vector2, center: Vector2, angle: number): Vector2 {
        const x = v.x - center.x;
        const y = v.y - center.y;

        return newVec2(x * Math.cos(angle) - y * Math.sin(angle) + center.x, x * Math.sin(angle) + y * Math.cos(angle) + center.y);
    }

    /**
     * Normalize a vector (make it a unit vector)
     * 
     * @param v The vector to normalize 
     * @returns The newly created normalized vector
     */
    export function normalize(v: Vector2): Vector2 {
        return scaleVec2(v, 1 / (lengthVec2(v) || 1));
    }

    /**
     * Apply velocity to a body
     * 
     * @param body The target body
     * @param vel The velocity to apply
     */
    export function applyVelocity(body: DynamicRigidBody, vel: Vector2): void {
        body.velocity.x += vel.x
        body.velocity.y += vel.y
        body.restingTime = 0
    }

    const EmptyCollision = (): CollisionDetails => {
        return {
            depth: 0,
            normal: newVec2(0, 0),
            start: newVec2(0, 0),
            end: newVec2(0, 0),
            shapeA: undefined,
            shapeB: undefined,
        }
    };

    // Collision info setter
    function setCollisionInfo(collision: CollisionDetails, D: number, N: Vector2, S: Vector2, A: Shape, B: Shape) {
        if (collision.depth >= D) {
            return;
        }
        if (A.sensor) {
            A.sensorColliding = true;
            A.sensorCollisions.push(B.id);
            return;
        }
        if (B.sensor) {
            B.sensorColliding = true;
            B.sensorCollisions.push(A.id);
            return;
        }

        collision.depth = D; // depth
        collision.normal.x = N.x; // normal
        collision.normal.y = N.y; // normal
        collision.start.x = S.x; // start
        collision.start.y = S.y; // start
        collision.end = addVec2(S, scaleVec2(N, D)); // end
        collision.shapeA = A;
        collision.shapeB = B;
    }

    function calculateInertia(shape: Shape, mass: number): number {
        return shape.type === ShapeType.RECTANGLE // inertia
            ? (Math.hypot(shape.width, shape.height) / 2, mass > 0 ? 1 / (mass * (shape.width ** 2 + shape.height ** 2) / 12) : 0) // rectangle
            : (mass > 0 ? (mass * shape.bounds ** 2) / 12 : 0); // circle;
    }

    export function createCircleShape(world: World, center: Vector2, radius: number, sensor: boolean = false): Circle {
        // the original code only works well with whole number static objects
        center.x = Math.floor(center.x);
        center.y = Math.floor(center.y);
        radius = Math.floor(radius);

        return {
            id: world.nextId++,
            type: ShapeType.CIRCLE,
            center,
            bounds: radius,
            boundingBox: calcBoundingBox(ShapeType.CIRCLE, radius, [], center),
            sensor,
            sensorColliding: false,
            sensorCollisions: [],
            inertia: 0
        }
    }

    export function createRectangleShape(world: World, center: Vector2, width: number, height: number, ang: number = 0, sensor: boolean = false): Rectangle {
        // the original code only works well with whole number static objects
        center.x = Math.floor(center.x);
        center.y = Math.floor(center.y);
        width = Math.floor(width);
        height = Math.floor(height);

        const vertices = [ // Vertex: 0: TopLeft, 1: TopRight, 2: BottomRight, 3: BottomLeft (rectangles)
            newVec2(center.x - width / 2, center.y - height / 2),
            newVec2(center.x + width / 2, center.y - height / 2),
            newVec2(center.x + width / 2, center.y + height / 2),
            newVec2(center.x - width / 2, center.y + height / 2)
        ]
        if (ang !== 0) {
            for (let i = 0; i < 4; i++) {
                vertices[i] = rotateVec2(vertices[i], center, ang);
            }
        }

        const faceNormals = computeRectNormals(vertices)
        const bounds = Math.hypot(width, height) / 2;

        return {
            id: world.nextId++,
            type: ShapeType.RECTANGLE,
            width, height, center, vertices, faceNormals,
            bounds,
            boundingBox: calcBoundingBox(ShapeType.RECTANGLE, bounds, vertices, center),
            sensor,
            sensorColliding: false,
            sensorCollisions: [],
            inertia: 0,
            angle: ang
        }
    }

    // New shape
    export function createRigidBody(world: World, center: Vector2, mass: number, friction: number, restitution: number, shapes: Shape[], data?: any, floating = false): Body {
        const staticBody: StaticRigidBody = {
            id: world.nextId++,
            center,
            friction,
            restitution,
            shapes,
            static: true,
            angle: 0,
            permeability: 0,
            data: data ?? null,
            type: "BODY"
        }

        for (const shape of shapes) {
            shape.inertia = calculateInertia(shape, mass);
            shape.bodyId = staticBody.id
        }

        if (!mass) {
            return staticBody
        } else {
            const dynamicBody: DynamicRigidBody = {
                ...staticBody,
                static: false,
                averageCenter: newVec2(center.x, center.y),
                centerOfPhysics: { ...center },
                mass: 1 / mass, // inverseMass
                velMag: 0,
                velocity: newVec2(0, 0), // velocity (speed)
                acceleration: floating ? { x: 0, y: 0} : world.gravity, // acceleration
                averageAngle: 0,
                angularVelocity: 0, // angle velocity
                angularAcceleration: 0, // angle acceleration,
                inertia: calculateInertia(shapes[0], mass),
                restingTime: 0,
                fixedPosition: false,
                fixedRotation: false,
                floating
            }
            return dynamicBody
        }
    }

    /**
     * Add a body to the world
     * 
     * @param world The world to which the body should be added
     * @param body The body to add
     */
    export function addBody(world: World, body: Body, dynamics?: DynamicRigidBody[]): void {
        if (body.static) {
            world.staticBodies.push(body)
        } else {
            (dynamics ?? world.dynamicBodies).push(body)
        }
    }

    /**
     * Remove a body from the world
     * 
     * @param world The world from which the body should be removed
     * @param body The body to remove
     */
    export function removeBody(world: World, body: Body, dynamics?: DynamicRigidBody[]): void {
        const list = (body.static ? world.staticBodies : (dynamics ?? world.dynamicBodies));
        const index = list.findIndex(b => b.id == body.id);
        if (index >= 0) {
            list.splice(index, 1);
        }
    }

    // Test if two shapes have intersecting bounding circles
    // TODO Need to optimize this for rectangles 
    function boundTest(b1: Body, b2: Body) {
        for (const s1 of b1.shapes) {
            for (const s2 of b2.shapes) {
                const coincideX = Math.abs(s1.center.x - s2.center.x) < s1.boundingBox.x + s2.boundingBox.x;
                const coincideY = Math.abs(s1.center.y - s2.center.y) < s1.boundingBox.y + s2.boundingBox.y;

                if (coincideX && coincideY) {
                    return true;
                }
            }
        }

        return false;
    }

    function updateBoundingBox(shape: Shape): void {
        shape.boundingBox = calcBoundingBox(shape.type, shape.bounds, shape.type === ShapeType.RECTANGLE ? shape.vertices : [], shape.center)
    }

    function calcBoundingBox(type: number, bounds: number, vertices: Vector2[], center: Vector2): Vector2 {
        if (type === ShapeType.CIRCLE) {
            return {
                x: bounds,
                y: bounds
            }
        } else {
            let x = 0, y = 0

            for (const v of vertices) {
                x = Math.max(x, Math.abs(center.x - v.x));
                y = Math.max(y, Math.abs(center.y - v.y));
            }
            return {
                x,
                y
            }
        }
    }

    function updateRectNormals(rect: Rectangle) {
        rect.faceNormals = computeRectNormals(rect.vertices)
    }

    // Compute face normals (for rectangles)
    function computeRectNormals(vertices: Vector2[]): Vector2[] {

        const faceNormals = []

        // N: normal of each face toward outside of rectangle
        // 0: Top, 1: Right, 2: Bottom, 3: Left
        for (let i = 4; i--;) {
            faceNormals[i] = normalize(subtractVec2(vertices[(i + 1) % 4], vertices[(i + 2) % 4]));
        }

        return faceNormals
    }

    // Find the axis of least penetration between two rects
    function findAxisLeastPenetration(rect: Rectangle, otherRect: Rectangle, collisionInfo: CollisionDetails) {
        let n,
            i,
            j,
            supportPoint,
            bestDistance = 1e9,
            bestIndex = -1,
            hasSupport = true,
            tmpSupportPoint,
            tmpSupportPointDist;

        for (i = 4; hasSupport && i--;) {

            // Retrieve a face normal from A
            n = rect.faceNormals[i];

            // use -n as direction and the vertex on edge i as point on edge
            const
                dir = scaleVec2(n, -1),
                ptOnEdge = rect.vertices[i];
            let
                // find the support on B
                vToEdge,
                projection;
            tmpSupportPointDist = -1e9;
            tmpSupportPoint = -1;

            // check each vector of other object
            for (j = 4; j--;) {
                vToEdge = subtractVec2(otherRect.vertices[j], ptOnEdge);
                projection = dotProduct(vToEdge, dir);

                // find the longest distance with certain edge
                // dir is -n direction, so the distance should be positive     
                if (projection > 0 && projection > tmpSupportPointDist) {
                    tmpSupportPoint = otherRect.vertices[j];
                    tmpSupportPointDist = projection;
                }
            }
            hasSupport = (tmpSupportPoint !== -1);

            // get the shortest support point depth
            if (hasSupport && tmpSupportPointDist < bestDistance) {
                bestDistance = tmpSupportPointDist;
                bestIndex = i;
                supportPoint = tmpSupportPoint;
            }
        }
        if (hasSupport) {
            // all four directions have support point
            setCollisionInfo(collisionInfo, bestDistance, rect.faceNormals[bestIndex], addVec2(supportPoint as Vector2, scaleVec2(rect.faceNormals[bestIndex], bestDistance)), rect, otherRect);
        }

        return hasSupport;
    }

    function bodyAtRest(world: World, body: Body): boolean {
        if (body.static) {
            return true;
        }

        return body.restingTime > world.restTime;
    }

    // Test collision between two shapes
    function testCollision(world: World, b1: Body, b2: Body, collisionInfo: CollisionDetails): boolean {
        // static bodies don't collide with each other
        if ((bodyAtRest(world, b1) && bodyAtRest(world, b2))) {
            return false;
        }

        let originalB1 = b1;
        let originalB2 = b2;

        for (let firstShape of b1.shapes) {
            for (let secondShape of b2.shapes) {
                let c1 = firstShape;
                let c2 = secondShape;

                b1 = originalB1;
                b2 = originalB2;

                // Circle vs circle
                if (c1.type == ShapeType.CIRCLE && c2.type === ShapeType.CIRCLE) {
                    const
                        vFrom1to2 = subtractVec2(c2.center, c1.center),
                        rSum = c1.bounds + c2.bounds,
                        dist = lengthVec2(vFrom1to2);

                    if (dist <= Math.sqrt(rSum * rSum)) {
                        const normalFrom2to1 = normalize(scaleVec2(vFrom1to2, -1)),
                            radiusC2 = scaleVec2(normalFrom2to1, c2.bounds);
                        setCollisionInfo(collisionInfo, rSum - dist, normalize(vFrom1to2), addVec2(c2.center, radiusC2), c1, c2);

                        continue;
                    }

                    continue;
                }

                // Rect vs Rect
                if (c1.type == ShapeType.RECTANGLE && c2.type == ShapeType.RECTANGLE) {
                    let status1 = false,
                        status2 = false;

                    // find Axis of Separation for both rectangles
                    const collisionInfoR1 = EmptyCollision();
                    status1 = findAxisLeastPenetration(c1, c2, collisionInfoR1);
                    if (status1) {
                        const collisionInfoR2 = EmptyCollision();
                        status2 = findAxisLeastPenetration(c2, c1, collisionInfoR2);
                        if (status2) {

                            // if both of rectangles are overlapping, choose the shorter normal as the normal     
                            if (collisionInfoR1.depth < collisionInfoR2.depth) {
                                setCollisionInfo(collisionInfo, collisionInfoR1.depth, collisionInfoR1.normal,
                                    subtractVec2(collisionInfoR1.start, scaleVec2(collisionInfoR1.normal, collisionInfoR1.depth)), collisionInfoR1.shapeA!, collisionInfoR2.shapeB!);
                                continue;
                            }
                            else {
                                setCollisionInfo(collisionInfo, collisionInfoR2.depth, scaleVec2(collisionInfoR2.normal, -1), collisionInfoR2.start, collisionInfoR2.shapeB!, collisionInfoR2.shapeA!);
                                continue;
                            }
                        }
                    }

                    continue;
                }

                // Rectangle vs Circle
                // (c1 is the rectangle and c2 is the circle, invert the two if needed)
                if (c1.type === ShapeType.CIRCLE && c2.type === ShapeType.RECTANGLE) {
                    [c1, c2] = [c2, c1];
                }

                if (c1.type === ShapeType.RECTANGLE && c2.type === ShapeType.CIRCLE) {
                    let inside = 1,
                        bestDistance = -1e9,
                        nearestEdge = 0,
                        i, v,
                        circ2Pos: Vector2 | undefined, projection;
                    for (i = 4; i--;) {

                        // find the nearest face for center of circle    
                        circ2Pos = c2.center;
                        v = subtractVec2(circ2Pos, c1.vertices[i]);
                        projection = dotProduct(v, c1.faceNormals[i]);
                        if (projection > 0) {

                            // if the center of circle is outside of c1angle
                            bestDistance = projection;
                            nearestEdge = i;
                            inside = 0;
                            break;
                        }

                        if (projection > bestDistance) {
                            bestDistance = projection;
                            nearestEdge = i;
                        }
                    }
                    let dis, normal;

                    if (inside && circ2Pos) {
                        // the center of circle is inside of c1angle
                        setCollisionInfo(collisionInfo, c2.bounds - bestDistance, c1.faceNormals[nearestEdge], subtractVec2(circ2Pos, scaleVec2(c1.faceNormals[nearestEdge], c2.bounds)), c1, c2);
                        continue;
                    }
                    else if (circ2Pos) {

                        // the center of circle is outside of c1angle
                        // v1 is from left vertex of face to center of circle 
                        // v2 is from left vertex of face to right vertex of face
                        let
                            v1 = subtractVec2(circ2Pos, c1.vertices[nearestEdge]),
                            v2 = subtractVec2(c1.vertices[(nearestEdge + 1) % 4], c1.vertices[nearestEdge]),
                            dotProd = dotProduct(v1, v2);
                        if (dotProd < 0) {

                            // the center of circle is in corner region of X[nearestEdge]
                            dis = lengthVec2(v1);

                            // compare the distance with radium to decide collision
                            if (dis > c2.bounds) {
                                continue;
                            }
                            normal = normalize(v1);
                            setCollisionInfo(collisionInfo, c2.bounds - dis, normal, addVec2(circ2Pos, scaleVec2(normal, -c2.bounds)), c1, c2);
                            continue;
                        }
                        else {

                            // the center of circle is in corner region of X[nearestEdge+1]
                            // v1 is from right vertex of face to center of circle 
                            // v2 is from right vertex of face to left vertex of face
                            v1 = subtractVec2(circ2Pos, c1.vertices[(nearestEdge + 1) % 4]);
                            v2 = scaleVec2(v2, -1);
                            dotProd = dotProduct(v1, v2);
                            if (dotProd < 0) {
                                dis = lengthVec2(v1);

                                // compare the distance with radium to decide collision
                                if (dis > c2.bounds) {
                                    continue;
                                }
                                normal = normalize(v1);
                                setCollisionInfo(collisionInfo, c2.bounds - dis, normal, addVec2(circ2Pos, scaleVec2(normal, -c2.bounds)), c1, c2);
                                continue;
                            } else {

                                // the center of circle is in face region of face[nearestEdge]
                                if (bestDistance < c2.bounds) {
                                    setCollisionInfo(collisionInfo, c2.bounds - bestDistance, c1.faceNormals[nearestEdge], subtractVec2(circ2Pos, scaleVec2(c1.faceNormals[nearestEdge], c2.bounds)), c1, c2);

                                    continue;
                                } else {
                                    continue;
                                }
                            }
                        }
                    }
                    continue;
                }

            }
        }

        return collisionInfo.depth > 0;
    }

    function resolveCollision(world: World, s1: Body, s2: Body, collisionInfo: CollisionDetails): boolean {
        if (bodyAtRest(world, s1) && bodyAtRest(world, s2)) {
            return false;
        }

        const
            mass1 = !s1.static ? s1.mass : 0,
            mass2 = !s2.static ? s2.mass : 0,
            inertia1 = !s1.static ? s1.inertia : 0,
            inertia2 = !s2.static ? s2.inertia : 0;

        // correct positions
        const
            num = collisionInfo.depth / (mass1 + mass2) * .8, // .8 = pos correction rate = percentage of separation to project objects
            correctionAmount = scaleVec2(collisionInfo.normal, num),
            n = collisionInfo.normal;

        if (correctionAmount.x === 0 && correctionAmount.y === 0) {
            return false;
        }


        if (!s1.static) {
            _moveBody(s1, scaleVec2(correctionAmount, -mass1));
        }
        if (!s2.static) {
            _moveBody(s2, scaleVec2(correctionAmount, mass2));
        }

        // the direction of collisionInfo is always from s1 to s2
        // but the Mass is inverse, so start scale with s2 and end scale with s1
        const
            start = scaleVec2(collisionInfo.start, mass2 / (mass1 + mass2)),
            end = scaleVec2(collisionInfo.end, mass1 / (mass1 + mass2)),
            p = addVec2(start, end),
            // r is vector from center of object to collision point
            r1 = subtractVec2(p, s1.static ? s1.center : s1.centerOfPhysics),
            r2 = subtractVec2(p, s2.static ? s2.center : s2.centerOfPhysics),

            // newV = V + v cross R
            v1 = !s1.static ? addVec2(s1.velocity, newVec2(-1 * s1.angularVelocity * r1.y, s1.angularVelocity * r1.x)) : newVec2(0, 0),
            v2 = !s2.static ? addVec2(s2.velocity, newVec2(-1 * s2.angularVelocity * r2.y, s2.angularVelocity * r2.x)) : newVec2(0, 0),
            relativeVelocity = subtractVec2(v2, v1),

            // Relative velocity in normal direction
            rVelocityInNormal = dotProduct(relativeVelocity, n);

        // if objects moving apart ignore
        if (rVelocityInNormal > 0) {
            return false;
        }

        // compute and apply response impulses for each object  
        const
            newRestitution = Math.min(s1.restitution, s2.restitution),
            newFriction = Math.min(s1.friction, s2.friction),

            // R cross N
            R1crossN = crossProduct(r1, n),
            R2crossN = crossProduct(r2, n),

            // Calc impulse scalar
            // the formula of jN can be found in http://www.myphysicslab.com/collision.html
            jN = (-(1 + newRestitution) * rVelocityInNormal) / (mass1 + mass2 + R1crossN * R1crossN * inertia1 + R2crossN * R2crossN * inertia2);
        let
            // impulse is in direction of normal ( from s1 to s2)
            impulse = scaleVec2(n, jN);

        // impulse = F dt = m * ?v
        // ?v = impulse / m
        if (!s1.static) {
            if (!s1.fixedPosition) {
                s1.velocity = subtractVec2(s1.velocity, scaleVec2(impulse, s1.mass));
            }
            if (!s1.fixedRotation) {
                s1.angularVelocity -= R1crossN * jN * s1.inertia;
            }
        }
        if (!s2.static) {
            if (!s2.fixedPosition) {
                s2.velocity = addVec2(s2.velocity, scaleVec2(impulse, s2.mass));
            }
            if (!s2.fixedRotation) {
                s2.angularVelocity += R2crossN * jN * s2.inertia;
            }
        }

        const
            tangent = scaleVec2(normalize(subtractVec2(relativeVelocity, scaleVec2(n, dotProduct(relativeVelocity, n)))), -1),
            R1crossT = crossProduct(r1, tangent),
            R2crossT = crossProduct(r2, tangent);
        let
            jT = (-(1 + newRestitution) * dotProduct(relativeVelocity, tangent) * newFriction) / (mass1 + mass2 + R1crossT * R1crossT * inertia1 + R2crossT * R2crossT * inertia2);

        // friction should less than force in normal direction
        if (jT > jN) {
            jT = jN;
        }

        // impulse is from s1 to s2 (in opposite direction of velocity)
        impulse = scaleVec2(tangent, jT);

        if (!s1.static) {
            s1.velocity = subtractVec2(s1.velocity, scaleVec2(impulse, s1.mass));
            s1.angularVelocity -= R1crossT * jT * s1.inertia;
            s1.velocity.x *= world.damp;
            s1.velocity.y *= world.damp;
            s1.angularVelocity *= world.angularDamp;
        }

        if (!s2.static) {
            s2.velocity = addVec2(s2.velocity, scaleVec2(impulse, s2.mass));
            s2.angularVelocity += R2crossT * jT * s2.inertia;
            s2.velocity.x *= world.damp;
            s2.velocity.y *= world.damp;
            s2.angularVelocity *= world.angularDamp;
        }

        return true;
    }
}
