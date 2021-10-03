import { TILE_WIDTH } from "../config";
import type { GameScene } from "../scenes/GameScene";
import { Asset, MoveDirection, PlayerState } from "./shared";

const POWER_DEGREDATION_S = 120;
const POWER_DEGREDATION_RATE_MS = 1000;

const RECOVERY_DEGREDATION_S = 60;
const RECOVERY_DEGREDATION_RATE_MS = 1000;

/** Value between 0 and 1, where 1 completely refills the power bar */
const RESOURCE_REFILL_PERCENT = 1;

/** Value of total instability when the game switches to difficult */
const TOTAL_INSTABILITY_DIFFICULTY_THRESHOLD = 20;

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
        const degredationAmount = Math.floor(
            timeDelta / POWER_DEGREDATION_RATE_MS
        );
        const newValue = Math.max(
            this._value - degredationAmount - modifier,
            0
        );
        const meterShouldDegrade =
            degredationAmount > 0 && newValue !== this._value;

        if (meterShouldDegrade) {
            this.update(newValue, currentTime);
        }

        return meterShouldDegrade;
    }
}

export class Robot extends Phaser.GameObjects.Sprite {
    declare body: Phaser.Physics.Arcade.Body;
    declare scene: GameScene;

    private facing: MoveDirection = MoveDirection.Stop;
    private resourceCount = 0;
    private recoveriesUsed = 0;
    private instabilities = 0;

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
            totalInstabilityPercentage:
                (this.totalInstability /
                    TOTAL_INSTABILITY_DIFFICULTY_THRESHOLD) *
                100,
            isDifficult:
                this.totalInstability >= TOTAL_INSTABILITY_DIFFICULTY_THRESHOLD,
        };
    }

    private get totalInstability(): number {
        return this.resourceCount + this.recoveriesUsed + this.instabilities;
    }

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, Asset[Asset.Robot], 0);

        this.setOrigin(0, 0);
        scene.physics.add.existing(this);
        this.body.setBounce(0, 0);
        this.body.setCollideWorldBounds(true);
        // keep the corners from catching on other corners
        this.body.setSize(TILE_WIDTH - 4, TILE_WIDTH - 4, true);
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

    addInstability(): void {
        this.instabilities = Math.min(
            this.instabilities + 1,
            TOTAL_INSTABILITY_DIFFICULTY_THRESHOLD
        );
    }

    degradePower(currentTime: number): boolean {
        return this.powerMeter.degrade(
            currentTime,
            Math.floor(this.resourceCount / 2)
        );
    }

    chargeRecovery(currentTime: number): boolean {
        return this.recoveryMeter.degrade(currentTime);
    }

    expendRecovery(): void {
        this.recoveryMeter.update(this.recoveryMeter.maxValue, -1);
        this.recoveriesUsed += 1;
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
