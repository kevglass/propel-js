import type { PlayerId, RuneClient } from "rune-sdk"
import { physics } from "../../dist/index"
import { simpleInit } from "../../examples/src/examples/Simple"
import { stackInit } from "../../examples/src/examples/Stack"
import { pileInit, pileUpdate } from "../../examples/src/examples/Pile"
import { jointsInit } from "../../examples/src/examples/Joints"
import { carInit } from "../../examples/src/examples/Car"
import { avianInit, avianUpdate } from "../../examples/src/examples/Avian"
import {
  platformerInit,
  platformerInput,
  platformerUpdate,
} from "../../examples/src/examples/Platformer"
import { compoundInit } from "../../examples/src/examples/Compound"
import { sensorInit } from "../../examples/src/examples/Sensor"
import { polyboxInit } from "../../examples/src/examples/Polybox"
import { exclusionsInit } from "../../examples/src/examples/Exclusions"
import { gooInit } from "../../examples/src/examples/Goo"
import { compoundJointInit } from "../../examples/src/examples/CompoundJoint"
import { noGravityInit } from "../../examples/src/examples/NoGravity"
import { car3Init } from "../../examples/src/examples/Car3"
import { car4Init, car4Update } from "../../examples/src/examples/Car4"
import {
  carInteractiveInit,
  carInteractiveInput,
  carInteractiveUpdate,
} from "../../examples/src/examples/CarInteractive"
import { marbleInit } from "../../examples/src/examples/Marble"
import { wobblyJointsInit } from "../../examples/src/examples/WobblyJoints"
import {
  teleporterInit,
  teleporterUpdate,
} from "../../examples/src/examples/Teleporter"

export type DemoInit = () => physics.World
export type DemoUpdate = (
  world: physics.World,
  collisions: physics.Collision[]
) => physics.Body | undefined
export type DemoInput = (
  world: physics.World,
  input: string,
  on: boolean
) => void

export interface Demo {
  name: string
  init: DemoInit
  update?: DemoUpdate
  input?: DemoInput
}

export const DEMOS: Demo[] = [
  { name: "Simple", init: simpleInit },
  { name: "Stacks", init: stackInit },
  { name: "Pile", init: pileInit, update: pileUpdate },
  { name: "Joints", init: jointsInit },
  { name: "Wobbly Joints", init: wobblyJointsInit },
  { name: "Car", init: carInit },
  { name: "Upset Avians", init: avianInit, update: avianUpdate },
  {
    name: "Platformer",
    init: platformerInit,
    input: platformerInput,
    update: platformerUpdate,
  },
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
  {
    name: "Car Interactive",
    init: carInteractiveInit,
    input: carInteractiveInput,
    update: carInteractiveUpdate,
  },
  { name: "Marble", init: marbleInit },
]

export type Cells = (PlayerId | null)[]
export interface GameState {
  world: physics.World
  currentDemoName: string
  focusBodyId: number
}

type GameActions = {
  selectDemo: (name: string) => void
  restart: () => void
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

export function selectDemo(demo: string, state: GameState) {
  state.currentDemoName = demo
  restart(state)
}

export function restart(state: GameState) {
  const currentDemo = DEMOS.find((d: Demo) => d.name === state.currentDemoName)
  if (currentDemo) {
    state.world = currentDemo.init()
  }
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 1,
  updatesPerSecond: 30,
  update: ({ game }) => {
    for (let i = 0; i < 3; i++) {
      const collisions = physics.worldStep(60, game.world)

      const currentDemo = DEMOS.find(
        (d: Demo) => d.name === game.currentDemoName
      )
      if (currentDemo) {
        if (currentDemo.update) {
          const body = currentDemo.update(game.world, collisions)
          if (body) {
            game.focusBodyId = body.id
          }
        }
      }
    }
  },
  reactive: false,
  setup: () => {
    const state: GameState = {
      currentDemoName: "Simple",
      world: DEMOS[0].init(),
      focusBodyId: 0,
    }

    return state
  },
  actions: {
    selectDemo: (name: string, { game }) => {
      selectDemo(name, game)
    },
    restart: (_, { game }) => {
      restart(game)
    },
  },
})
