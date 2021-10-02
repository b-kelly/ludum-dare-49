import type { GameScene } from "../scenes/GameScene";
import { MoveDirection, PlayerState } from "./shared";
export declare class Robot extends Phaser.GameObjects.Sprite {
    body: Phaser.Physics.Arcade.Body;
    scene: GameScene;
    private facing;
    private resourceCount;
    private recoveriesUsed;
    private instabilities;
    private powerMeter;
    private recoveryMeter;
    get pState(): PlayerState;
    private get totalInstability();
    constructor(scene: GameScene, x: number, y: number);
    setDirection(command: MoveDirection): void;
    addResource(time: number): void;
    addInstability(): void;
    degradePower(currentTime: number): boolean;
    chargeRecovery(currentTime: number): boolean;
    expendRecovery(): void;
    private playAnimation;
}
