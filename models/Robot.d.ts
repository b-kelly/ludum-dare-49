import type { GameScene } from "../scenes/GameScene";
export declare enum Command {
    Stop = 0,
    Up = 1,
    Down = 2,
    Left = 3,
    Right = 4
}
export declare class Robot extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;
    scene: GameScene;
    constructor(scene: GameScene, x: number, y: number, texture: string, frame?: string | number);
    setDirection(command: Command): void;
    private playAnimation;
}
