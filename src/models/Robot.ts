import { TILE_WIDTH } from "../config";
import type { GameScene } from "../scenes/GameScene";
import { Asset, MoveDirection, PlayerState } from "./shared";

const POWER_DEGREDATION_S = 60;
const POWER_DEGREDATION_RATE_MS = 1000;

const RECOVERY_DEGREDATION_S = 30;
const RECOVERY_DEGREDATION_RATE_MS = 1000;

/** Value between 0 and 1, where 1 completely refills the power bar */
const RESOURCE_REFILL_PERCENT = 1;

class Meter {
    lastUpdateTime = -1;

    secondsUntilZero: number;
    degredationRateMs: number;

    private _maxValue: number = null;
    get maxValue() {
        return (
            this._maxValue ??
            (this.secondsUntilZero * 1000) / this.degredationRateMs
        );
    }

    private _value = 0;
    get value() {
        return this._value;
    }

    get percent() {
        return (this._value / this.maxValue) * 100;
    }

    constructor(secondsUntilZero: number, degredationRateMs: number) {
        this.secondsUntilZero = secondsUntilZero;
        this.degredationRateMs = degredationRateMs;
        this._value = this.maxValue;
    }

    update(value: number, time: number) {
        this._value = value;
        this.lastUpdateTime = time;
    }

    refill(amount: number, time: number) {
        this._value = Math.min(this.maxValue, this._value + amount);
        this.lastUpdateTime = time;
    }

    degrade(currentTime: number, modifier = 0) {
        if (this.lastUpdateTime === -1) {
            this.lastUpdateTime = currentTime;
            return false;
        }

        const timeDelta = currentTime - this.lastUpdateTime;
        const powerDegredation = Math.floor(
            timeDelta / POWER_DEGREDATION_RATE_MS
        );
        const powerShouldDegrade = powerDegredation > 0;

        if (powerShouldDegrade) {
            const newPowerLevel = this._value - powerDegredation - modifier;
            this.update(Math.max(newPowerLevel, 0), currentTime);
        }

        return powerShouldDegrade;
    }
}

export class Robot extends Phaser.GameObjects.Sprite {
    declare body: Phaser.Physics.Arcade.Body;
    declare scene: GameScene;

    private facing: MoveDirection = MoveDirection.Stop;
    private resourceCount = 0;

    private powerMeter = new Meter(
        POWER_DEGREDATION_S,
        POWER_DEGREDATION_RATE_MS
    );

    private recoveryMeter = new Meter(
        RECOVERY_DEGREDATION_S,
        RECOVERY_DEGREDATION_RATE_MS
    );

    get pState(): PlayerState {
        return {
            location: this.getCenter(),
            resourceCount: this.resourceCount,
            facing: this.facing,
            powerPercentage: this.powerMeter.percent,
            recoveryPercentage: 100 - this.recoveryMeter.percent,
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

    addResource(time: number): void {
        this.resourceCount += 1;
        // picking up a resource refills power by a certain amount
        const refillAmount = RESOURCE_REFILL_PERCENT * this.powerMeter.maxValue;
        this.powerMeter.refill(refillAmount, time);
    }

    degradePower(currentTime: number): boolean {
        return this.powerMeter.degrade(currentTime, this.resourceCount);
    }

    chargeRecovery(currentTime: number): boolean {
        return this.recoveryMeter.degrade(currentTime, this.resourceCount);
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
