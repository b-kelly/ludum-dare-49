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

export interface Controls {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    dig: Phaser.Input.Keyboard.Key;
}

export interface PlayerState {
    location: Phaser.Math.Vector2;
    resourceCount: number;
    facing: MoveDirection;
    instability: number;
}
