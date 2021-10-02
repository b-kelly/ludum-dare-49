import type { GameScene } from "../scenes/GameScene";
import { MoveDirection, PlayerState } from "./shared";
export declare class Robot extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;
    scene: GameScene;
    private facing;
    get pState(): PlayerState;
    constructor(scene: GameScene, x: number, y: number);
    setDirection(command: MoveDirection): void;
    private playAnimation;
}
