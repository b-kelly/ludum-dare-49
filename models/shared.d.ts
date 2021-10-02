export declare enum Asset {
    Robot = 0,
    Terrain = 1
}
export declare enum MoveDirection {
    Stop = 0,
    Up = 1,
    Down = 2,
    Left = 3,
    Right = 4
}
export interface SetControls {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    dig: Phaser.Input.Keyboard.Key;
}
export declare class ControlsHandler {
    scene: Phaser.Scene;
    set: SetControls;
    constructor(scene: Phaser.Scene);
    scrambleAll(closeToWasd: boolean): void;
    scrambleSingle(closeToWasd?: boolean, control?: keyof SetControls): void;
    revertToDefault(): void;
    private getRandomControl;
    /** Gets a random letter key on the keyboard */
    private getRandomKey;
    /** Gets a random key near the wasd cluster */
    private getRandomClusterKey;
    private keyCurrentlyInUse;
    private registerKey;
    private isValidKey;
}
export interface PlayerState {
    location: Phaser.Math.Vector2;
    resourceCount: number;
    facing: MoveDirection;
    powerPercentage: number;
    recoveryPercentage: number;
}
