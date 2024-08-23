/**
 * A stateless functional physics engine based off the fantastic work here:
 *
 * https://github.com/xem/mini2Dphysics/tree/gh-pages
 */
export declare namespace physics {
    /** The shape of a body */
    export enum ShapeType {
        /** A circular shape */
        CIRCLE = 0,
        /** A rectangle shape */
        RECTANGLE = 1
    }
    export type Shape = Rectangle | Circle;
    export type BaseShape = {
        /** The id given to this shape */
        id: number;
        /** The radius of a bounding circle around the body */
        bounds: number;
        /** The boding box around the body - used for efficient bounds tests */
        boundingBox: Vector2;
        /** The center of the body */
        center: Vector2;
        /** The shape type of the body */
        type: ShapeType;
        /** True if this a sensor not a real body shape */
        sensor: boolean;
        /** True if this sensor is currently triggered */
        sensorColliding: boolean;
        /** The inertia applied when this shape is colliding */
        inertia: number;
        /** The ID of the body this shape is part of */
        bodyId?: number;
    };
    export type Circle = {
        type: ShapeType.CIRCLE;
    } & BaseShape;
    export type Rectangle = {
        type: ShapeType.RECTANGLE;
        /** The width of the body if its a rectangle */
        width: number;
        /** The height of the body if its a rectangle */
        height: number;
        /** The normals of the faces of the rectangle */
        faceNormals: Vector2[];
        /** The vertices of the corners of the rectangle */
        vertices: Vector2[];
        /** The angle of the rectangle */
        angle: number;
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
        shapes: Shape[];
        /** The friction to apply for this body in a collision */
        friction: number;
        /** The restitution to apply for this body in a collision */
        restitution: number;
        /** User data associated with the body  */
        data: any;
        /** Permeability of the object - anything other than zero will stop collision response */
        permeability: number;
        /** The center of the body */
        center: Vector2;
        /** The current angle of rotation of the body */
        angle: number;
        /** True if this body is static - i.e. it doesn't moved or rotate */
        static: boolean;
        /** Discriminator */
        type: "BODY";
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
        mass: number;
        /** The current velocity of the body */
        velocity: Vector2;
        /** The current acceleration of the body */
        acceleration: Vector2;
        /** The average angle of rotation of the bod - this keeps things stable */
        averageAngle: number;
        /** The current angular velocity of the body */
        angularVelocity: number;
        /** The current angular acceleration of the body */
        angularAcceleration: number;
        /** The current inertia of the body */
        inertia: number;
        /** The amount of time this body has been resting for */
        restingTime: number;
        /** True if this body can not rotate */
        fixedRotation: boolean;
        /** True if this body can not move */
        fixedPosition: boolean;
        /** The center of rotation based on the last collision */
        centerOfPhysics: Vector2;
    }
    export type Body = StaticRigidBody | DynamicRigidBody;
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
    export function allBodies(world: World, dynamics?: DynamicRigidBody[]): Body[];
    /**
     * Get a list of all bodies that are enabled in the system
     *
     * @param world The world containing the bodies
     * @returns The list of bodies in the world
     */
    export function enabledBodies(world: World, dynamics?: DynamicRigidBody[]): Body[];
    export function disableBody(world: World, body: Body, dynamics?: DynamicRigidBody[]): void;
    export function enableBody(world: World, body: Body, dynamics?: DynamicRigidBody[]): void;
    /**
     * Get the bounds of the world
     *
     * @param world The world to calculate the bounds of
     * @param staticOnly Only include static bodies
     * @returns The minimum and maximum coordinates of any body in the world
     */
    export function getWorldBounds(world: World, staticOnly?: boolean, dynamics?: DynamicRigidBody[]): {
        min: Vector2;
        max: Vector2;
    };
    /**
     * Create a new world for bodies to live in
     *
     * @param gravity The gravity to apply to bodies in this system
     * @param restTime The time it takes for a body to go into "resting" state (default 1=second)
     * @returns The newly created world
     */
    export function createWorld(gravity?: Vector2, restTime?: number): World;
    /**
     * Exclude collisions between the two bodies specified. They'll no longer collide or
     * have collision response
     *
     * @param world The world in which we want the exclusion to take place
     * @param bodyA First body to exclude from colliding with bodyB
     * @param bodyB Second body to exclude from colliding with bodyA
     */
    export function excludeCollisions(world: World, bodyA: Body, bodyB: Body): void;
    /**
     * Include collisions between the two bodies specified. They'll collide and
     * have collision response. This undoes any exclusion
     *
     * @param world The world in which we want the exclusion to take place
     * @param bodyA First body to exclude from colliding with bodyB
     * @param bodyB Second body to exclude from colliding with bodyA
     */
    export function includeCollisions(world: World, bodyA: Body, bodyB: Body): void;
    /**
     * Create a joint between two bodies in the world
     *
     * @param world The world in which to create the joint
     * @param bodyA The first body to connect to the joint
     * @param bodyB The second body to connect to the joint
     * @param rigidity The amount the joint will compress
     * @param elasticity The amount the joint will stretch
     */
    export function createJoint(world: World, bodyA: Body | Shape, bodyB: Body | Shape, rigidity?: number, elasticity?: number, soft?: boolean): void;
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
    export function createCircle(world: World, center: Vector2, radius: number, mass: number, friction: number, restitution: number, sensor?: boolean, data?: any): Body;
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
    export function createRectangle(world: World, center: Vector2, width: number, height: number, mass: number, friction: number, restitution: number, sensor?: boolean, data?: any): Body;
    /**
     * Move a body
     *
     * @param body The body to move
     * @param v The amount to move
     */
    export function moveBody(body: Body, v: Vector2): void;
    export function setCenter(body: Body, v: Vector2): void;
    export function setRotation(body: Body, angle: number): void;
    /**
     * Rotate a body around its center
     *
     * @param body The body to rotate
     * @param angle The angle in radian to rotate the body by
     */
    export function rotateBody(body: Body, angle: number): void;
    /**
     * Move the physics world through a step of a given time period.
     *
     * @param fps The frames per second the world is running at. The step will be 1/fps
     * in length.
     * @param world The world to step
     */
    export function worldStep(fps: number, world: World, dynamics?: DynamicRigidBody[]): Collision[];
    /**
     * Check if the physics system is at rest.
     *
     * @param world The world to check
     * @param forSeconds The number of seconds a body must be at rest to be considered stopped
     * @returns True if all bodies are at rest
     */
    export function atRest(world: World, forSeconds?: number, dynamics?: DynamicRigidBody[]): boolean;
    /**
     * Create a new vector
     *
     * @param x The x value of the new vector
     * @param y The y value of the new vector
     * @returns The newly created vector
     */
    export function newVec2(x: number, y: number): Vector2;
    /**
     * Get the length of a vector
     *
     * @param v The vector to measure
     * @returns The length of the vector
     */
    export function lengthVec2(v: Vector2): number;
    /**
     * Add a vector to another
     *
     * @param v The first vector to add
     * @param w The second vector to add
     * @returns The newly created vector containing the addition result
     */
    export function addVec2(v: Vector2, w: Vector2): Vector2;
    /**
     * Subtract a vector to another
     *
     * @param v The vector to be subtracted from
     * @param w The vector to subtract
     * @returns The newly created vector containing the subtraction result
     */
    export function subtractVec2(v: Vector2, w: Vector2): Vector2;
    /**
     * Scale a vector
     *
     * @param v The vector to scale
     * @param n The amount to scale the vector by
     * @returns The newly created vector
     */
    export function scaleVec2(v: Vector2, n: number): Vector2;
    /**
     * Get the dot product of two vector
     *
     * @param v The first vector to get the dot product from
     * @param w The second vector to get the dot product from
     * @returns The dot product of the two vectors
     */
    export function dotProduct(v: Vector2, w: Vector2): number;
    /**
     * Get the cross product of two vector
     *
     * @param v The first vector to get the cross product from
     * @param w The second vector to get the cross product from
     * @returns The cross product of the two vectors
     */
    export function crossProduct(v: Vector2, w: Vector2): number;
    /**
     * Rotate a vector around a specific point
     *
     * @param v The vector to rotate
     * @param center The center of the rotate
     * @param angle The angle in radians to rotate the vector by
     * @returns The newly created vector result
     */
    export function rotateVec2(v: Vector2, center: Vector2, angle: number): Vector2;
    /**
     * Normalize a vector (make it a unit vector)
     *
     * @param v The vector to normalize
     * @returns The newly created normalized vector
     */
    export function normalize(v: Vector2): Vector2;
    export function createCircleShape(world: World, center: Vector2, radius: number, sensor?: boolean): Circle;
    export function createRectangleShape(world: World, center: Vector2, width: number, height: number, ang?: number, sensor?: boolean): Rectangle;
    export function createRigidBody(world: World, center: Vector2, mass: number, friction: number, restitution: number, shapes: Shape[], data?: any): Body;
    /**
     * Add a body to the world
     *
     * @param world The world to which the body should be added
     * @param body The body to add
     */
    export function addBody(world: World, body: Body, dynamics?: DynamicRigidBody[]): void;
    /**
     * Remove a body from the world
     *
     * @param world The world from which the body should be removed
     * @param body The body to remove
     */
    export function removeBody(world: World, body: Body, dynamics?: DynamicRigidBody[]): void;
    export {};
}
