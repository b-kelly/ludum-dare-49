import { TILE_WIDTH } from "../config";

enum TileType {
    Ground,
    Robot,
    Resource,
    Wall,
}

export class GameScene extends Phaser.Scene {
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
        this.load.image(TileType[TileType.Ground], "assets/ground.png");
        this.load.image(TileType[TileType.Robot], "assets/robot.png");
        this.load.image(TileType[TileType.Resource], "assets/resource.png");
        this.load.spritesheet(TileType[TileType.Wall], "assets/walls.png", {
            frameWidth: TILE_WIDTH,
            frameHeight: TILE_WIDTH,
        });
    }

    create(): void {
        this.physics.world.setBounds(0, 0, this.width, this.height);
        this.add
            .tileSprite(
                0,
                0,
                this.width,
                this.height,
                TileType[TileType.Ground]
            )
            .setOrigin(0);

        this.add.sprite(0, 0, TileType[TileType.Robot]);
    }

    update(): void {
        /* TODO */
    }
}
