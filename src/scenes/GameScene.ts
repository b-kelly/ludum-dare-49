import { TILE_WIDTH } from "../config";
import { Cave } from "../models/Cave";
import { Chrome } from "../models/Chrome";
import { Robot } from "../models/Robot";
import {
    Asset,
    ControlsHandler,
    MoveDirection,
    PlayerState,
    SetControls,
} from "../models/shared";
import { DigResults, PlayerDeathReason, World } from "../models/World";

enum InstabilityType {
    None,
    Collapse,
    PowerDegredation,
}

/** Value between 0 and 100; percent points between power instability triggers */
const PERCENT_POWER_INSTABILITY_THRESHOLD = 10;

export class GameScene extends Phaser.Scene {
    private robot: Robot;
    private controls: ControlsHandler;
    private world: World;

    private currentlyDigging = false;
    private lastPowerInstabilityPercentage = 0;

    constructor() {
        super({ key: "Game" });
    }

    private get width() {
        return this.physics.world.bounds.width;
    }
    private get height() {
        return this.physics.world.bounds.height;
    }

    init(): void {
        // TODO
    }

    preload(): void {
        this.load.spritesheet(Asset[Asset.Robot], "assets/robot.png", {
            frameWidth: TILE_WIDTH,
            frameHeight: TILE_WIDTH,
        });
        this.load.spritesheet(Asset[Asset.Terrain], "assets/terrain.png", {
            frameWidth: TILE_WIDTH,
            frameHeight: TILE_WIDTH,
        });
    }

    create(): void {
        // TODO yeah, this is creating a cave that is roughly ((width * height) * TILE_WIDTH^2) in size...
        const cave = new Cave(this.width, this.height);
        Chrome.displayMap(cave);

        this.initDefaultControls();
        this.updateChrome();

        // create the tilemap
        this.world = new World(this, cave);

        this.physics.world.setBounds(
            0,
            0,
            this.world.widthInPixels,
            this.world.heightInPixels
        );

        // draw the robot
        const startLocation = cave.startLocation;
        const startCoords = this.world.tileToWorldXY(
            startLocation.x,
            startLocation.y
        );

        this.robot = new Robot(this, startCoords.x, startCoords.y);
        this.add.existing(this.robot);
        this.physics.add.collider(this.robot, this.world.primaryLayer);

        // set up the camera
        const camera = this.cameras.main;
        //camera.setBounds(0, 0, this.width, this.height);
        camera.centerOn(this.robot.x, this.robot.y);
        camera.startFollow(
            this.robot,
            false,
            1,
            1,
            TILE_WIDTH / 2,
            TILE_WIDTH / 2
        );
    }

    update(time: number): void {
        this.updateHandleRobotState(time);
        this.updateHandleControls();
    }

    private updateHandleControls() {
        if (this.controls.set.up.isDown) {
            this.robot.setDirection(MoveDirection.Up);
        } else if (this.controls.set.down.isDown) {
            this.robot.setDirection(MoveDirection.Down);
        } else if (this.controls.set.left.isDown) {
            this.robot.setDirection(MoveDirection.Left);
        } else if (this.controls.set.right.isDown) {
            this.robot.setDirection(MoveDirection.Right);
        } else {
            this.robot.setDirection(MoveDirection.Stop);
        }

        if (!this.currentlyDigging && this.controls.set.dig.isDown) {
            const digResults = this.world.dig(this.robot.pState);
            this.handleDig(digResults);
        }

        this.currentlyDigging = this.controls.set.dig.isDown;
    }

    private updateHandleRobotState(time: number) {
        const degraded = this.robot.degradePower(time);
        if (degraded) {
            const state = this.robot.pState;
            Chrome.updatePowerMeter(state.powerPercentage);

            if (state.powerPercentage <= 0) {
                this.handleRobotDeath(PlayerDeathReason.NoPower);
            } else {
                this.triggerInstability(
                    InstabilityType.PowerDegredation,
                    null,
                    state
                );
            }
        }
    }

    private handleDig(digResults: DigResults) {
        if (digResults?.playerDeathReason !== PlayerDeathReason.None) {
            this.handleRobotDeath(digResults.playerDeathReason);
            return;
        }

        if (digResults.collectedResource) {
            this.robot.addResource();
            Chrome.updatePowerMeter(this.robot.pState.powerPercentage);
        }

        if (digResults.triggeredCollapse) {
            this.triggerInstability(InstabilityType.Collapse, digResults);
        }
    }

    private triggerInstability(
        type: InstabilityType,
        digResults?: DigResults,
        state?: PlayerState
    ) {
        if (type === InstabilityType.None) {
            return;
        }

        if (type === InstabilityType.Collapse) {
            // scramble all controls; if player collected a resource, then scramble close to wasd
            this.controls.scrambleAll(digResults?.triggeredCollapse ?? false);
        } else if (type === InstabilityType.PowerDegredation) {
            const powerPercent = state?.powerPercentage ?? 0;
            if (this.lastPowerInstabilityPercentage <= 0) {
                this.lastPowerInstabilityPercentage = powerPercent;
            } else {
                const lastValue = Math.floor(
                    this.lastPowerInstabilityPercentage /
                        PERCENT_POWER_INSTABILITY_THRESHOLD
                );
                const currValue = Math.floor(
                    powerPercent / PERCENT_POWER_INSTABILITY_THRESHOLD
                );
                const diff = Math.abs(lastValue - currValue);

                // we've hit the percent threshold, so cause some havoc
                if (diff > 0) {
                    console.log(
                        `Causing instability due to power loss; ${diff} times`
                    );
                    // for every PERCENT_POWER_INSTABILITY_THRESHOLD% of power, scramble one control
                    for (let i = 0; i < diff; i++) {
                        this.controls.scrambleSingle();
                    }

                    this.lastPowerInstabilityPercentage = powerPercent;
                }
            }
        }
    }

    private handleRobotDeath(reason: PlayerDeathReason) {
        this.scene.start("GameOver", {
            reason: PlayerDeathReason[reason],
            score: this.robot.pState.resourceCount,
        });
    }

    private initDefaultControls() {
        const controls: SetControls = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            dig: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.SPACE
            ),
        };
        this.controls = new ControlsHandler(controls);
    }

    private updateChrome() {
        Chrome.displayMoveControls(this.controls.set);
    }
}
