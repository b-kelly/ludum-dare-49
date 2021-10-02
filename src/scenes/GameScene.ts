import { TILE_WIDTH } from "../config";
import { Cave } from "../models/Cave";
import { displayMap, displayMoveControls } from "../models/Chrome";
import { Robot } from "../models/Robot";
import { Asset, Controls, MoveDirection } from "../models/shared";
import { PlayerDeathReason, World } from "../models/World";

export class GameScene extends Phaser.Scene {
    private robot: Robot;
    private controls: Controls;
    private world: World;

    private currentlyDigging = false;

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
        displayMap(cave);

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

    update(): void {
        if (this.controls.up.isDown) {
            this.robot.setDirection(MoveDirection.Up);
        } else if (this.controls.down.isDown) {
            this.robot.setDirection(MoveDirection.Down);
        } else if (this.controls.left.isDown) {
            this.robot.setDirection(MoveDirection.Left);
        } else if (this.controls.right.isDown) {
            this.robot.setDirection(MoveDirection.Right);
        } else {
            this.robot.setDirection(MoveDirection.Stop);
        }

        if (!this.currentlyDigging && this.controls.dig.isDown) {
            const results = this.world.dig(this.robot.pState);
            console.log(results);
            if (results.playerDeathReason !== PlayerDeathReason.None) {
                // TODO
                console.log("You died!");
            }
        }

        this.currentlyDigging = this.controls.dig.isDown;
    }

    private initDefaultControls() {
        this.controls = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            dig: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.SPACE
            ),
        };
    }

    private updateChrome() {
        displayMoveControls(this.controls);
    }
}
