import { TILE_WIDTH } from "../config";
import type { GameScene } from "../scenes/GameScene";
import { Asset, MoveDirection, PlayerState } from "./shared";

const MAX_INSTABILITY = 100;

const _SECONDS_UNTIL_POWER_LOSS = 60;
const POWER_DEGREDATION_RATE_MS = 1000;
const MAX_POWER_LEVEL =
    (_SECONDS_UNTIL_POWER_LOSS * 1000) / POWER_DEGREDATION_RATE_MS;

/** Value between 0 and 1, where 1 completely refills the power bar */
const RESOURCE_REFILL_PERCENT = 1;

export class Robot extends Phaser.GameObjects.Sprite {
    declare body: Phaser.Physics.Arcade.Body;
    declare scene: GameScene;

    private facing: MoveDirection = MoveDirection.Stop;
    private resourceCount = 0;
    private currentPowerLevel = MAX_POWER_LEVEL;
    private lastPowerDegredationTime = -1;

    get pState(): PlayerState {
        return {
            location: this.getCenter(),
            resourceCount: this.resourceCount,
            facing: this.facing,
            instability: Math.min(MAX_INSTABILITY, this.resourceCount),
            powerPercentage: (this.currentPowerLevel / MAX_POWER_LEVEL) * 100,
        };
    }

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, Asset[Asset.Robot], 0);

        this.setOrigin(0, 0);
        scene.physics.add.existing(this);
        this.body.setBounce(0, 0);
        this.body.setCollideWorldBounds(true);
        // keep the corners from catching on other corners
        this.body.setSize(TILE_WIDTH - 2, TILE_WIDTH - 2, true);
    }

    setDirection(command: MoveDirection): void {
        const body = this.body;
        const velocity = 100;

        // update the direction
        switch (command) {
            case MoveDirection.Up:
                body.setVelocity(0, -velocity);
                break;
            case MoveDirection.Down:
                body.setVelocity(0, velocity);
                break;
            case MoveDirection.Left:
                body.setVelocity(-velocity, 0);
                break;
            case MoveDirection.Right:
                body.setVelocity(velocity, 0);
                break;
            default:
                body.setVelocity(0, 0);
        }

        if (command !== MoveDirection.Stop) {
            this.facing = command;
        }

        this.playAnimation(command);
    }

    addResource(): void {
        this.resourceCount += 1;
        // picking up a resource refills power by a certain amount
        const refillAmount = RESOURCE_REFILL_PERCENT * MAX_POWER_LEVEL;
        this.currentPowerLevel = Math.min(
            this.currentPowerLevel + refillAmount,
            MAX_POWER_LEVEL
        );
    }

    degradePower(currentTime: number): boolean {
        if (this.lastPowerDegredationTime === -1) {
            this.lastPowerDegredationTime = currentTime;
            return false;
        }

        const timeDelta = currentTime - this.lastPowerDegredationTime;
        const powerDegredation = Math.floor(
            timeDelta / POWER_DEGREDATION_RATE_MS
        );
        const powerShouldDegrade = powerDegredation > 0;

        if (powerShouldDegrade) {
            this.currentPowerLevel -= powerDegredation + this.resourceCount;
            this.lastPowerDegredationTime = currentTime;
        }

        return powerShouldDegrade;
    }

    private playAnimation(command: MoveDirection): void {
        let frame: number;
        switch (command) {
            case MoveDirection.Up:
                frame = 0;
                break;
            case MoveDirection.Right:
                frame = 1;
                break;
            case MoveDirection.Down:
                frame = 2;
                break;
            case MoveDirection.Left:
                frame = 3;
                break;
            default:
                frame = +this.frame.name;
        }

        this.setFrame(frame);
    }
}
