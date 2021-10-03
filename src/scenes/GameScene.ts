import { TILE_WIDTH } from "../config";
import { Cave } from "../models/Cave";
import { Chrome, MessageType } from "../models/Chrome";
import { Robot } from "../models/Robot";
import {
    Asset,
    ControlsHandler,
    MoveDirection,
    PlayerState,
    RecoveryState,
    RECOVERY_KEY,
} from "../models/shared";
import {
    DigResults,
    PlayerDeathReason,
    ResourceSearchResults,
    World,
} from "../models/World";

enum InstabilityType {
    None,
    Collapse,
    PowerDegredation,
}

/** Value between 0 and 100; percent points between power instability triggers */
const PERCENT_POWER_INSTABILITY_THRESHOLD = 20;

export class GameScene extends Phaser.Scene {
    private robot: Robot;
    private controls: ControlsHandler;
    private recoveryKey: Phaser.Input.Keyboard.Key;
    private world: World;

    private currentlyDigging = false;
    private lastPowerInstabilityPercentage = 0;
    private recoveryState = RecoveryState.None;
    private messageQueue: MessageType[] = [];
    private flags = {
        updateUi: false,
        showedDifficultyIncreaseWarning: false,
    };

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
        this.currentlyDigging = false;
        this.lastPowerInstabilityPercentage = 0;
        this.recoveryState = RecoveryState.None;
        this.messageQueue = [];
        this.flags = {
            updateUi: false,
            showedDifficultyIncreaseWarning: false,
        };
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
        this.load.audio(Asset[Asset.Collapse], "assets/collapse.wav");
        this.load.audio(
            Asset[Asset.PowerDegraded],
            "assets/power-degraded.wav"
        );
        this.load.audio(
            Asset[Asset.SmallScramble],
            "assets/small-scramble.wav"
        );
        this.load.audio(
            Asset[Asset.LargeScramble],
            "assets/large-scramble.wav"
        );
        this.load.audio(
            Asset[Asset.RecoveryAvailable],
            "assets/recovery-available.wav"
        );
        this.load.audio(Asset[Asset.Recovered], "assets/recovered.wav");
        this.load.audio(
            Asset[Asset.ResourceAcquired],
            "assets/resource-acquired.wav"
        );
        this.load.audio(Asset[Asset.Dig], "assets/dig.wav");
        this.load.audio(
            Asset[Asset.DifficultyRaised],
            "assets/difficulty-raised.wav"
        );
    }

    create(): void {
        // TODO yeah, this is creating a cave that is roughly ((width * height) * TILE_WIDTH^2) in size...
        const cave = new Cave(this.width, this.height);
        //Chrome.displayMap(cave); // DEBUG

        this.controls = new ControlsHandler(this);
        this.recoveryKey = this.input.keyboard.addKey(RECOVERY_KEY);
        this.setFlag("updateUi");

        this.recoveryKey.addListener("down", () => {
            this.triggerRecovery();
        });

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
        this.updateHandleControls(time);
        this.updateHandleChrome();
    }

    private updateHandleControls(time: number) {
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
            this.sound.play(Asset[Asset.Dig]);
            const digResults = this.world.dig(this.robot.pState);
            this.handleDig(digResults, time);
        }

        this.currentlyDigging = this.controls.set.dig.isDown;
    }

    private updateHandleRobotState(time: number) {
        const degraded = this.robot.degradePower(time);
        const charged = this.robot.chargeRecovery(time);

        const state = this.robot.pState;

        if (degraded) {
            if (state.powerPercentage <= 0) {
                this.handleRobotDeath(PlayerDeathReason.NoPower);
            } else {
                this.triggerInstability(
                    InstabilityType.PowerDegredation,
                    state
                );
            }
        }

        if (charged && state.recoveryPercentage >= 100) {
            this.recoveryState = RecoveryState.Available;
            this.displayMessage(MessageType.RecoveryAvailable);
        }

        if (degraded || charged) {
            Chrome.updateMeters(state);
        }
    }

    private updateHandleChrome() {
        if (this.flags.updateUi) {
            this.setFlag("updateUi", false);
            Chrome.displayState(this.controls.set, this.recoveryState);
        }

        const state = this.robot.pState;
        if (state.isDifficult && !this.flags.showedDifficultyIncreaseWarning) {
            this.displayMessage(MessageType.DifficultyRaised);
            this.setFlag("showedDifficultyIncreaseWarning", true);
        }

        const direction = this.world.getClosestResourceDirection(
            this.robot.getCenter()
        );
        this.updateResourceDetector(direction);

        if (this.messageQueue.length > 0) {
            Chrome.showMessages(this.messageQueue);
            this.messageQueue = [];
        }
    }

    private handleDig(digResults: DigResults, time: number) {
        if (digResults?.playerDeathReason !== PlayerDeathReason.None) {
            this.handleRobotDeath(digResults.playerDeathReason);
            return;
        }

        const state = this.robot.pState;

        // trigger the collapse first, so we can unscramble controls afterwards if a resource was gathered
        if (digResults.triggeredCollapse) {
            this.triggerInstability(
                InstabilityType.Collapse,
                state,
                digResults
            );
        }

        if (digResults.collectedResource) {
            this.robot.addResource(time);
            this.controls.revertToDefault();
            Chrome.updateMeters(state);
            this.displayMessage(MessageType.ResourceAcquired);
        }
    }

    private triggerInstability(
        type: InstabilityType,
        state: PlayerState,
        digResults?: DigResults
    ) {
        if (type === InstabilityType.None) {
            return;
        }

        const isDifficult = state.isDifficult;

        if (type === InstabilityType.Collapse) {
            this.robot.addInstability();
            this.displayMessage(MessageType.Collapse);
            if (isDifficult) {
                // scramble all controls; if player collected a resource, then scramble close to wasd
                this.controls.scrambleAll(
                    digResults?.triggeredCollapse ?? false
                );
                this.displayMessage(MessageType.LargeScramble);
            }
        } else if (type === InstabilityType.PowerDegredation) {
            const diff = this.getPowerDegredationDiff(state.powerPercentage);
            // we've hit the percent threshold, so cause some havoc
            if (diff > 0) {
                this.robot.addInstability();
                this.displayMessage(MessageType.PowerDegraded);
                // for every PERCENT_POWER_INSTABILITY_THRESHOLD% of power, scramble one control
                for (let i = 0; i < diff; i++) {
                    this.controls.scrambleSingle(isDifficult);
                    this.displayMessage(MessageType.SmallScramble);
                }

                this.lastPowerInstabilityPercentage = state.powerPercentage;
            }
        }

        this.setFlag("updateUi");
    }

    private getPowerDegredationDiff(currentPercentage: number) {
        if (this.lastPowerInstabilityPercentage <= 0) {
            this.lastPowerInstabilityPercentage = currentPercentage;
            return 0;
        } else {
            const lastValue = Math.floor(
                this.lastPowerInstabilityPercentage /
                    PERCENT_POWER_INSTABILITY_THRESHOLD
            );
            const currValue = Math.floor(
                currentPercentage / PERCENT_POWER_INSTABILITY_THRESHOLD
            );
            const diff = Math.abs(lastValue - currValue);

            return diff;
        }
    }

    private triggerRecovery() {
        if (this.recoveryState === RecoveryState.Available) {
            // trigger the recovery
            this.controls.revertToDefault();
            this.robot.expendRecovery();
            this.displayMessage(MessageType.Recovered);
            this.recoveryState = RecoveryState.None;
        }

        this.setFlag("updateUi");
    }

    private handleRobotDeath(reason: PlayerDeathReason) {
        this.scene.start("GameOver", {
            reason: PlayerDeathReason[reason],
            score: this.robot.pState.resourceCount,
        });
    }

    private updateResourceDetector(result: ResourceSearchResults): void {
        if (!result.updated) {
            return;
        }

        Chrome.updateResourceDetector(result);
    }

    private displayMessage(type: MessageType) {
        this.sound.play(MessageType[type]);
        this.messageQueue.push(type);
    }

    private setFlag(flag: keyof GameScene["flags"], value = true) {
        this.flags[flag] = value;
    }
}
