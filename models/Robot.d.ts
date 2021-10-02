import type { GameScene } from "../scenes/GameScene";
import { MoveDirection, PlayerState } from "./shared";
export declare class Robot extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;
    scene: GameScene;
    private facing;
    private resourceCount;
    private powerMeter;
    private recoveryMeter;
    get pState(): PlayerState;
    constructor(scene: GameScene, x: number, y: number);
    setDirection(command: MoveDirection): void;
    addResource(time: number): void;
    degradePower(currentTime: number): boolean;
    chargeRecovery(currentTime: number): boolean;
    private playAnimation;
}
