import { GameOverScene } from "./scenes/GameOverScene";
import { GameScene } from "./scenes/GameScene";

export const TILE_WIDTH = 32;

export const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "Sample",

    type: Phaser.AUTO,

    pixelArt: true,

    scale: {
        width: 512,
        height: 512,
        mode: Phaser.Scale.NONE,
    },

    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },

    parent: "js-game-container",
    backgroundColor: "#1f1f29",
    autoFocus: true,
    scene: [GameScene, GameOverScene],
};
