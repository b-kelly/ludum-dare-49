import { Asset } from "../models/shared";

export class GameOverScene extends Phaser.Scene {
    private score = 0;
    private reason: string;
    private showTime: number;
    private startProcessingFlag = false;
    private restartFlag = false;
    private continueText: Phaser.GameObjects.Text;

    constructor() {
        super({ key: "GameOver" });
    }

    preload(): void {
        this.load.audio(Asset[Asset.Death], "assets/death.wav");
    }

    init(data: { score: number; reason: string }): void {
        this.score = data.score || 0;
        this.reason = data.reason || "";
    }

    create(): void {
        this.sound.play(Asset[Asset.Death]);
        this.cameras.main.setBackgroundColor(0x000000);
        this.add.text(
            0,
            0,
            `${this.reason}\nGame Over\nResources collected: ${this.score}`,
            {}
        );

        this.continueText = this.add
            .text(0, 0, `Press any key to continue`, {})
            .setVisible(false);

        this.input.keyboard.once("keydown", () => {
            this.restartFlag = this.startProcessingFlag;
        });
    }

    update(time: number): void {
        if (!this.showTime) {
            this.showTime = time;
            return;
        }

        // wait a bit for the player to absorb what happened
        if (time - this.showTime < 5000) {
            return;
        }

        this.startProcessingFlag = true;

        // show the continue text
        this.continueText.setVisible(true);

        if (this.restartFlag) {
            this.scene.start("Game");
        }
    }
}
