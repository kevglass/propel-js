
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
    }

    interface BodyCore {
        /** The unique ID of this body */
        id: number;
        /** The shape type of the body */
        type: ShapeType,
        /** The center of the body */
        center: Vector2,
        /** The friction to apply for this body in a collision */
        friction: number,
        /** The restitution to apply for this body in a collision */
        restitution: number,
        /** The radius of a bounding circle around the body */
        bounds: number,
        /** User data associated with the body  */
        data: any;
        /** Permeability of the object - anything other than zero will stop collision response */
        permeability: number;
        /** The boding box around the body - used for efficient bounds tests */
        boundingBox: Vector2,
        /** The width of the body if its a rectangle */
        width: number,
        /** The height of the body if its a rectangle */
        height: number,
        /** The current angle of rotation of the body */
        angle: number,
        /** The normals of the faces of the rectangle */
        faceNormals: Vector2[]
        /** The vertices of the corners of the rectangle */
        vertices: Vector2[],
        /** True if this body is static - i.e. it doesn't moved or rotate */
        static: boolean;
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

        const body: Body = bodies[0];
        let min = newVec2(body.center.x - body.bounds, body.center.y - body.bounds);
        let max = newVec2(body.center.x + body.bounds, body.center.y + body.bounds);

        for (const body of bodies) {
            if (body.type === ShapeType.CIRCLE) {
                min.x = Math.min(min.x, body.center.x - body.bounds);
                min.y = Math.min(min.y, body.center.y - body.bounds);
                max.x = Math.max(max.x, body.center.x + body.bounds);
                max.y = Math.max(max.y, body.center.y + body.bounds);
            } else if (body.type === ShapeType.RECTANGLE) {
                for (const vert of body.vertices) {
                    min.x = Math.min(min.x, vert.x);
                    min.y = Math.min(min.y, vert.y);
                    max.x = Math.max(max.x, vert.x);
                    max.y = Math.max(max.y, vert.y);
                }
            }
        }

        return { min, max };
    }

    /**
     * Create a new world for bodies to live in
     * 
     * @param gravity The gravity to apply to bodies in this system
     * @returns The newly created world
     */
    export function createWorld(gravity?: Vector2): World {
        return {
            staticBodies: [],
            dynamicBodies: [],
            disabledBodies: [],
            gravity: gravity ?? newVec2(0, 100),
            angularDamp: 0.98,
            damp: 0.98,
            nextId: 1,
            joints: [],
            frameCount: 0,
            jointRestriction: 1
        }
    };

    /**
     * Create a joint between two bodies in the world
     * 
     * @param world The world in which to create the joint
     * @param bodyA The first body to connect to the joint
     * @param bodyB The second body to connect to the joint
     * @param rigidity The amount the joint will compress 
     * @param elasticity The amount the joint will stretch
     */
    export function createJoint(world: World, bodyA: Body, bodyB: Body, rigidity: number = 1, elasticity: number = 0): void {
        world.joints.push({
            bodyA: bodyA.id,
            bodyB: bodyB.id,
            distance: lengthVec2(subtractVec2(bodyA.center, bodyB.center)) + 0.5, // add a bit of space to prevent constant collision
            rigidity,
            elasticity
        });
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
    export function createCircle(world: World, center: Vector2, radius: number, mass: number, friction: number, restitution: number, data?: any): Body {
        // the original code only works well with whole number static objects
        center.x = Math.floor(center.x);
        center.y = Math.floor(center.y);
        radius = Math.floor(radius);

        return createRigidBody(world, center, mass, friction, restitution, 0, radius, undefined, undefined, data);
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
    export function createRectangle(world: World, center: Vector2, width: number, height: number, mass: number, friction: number, restitution: number, data?: any): Body {
        // the original code only works well with whole number static objects
        center.x = Math.floor(center.x);
        center.y = Math.floor(center.y);
        width = Math.floor(width);
        height = Math.floor(height);

        return createRigidBody(world, center, mass, friction, restitution, 1, Math.hypot(width, height) / 2, width, height, data);
    };

    /**
     * Move a body 
     * 
     * @param body The body to move
     * @param v The amount to move
     */
    export function moveBody(body: DynamicRigidBody, v: Vector2): void {
        _moveBody(body, v, true);
    }

    function _moveBody(body: DynamicRigidBody, v: Vector2, force = false): void {
        if (!force) {
            if (body.static) {
                return;
            }
        }

        // Center
        body.center = addVec2(body.center, v);

        // Rectangle (move vertex)
        if (body.type === ShapeType.RECTANGLE) {
            for (let i = 4; i--;) {
                body.vertices[i] = addVec2(body.vertices[i], v);
            }
            updateBoundingBox(body);
        }
    };


    export function setCenter(body: Body, v: Vector2): void {
        // Center
        body.center = v;

        // Rectangle (move vertex)
        if (body.type === ShapeType.RECTANGLE) {
            for (let i = 4; i--;) {
                body.vertices[i] = addVec2(body.vertices[i], v);
            }
            updateBoundingBox(body);
        }
    };

    export function setRotation(body: DynamicRigidBody, angle: number): void {
        // Update angle
        body.angle = angle;
        body.averageAngle = angle;

        // Rectangle (rotate vertex)
        if (body.type === ShapeType.RECTANGLE) {
            for (let i = 4; i--;) {
                body.vertices[i] = rotateVec2(body.vertices[i], body.center, angle);
            }
            updateRectNormals(body);
            updateBoundingBox(body);
        }
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

        // Rectangle (rotate vertex)
        if (body.type) {
            for (let i = 4; i--;) {
                body.vertices[i] = rotateVec2(body.vertices[i], body.center, angle);
            }
            updateRectNormals(body);
            updateBoundingBox(body);
        }
    };

    /**
     * Move the physics world through a step of a given time period.
     * 
     * @param fps The frames per second the world is running at. The step will be 1/fps
     * in length.
     * @param world The world to step 
     */
    export function worldStep(fps: number, world: World, dynamics?: DynamicRigidBody[]): Collision[] {
        dynamics = dynamics ?? world.dynamicBodies;

        const allEnabled = enabledBodies(world, dynamics);
        const all = allBodies(world, dynamics);
        const collisions: Collision[] = [];

        for (const body of dynamics) {
            if (!body.velocity && !body.acceleration) {
                continue
            }
            // Update position/rotation
            body.velocity = addVec2(body.velocity, scaleVec2(body.acceleration, 1 / fps));
            _moveBody(body, scaleVec2(body.velocity, 1 / fps));
            body.angularVelocity += body.angularAcceleration * 1 / fps;
            rotateBody(body, body.angularVelocity * 1 / fps);
        }

        // apply velocity to try and maintain joints
        for (const body of dynamics) {
            const joints = world.joints.filter(j => j.bodyA === body.id || j.bodyB === body.id);
            for (const joint of joints) {
                const otherId = joint.bodyA === body.id ? joint.bodyB : joint.bodyA;
                const other = all.find(b => b.id === otherId);
                if (other) {
                    let vec = subtractVec2(other.center, body.center)
                    const distance = lengthVec2(vec);
                    const diff = distance - joint.distance;
                    if (diff != 0) {
                        if (diff > 0) {
                            vec = scaleVec2(vec, (1 / distance) * diff * (1 - joint.elasticity) * (other.static ? 1 : 0.5));
                        } else {
                            vec = scaleVec2(vec, (1 / distance) * diff * joint.rigidity * (other.static ? 1 : 0.5));
                        }
                        _moveBody(body, vec);
                        body.velocity = addVec2(body.velocity, scaleVec2(vec, fps));
                    }

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

        // Compute collisions and iterate to resolve
        for (let k = 9; k--;) {
            let collision = false;

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

                    if (boundTest(bodyI, bodyJ)) {
                        // Test collision
                        let collisionInfo = EmptyCollision();
                        if (testCollision(world, bodyI, bodyJ, collisionInfo)) {
                            if (bodyJ.permeability > 0) {
                                bodyI.velocity.x *= 1 - bodyJ.permeability;
                                bodyI.velocity.y *= 1 - bodyJ.permeability;
                                bodyI.angularVelocity *= 1 - bodyJ.permeability;
                                continue;
                            }

                            // Make sure the normal is always from object[i] to object[j]
                            if (dotProduct(collisionInfo.normal, subtractVec2(bodyJ.center, bodyI.center)) < 0) {
                                collisionInfo = {
                                    depth: collisionInfo.depth,
                                    normal: scaleVec2(collisionInfo.normal, -1),
                                    start: collisionInfo.end,
                                    end: collisionInfo.start
                                };
                            }

                            // Resolve collision
                            if (resolveCollision(world, bodyI, bodyJ, collisionInfo)) {
                                collision = true;
                                collisions.push({
                                    bodyAId: bodyI.id,
                                    bodyBId: bodyJ.id,
                                    depth: collisionInfo.depth
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

            if (Math.abs(body.center.x - body.averageCenter.x) > 1) {
                body.averageCenter.x = body.center.x;
                body.restingTime = 0;
            }
            if (Math.abs(body.center.y - body.averageCenter.y) > 1) {
                body.averageCenter.y = body.center.y;
                body.restingTime = 0;
            }
            if (Math.abs(body.angle - body.averageAngle) >= 0.1) {
                body.averageAngle = body.angle;
                body.restingTime = 0;
            }
        }

        return collisions;
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


    const EmptyCollision = (): CollisionDetails => {
        return {
            depth: 0,
            normal: newVec2(0, 0),
            start: newVec2(0, 0),
            end: newVec2(0, 0),
        }
    };

    // Collision info setter
    function setCollisionInfo(collision: CollisionDetails, D: number, N: Vector2, S: Vector2) {
        collision.depth = D; // depth
        collision.normal.x = N.x; // normal
        collision.normal.y = N.y; // normal
        collision.start.x = S.x; // start
        collision.start.y = S.y; // start
        collision.end = addVec2(S, scaleVec2(N, D)); // end
    }

    function calculateInertia(type: ShapeType, mass: number, bounds: number, width: number, height: number): number {
        return type === ShapeType.RECTANGLE // inertia
            ? (Math.hypot(width, height) / 2, mass > 0 ? 1 / (mass * (width ** 2 + height ** 2) / 12) : 0) // rectangle
            : (mass > 0 ? (mass * bounds ** 2) / 12 : 0); // circle;
    }

    // New shape
    function createRigidBody(world: World, center: Vector2, mass: number, friction: number, restitution: number, type: number, bounds: number, width = 0, height = 0, data?: any): Body {
        // Prepare data for Rectangle
        let vertices: Vector2[], faceNormals: Vector2[]
        if (type === ShapeType.RECTANGLE) {
            vertices = [ // Vertex: 0: TopLeft, 1: TopRight, 2: BottomRight, 3: BottomLeft (rectangles)
                newVec2(center.x - width / 2, center.y - height / 2),
                newVec2(center.x + width / 2, center.y - height / 2),
                newVec2(center.x + width / 2, center.y + height / 2),
                newVec2(center.x - width / 2, center.y + height / 2)
            ]
            faceNormals = computeRectNormals(vertices)
        } else {
            vertices = []
            faceNormals = []
        }

        const staticBody: StaticRigidBody = {
            id: world.nextId++,
            type,
            center,
            friction,
            restitution,
            bounds,
            boundingBox: calcBoundingBox(type, bounds, vertices, center),
            width,
            height,
            faceNormals,
            vertices,
            static: true,
            angle: 0,
            permeability: 0,
            data: data ?? null
        }

        if (!mass) {
            return staticBody
        } else {
            const dynamicBody: DynamicRigidBody = {
                ...staticBody,
                static: false,
                averageCenter: newVec2(center.x, center.y),
                mass: 1 / mass, // inverseMass
                velocity: newVec2(0, 0), // velocity (speed)
                acceleration: world.gravity, // acceleration
                averageAngle: 0,
                angularVelocity: 0, // angle velocity
                angularAcceleration: 0, // angle acceleration,
                inertia: calculateInertia(type, mass, bounds, width, height),
                restingTime: 0,
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
    function boundTest(s1: Body, s2: Body) {
        const coincideX = Math.abs(s1.center.x - s2.center.x) < s1.boundingBox.x + s2.boundingBox.x;
        const coincideY = Math.abs(s1.center.y - s2.center.y) < s1.boundingBox.y + s2.boundingBox.y;

        return coincideX && coincideY;

        // old bounds check
        // return lengthVec2(subtractVec2(s2.center, s1.center)) <= s1.bounds + s2.bounds;
    }

    function updateBoundingBox(body: Body): void {
        body.boundingBox = calcBoundingBox(body.type, body.bounds, body.vertices, body.center)
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

    function updateRectNormals(body: Body) {
        body.faceNormals = computeRectNormals(body.vertices)
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
    function findAxisLeastPenetration(rect: Body, otherRect: Body, collisionInfo: CollisionDetails) {
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
            setCollisionInfo(collisionInfo, bestDistance, rect.faceNormals[bestIndex], addVec2(supportPoint as Vector2, scaleVec2(rect.faceNormals[bestIndex], bestDistance)));
        }

        return hasSupport;
    }

    // Test collision between two shapes
    function testCollision(world: World, c1: Body, c2: Body, collisionInfo: CollisionDetails): boolean {
        // static bodies don't collide with each other
        if ((c1.static && c2.static)) {
            return false;
        }

        // Circle vs circle
        if (c1.type == ShapeType.CIRCLE && c2.type === ShapeType.CIRCLE) {
            const
                vFrom1to2 = subtractVec2(c2.center, c1.center),
                rSum = c1.bounds + c2.bounds,
                dist = lengthVec2(vFrom1to2);

            if (dist <= Math.sqrt(rSum * rSum)) {
                const normalFrom2to1 = normalize(scaleVec2(vFrom1to2, -1)),
                    radiusC2 = scaleVec2(normalFrom2to1, c2.bounds);
                setCollisionInfo(collisionInfo, rSum - dist, normalize(vFrom1to2), addVec2(c2.center, radiusC2));

                return true;
            }

            return false;
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
                            subtractVec2(collisionInfoR1.start, scaleVec2(collisionInfoR1.normal, collisionInfoR1.depth)));
                        return true;
                    }
                    else {
                        setCollisionInfo(collisionInfo, collisionInfoR2.depth, scaleVec2(collisionInfoR2.normal, -1), collisionInfoR2.start);
                        return true;
                    }
                }
            }

            return false;
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
                setCollisionInfo(collisionInfo, c2.bounds - bestDistance, c1.faceNormals[nearestEdge], subtractVec2(circ2Pos, scaleVec2(c1.faceNormals[nearestEdge], c2.bounds)));
                return true;
            }
            else if (circ2Pos) {

                // the center of circle is outside of c1angle
                // v1 is from left vertex of face to center of circle 
                // v2 is from left vertex of face to right vertex of face
                let
                    v1 = subtractVec2(circ2Pos, c1.vertices[nearestEdge]),
                    v2 = subtractVec2(c1.vertices[(nearestEdge + 1) % 4], c1.vertices[nearestEdge]),
                    dotp = dotProduct(v1, v2);
                if (dotp < 0) {

                    // the center of circle is in corner region of X[nearestEdge]
                    dis = lengthVec2(v1);

                    // compare the distance with radium to decide collision
                    if (dis > c2.bounds) {
                        return false;
                    }
                    normal = normalize(v1);
                    setCollisionInfo(collisionInfo, c2.bounds - dis, normal, addVec2(circ2Pos, scaleVec2(normal, -c2.bounds)));
                    return true;
                }
                else {

                    // the center of circle is in corner region of X[nearestEdge+1]
                    // v1 is from right vertex of face to center of circle 
                    // v2 is from right vertex of face to left vertex of face
                    v1 = subtractVec2(circ2Pos, c1.vertices[(nearestEdge + 1) % 4]);
                    v2 = scaleVec2(v2, -1);
                    dotp = dotProduct(v1, v2);
                    if (dotp < 0) {
                        dis = lengthVec2(v1);

                        // compare the distance with radium to decide collision
                        if (dis > c2.bounds) {
                            return false;
                        }
                        normal = normalize(v1);
                        setCollisionInfo(collisionInfo, c2.bounds - dis, normal, addVec2(circ2Pos, scaleVec2(normal, -c2.bounds)));
                        return true;
                    } else {

                        // the center of circle is in face region of face[nearestEdge]
                        if (bestDistance < c2.bounds) {
                            setCollisionInfo(collisionInfo, c2.bounds - bestDistance, c1.faceNormals[nearestEdge], subtractVec2(circ2Pos, scaleVec2(c1.faceNormals[nearestEdge], c2.bounds)));
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            }
            return false;
        }

        return false;
    }

    function resolveCollision(world: World, s1: Body, s2: Body, collisionInfo: CollisionDetails): boolean {
        if (s1.static && s2.static) {
            return false;
        }

        const
            mass1 = !s1.static ? s1.mass : 0,
            mass2 = !s2.static ? s2.mass : 0,
            inertia1 = !s1.static ? s1.inertia : 0,
            inertia2 = !s2.static ? s2.inertia : 0;

        // correct positions
        const
            num = collisionInfo.depth / (mass1 + mass2) * .8, // .8 = poscorrectionrate = percentage of separation to project objects
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
        // but the Mass is inversed, so start scale with s2 and end scale with s1
        const
            start = scaleVec2(collisionInfo.start, mass2 / (mass1 + mass2)),
            end = scaleVec2(collisionInfo.end, mass1 / (mass1 + mass2)),
            p = addVec2(start, end),
            // r is vector from center of object to collision point
            r1 = subtractVec2(p, s1.center),
            r2 = subtractVec2(p, s2.center),

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
            newRestituion = Math.min(s1.restitution, s2.restitution),
            newFriction = Math.min(s1.friction, s2.friction),

            // R cross N
            R1crossN = crossProduct(r1, n),
            R2crossN = crossProduct(r2, n),

            // Calc impulse scalar
            // the formula of jN can be found in http://www.myphysicslab.com/collision.html
            jN = (-(1 + newRestituion) * rVelocityInNormal) / (mass1 + mass2 + R1crossN * R1crossN * inertia1 + R2crossN * R2crossN * inertia2);
        let
            // impulse is in direction of normal ( from s1 to s2)
            impulse = scaleVec2(n, jN);

        // impulse = F dt = m * ?v
        // ?v = impulse / m
        if (!s1.static) {
            s1.velocity = subtractVec2(s1.velocity, scaleVec2(impulse, s1.mass));
            s1.angularVelocity -= R1crossN * jN * s1.inertia;
        }
        if (!s2.static) {
            s2.velocity = addVec2(s2.velocity, scaleVec2(impulse, s2.mass));
            s2.angularVelocity += R2crossN * jN * s2.inertia;
        }

        const
            tangent = scaleVec2(normalize(subtractVec2(relativeVelocity, scaleVec2(n, dotProduct(relativeVelocity, n)))), -1),
            R1crossT = crossProduct(r1, tangent),
            R2crossT = crossProduct(r2, tangent);
        let
            jT = (-(1 + newRestituion) * dotProduct(relativeVelocity, tangent) * newFriction) / (mass1 + mass2 + R1crossT * R1crossT * inertia1 + R2crossT * R2crossT * inertia2);

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

    /// A simple puck table for lighter physics

    /**
     * A more simple physics model based on a set of pucks on a table. Theres probably 
     * quite a few games that could use this limited environment
     */
    export interface Table {
        /** The collection of pucks being simulated */
        pucks: Puck[];
        /** The pucks that have fallen off the table if thats allowed */
        pucksRemoved: Puck[];
        /** The friction to apply to the pucks ont he table */
        friction: number;
        /** The next ID to assign */
        nextId: number;
        /** The x position of the top left table in the world */
        x: number;
        /** The y position of the top left of the table in the world */
        y: number;
        /** The width of the table */
        width: number;
        /** The height of the table */
        height: number;
        /** True if the table is enclosed. Enclosed tables cause pucks to bounce off the edge. Non-enclosed tables let pucks fall off the edge */
        enclosed: boolean;
        /** The efficiency (elastic) of the collisions */
        collisionEfficiency: number;
        /** horizontal gap in top and bottom edge */
        horizontalGap: number;
        /** vertical gap in left and right edge */
        verticalGap: number;
        /** The minimum velocity pucks can move before being consider stopped */
        minimumVelocity: number;
    }

    /**
     * A single circular puck on the table
     */
    export interface Puck {
        /** The ID of the puck on the table */
        id: number;
        /** The position of the puck */
        position: Vector2;
        /** The velocity of the puck */
        velocity: Vector2;
        /** The radius of the puck */
        radius: number;
        /** The mass simulated for this puck */
        mass: number;
        /** User data provided for the puck */
        data: any;
        /** True if the puck can pass through any edge gap */
        canUseGap: boolean;
        /** Out of gap */
        outOfGap: boolean;
    }

    /**
     * Description of a collision happening on the table
     */
    export interface PuckCollision {
        /** The ID of the first puck that collided */
        puckIdA: number;
        /** The ID of the second puck that collided */
        puckIdB: number;
    }

    /**
     * Create a table to simulate a collection of pucks bouncing  around
     * 
     * @param x The x coordinate of the top left of the table
     * @param y The y coordinate of the top left of the table
     * @param width The width of the table 
     * @param height The height of the table 
     * @param enclosed True if the table is enclosed. Enclosed tables make pucks bounce off the edge. Non-enclosed
     * tables let pucks fall of the edge
     * @param collisionEfficiency Option efficiency of elastic collisions
     * @returns A newly created simulation of pucks on a table
     */
    export function createTable(x: number, y: number, width: number, height: number, enclosed: boolean, collisionEfficiency?: number): Table {
        return {
            x, y, width, height,
            pucks: [],
            pucksRemoved: [],
            friction: 0.2,
            nextId: 1,
            enclosed,
            collisionEfficiency: collisionEfficiency ?? 1,
            horizontalGap: 0,
            verticalGap: 0,
            minimumVelocity: 0.5
        };
    }

    export function tableAtRest(table: Table, dynamics?: Puck[]): boolean {
        return (dynamics ?? table.pucks).find(p => p.velocity.x !== 0 && p.velocity.y !== 0) == undefined;
    }

    /**
     * Create a puck to be simulated on the table
     * 
     * @param table The table simulation the new puck will be part of
     * @param x The x coordinate of the position of the puck
     * @param y The y coordinate of the position of the puck
     * @param radius The radius of the circular puck
     * @returns The newly create puck
     */
    export function createPuck(table: Table, x: number, y: number, radius: number, data?: any): Puck {
        return { id: table.nextId++, position: newVec2(x, y), radius, velocity: newVec2(0, 0), mass: radius * radius, data: data ?? null, canUseGap: false, outOfGap: false };
    }

    /**
     * Step the simulation of the pucks and table
     * 
     * @param fps The frames per second to run the simulation at, higher FPS mean better resolution on the collisions
     * @param table The table being simulated
     * @returns Collisions and puck removals that happened in this step
     */
    export function tableStep(fps: number, table: Table, dynamics?: Puck[]): { collisions: PuckCollision[], pucksRemoved: number[] } {
        const collisions: PuckCollision[] = [];
        const pucksRemoved: number[] = [];

        // move all the pucks
        for (const puck of [...(dynamics ?? table.pucks)]) {
            // apply global friction
            if (Math.abs(puck.velocity.x) + Math.abs(puck.velocity.y) < table.minimumVelocity) {
                puck.velocity.x = 0;
                puck.velocity.y = 0;
                continue;
            }

            puck.velocity.x -= (puck.velocity.x * table.friction) / fps;
            puck.velocity.y -= (puck.velocity.y * table.friction) / fps;
            puck.position.x += puck.velocity.x / fps;
            puck.position.y += puck.velocity.y / fps;

            // distance from gap
            const dx = Math.abs((table.x + (table.width / 2)) - puck.position.x);
            const dy = Math.abs((table.y + (table.height / 2)) - puck.position.y);

            if (puck.canUseGap) {
                if (dx < table.horizontalGap && (puck.position.y < table.y || puck.position.y > table.y + table.height)) {
                    // gone out of bounds through the gap
                    puck.outOfGap = true;
                }
                if (dy < table.verticalGap && (puck.position.x < table.x || puck.position.x > table.x + table.width)) {
                    // gone out of bounds through the gap
                    puck.outOfGap = true;
                }
            }
            if (!puck.canUseGap || dx > table.horizontalGap && dy > table.verticalGap) {
                // deal with bouncing off table edges
                if (table.enclosed && !puck.outOfGap) {
                    let collision = false;
                    if (puck.position.x < table.x + puck.radius && puck.velocity.x < 0) {
                        puck.velocity.x = -puck.velocity.x;
                        puck.position.x = table.x + puck.radius;
                        collision = true;
                    }
                    if (puck.position.y < table.y + puck.radius && puck.velocity.y < 0) {
                        puck.velocity.y = -puck.velocity.y;
                        puck.position.y = table.y + puck.radius;
                        collision = true;
                    }
                    if (puck.position.x > table.x + table.width - puck.radius && puck.velocity.x > 0) {
                        puck.velocity.x = -puck.velocity.x;
                        puck.position.x = table.x + table.width - puck.radius;
                        collision = true;
                    }
                    if (puck.position.y > table.y + table.height - puck.radius && puck.velocity.y > 0) {
                        puck.velocity.y = -puck.velocity.y;
                        puck.position.y = table.y + table.height - puck.radius;
                        collision = true;
                    }

                    if (collision) {
                        puck.velocity.x -= ((1 - table.collisionEfficiency) / fps) * puck.velocity.x;
                        puck.velocity.y -= ((1 - table.collisionEfficiency) / fps) * puck.velocity.y;
                        collisions.push({
                            puckIdA: puck.id,
                            puckIdB: -1
                        });
                    }
                } else if (!table.enclosed) {
                    if ((puck.position.x < table.x - puck.radius) ||
                        (puck.position.x > table.x + table.width + puck.radius) ||
                        (puck.position.y < table.y - puck.radius) ||
                        (puck.position.y > table.y + table.height + puck.radius)) {
                        (dynamics ?? table.pucks).splice((dynamics ?? table.pucks).indexOf(puck), 1);
                        table.pucksRemoved.push(puck);
                        pucksRemoved.push(puck.id);
                    }
                }
            }
        }

        // 10 iterations for collision resolution
        for (let i = 0; i < 10; i++) {
            for (const puckA of (dynamics ?? table.pucks)) {
                for (const puckB of (dynamics ?? table.pucks)) {
                    if (puckA === puckB) {
                        continue;
                    }

                    // test for collision
                    const nx = puckB.position.x - puckA.position.x;
                    const ny = puckB.position.y - puckA.position.y;
                    const len2 = (nx * nx) + (ny * ny);
                    const rad = (puckB.radius + puckA.radius);
                    const rad2 = rad * rad;
                    if (rad2 > len2) {
                        // close enough for collision
                        const len = Math.sqrt(len2);

                        // move out of collision
                        const normal = scaleVec2(newVec2(nx, ny), 1 / len);
                        const penetration = rad - len;
                        const penOver2 = penetration / 2;
                        puckA.position.x -= penOver2 * normal.x;
                        puckA.position.y -= penOver2 * normal.y;
                        puckB.position.x += penOver2 * normal.x;
                        puckB.position.y += penOver2 * normal.y;

                        const tangent = newVec2(-normal.y, normal.x);

                        // change velocity of pucks based on the collision
                        const dpTanA = dotProduct(tangent, puckA.velocity);
                        const dpTanB = dotProduct(tangent, puckB.velocity);
                        const dpNormA = dotProduct(normal, puckA.velocity);
                        const dpNormB = dotProduct(normal, puckB.velocity);

                        let m1 = ((dpNormA * (puckA.mass - puckB.mass)) + (2.0 * puckB.mass * dpNormB)) / (puckA.mass + puckB.mass);
                        let m2 = ((dpNormB * (puckB.mass - puckA.mass)) + (2.0 * puckA.mass * dpNormA)) / (puckA.mass + puckB.mass);
                        m1 -= ((1 - table.collisionEfficiency) / fps) * m1;
                        m2 -= ((1 - table.collisionEfficiency) / fps) * m2;

                        // Update puck velocities
                        puckA.velocity.x = (tangent.x * dpTanA) + (normal.x * m1);
                        puckA.velocity.y = (tangent.y * dpTanA) + (normal.y * m1);
                        puckB.velocity.x = (tangent.x * dpTanB) + (normal.x * m2)
                        puckB.velocity.y = (tangent.y * dpTanB) + (normal.y * m2);

                        collisions.push({
                            puckIdA: puckA.id,
                            puckIdB: puckB.id
                        });
                    }
                }
            }
        }

        return { collisions, pucksRemoved };
    }
}