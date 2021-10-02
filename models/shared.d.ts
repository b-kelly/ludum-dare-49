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
}
