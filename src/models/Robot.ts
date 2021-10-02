import type { GameScene } from "../scenes/GameScene";

export enum Command {
    Stop,
    Up,
    Down,
    Left,
    Right,
}

export class Robot extends Phaser.GameObjects.Sprite {
    declare body: Phaser.Physics.Arcade.Body;
    declare scene: GameScene;

    constructor(
        scene: GameScene,
        x: number,
        y: number,
        texture: string,
        frame?: string | number
    ) {
        super(scene, x, y, texture, frame);

        this.setOrigin(0, 0);
        scene.physics.add.existing(this);
        this.body.setBounce(0, 0);

        //this.body.setCollideWorldBounds(true).setBounce(0, 0);
        // HACK: adjust the entity bounds so the corners don't collide with the walls
        //.setSize(TILE_WIDTH - 2, TILE_WIDTH - 2, true);

        //this.body.onWorldBounds = true;
    }

    setDirection(command: Command): void {
        const body = this.body;
        const velocity = 100;

        // update the direction
        switch (command) {
            case Command.Up:
                body.setVelocity(0, -velocity);
                break;
            case Command.Down:
                body.setVelocity(0, velocity);
                break;
            case Command.Left:
                body.setVelocity(-velocity, 0);
                break;
            case Command.Right:
                body.setVelocity(velocity, 0);
                break;
            default:
                body.setVelocity(0, 0);
        }

        this.playAnimation(command);
    }

    private playAnimation(command: Command): void {
        let frame: number;
        switch (command) {
            case Command.Up:
                frame = 0;
                break;
            case Command.Right:
                frame = 1;
                break;
            case Command.Down:
                frame = 2;
                break;
            case Command.Left:
                frame = 3;
                break;
            default:
                frame = +this.frame.name;
        }

        this.setFrame(frame);
    }
}
