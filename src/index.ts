import "./index.css";
import * as Phaser from "phaser";
import { gameConfig } from "./config";
import { Cave } from "./models/Cave";
import { displayMap } from "./models/Chrome";

export const game = new Phaser.Game(gameConfig);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
global.instance = game;

// TODO DEBUG
const cave = new Cave(512, 512);
displayMap(cave);
