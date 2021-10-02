import { TILE_WIDTH } from "../config";
import type { GameScene } from "../scenes/GameScene";
import { Asset, MoveDirection, PlayerState } from "./shared";

export class Robot extends Phaser.GameObjects.Sprite {
    declare body: Phaser.Physics.Arcade.Body;
    declare scene: GameScene;

    private facing: MoveDirection = MoveDirection.Stop;

    get pState(): PlayerState {
        return {
            location: this.getCenter(),
            resourceCount: 0,
            facing: this.facing,
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
