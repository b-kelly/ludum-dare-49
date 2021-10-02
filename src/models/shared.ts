export enum Asset {
    Robot,
    Terrain,
}

export enum MoveDirection {
    Stop,
    Up,
    Down,
    Left,
    Right,
}

export interface SetControls {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    dig: Phaser.Input.Keyboard.Key;
}

export class ControlsHandler {
    set: SetControls;

    constructor(controls: SetControls) {
        this.set = controls;
    }

    scrambleAll(closeToWasd: boolean): void {
        // TODO
    }

    scrambleSingle(): void {
        // TODO
    }
}

export interface PlayerState {
    location: Phaser.Math.Vector2;
    resourceCount: number;
    facing: MoveDirection;
    instability: number;
    powerPercentage: number;
}
