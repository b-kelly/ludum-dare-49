import { TILE_WIDTH } from "../config";
import { Cave } from "../models/Cave";
import { displayMap, displayMoveControls } from "../models/Chrome";
import { Command, Robot } from "../models/Robot";
import { Asset, Controls } from "../models/shared";

export class GameScene extends Phaser.Scene {
    private robot: Robot;
    private controls: Controls;

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
        const map = this.make.tilemap({
            data: cave.toTilemap(),
            tileWidth: TILE_WIDTH,
            tileHeight: TILE_WIDTH,
        });
        const tiles = map.addTilesetImage(Asset[Asset.Terrain]);
        const layer = map.createLayer(0, tiles, 0, 0);
        layer.setCollision([0], false);
        layer.setCollisionByExclusion([0], true);

        this.physics.world.setBounds(0, 0, layer.width, layer.height);

        // draw the robot
        const startLocation = cave.startLocation;
        const startCoords = layer.tileToWorldXY(
            startLocation.x,
            startLocation.y
        );

        this.robot = new Robot(this, startCoords.x, startCoords.y);
        this.add.existing(this.robot);
        this.physics.add.collider(this.robot, layer);

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
            this.robot.setDirection(Command.Up);
        } else if (this.controls.down.isDown) {
            this.robot.setDirection(Command.Down);
        } else if (this.controls.left.isDown) {
            this.robot.setDirection(Command.Left);
        } else if (this.controls.right.isDown) {
            this.robot.setDirection(Command.Right);
        } else {
            this.robot.setDirection(Command.Stop);
        }
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
