import { Asset } from "../models/shared";

export class GameOverScene extends Phaser.Scene {
    private score = 0;
    private reason: string;
    private continueText: Phaser.GameObjects.Text;
    private state = {
        showTime: 0,
        startProcessingFlag: false,
        restartFlag: false,
    };

    constructor() {
        super({ key: "GameOver" });
    }

    preload(): void {
        this.load.audio(Asset[Asset.Death], "assets/death.wav");
    }

    init(data: { score: number; reason: string }): void {
        this.score = data.score || 0;
        this.reason = data.reason || "";
        this.state = {
            showTime: 0,
            startProcessingFlag: false,
            restartFlag: false,
        };
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
    }

    update(time: number): void {
        if (!this.state.showTime) {
            this.state.showTime = time;
            return;
        }

        // wait a bit for the player to absorb what happened
        if (time - this.state.showTime < 5000) {
            return;
        }

        if (!this.state.startProcessingFlag) {
            this.state.startProcessingFlag = true;

            this.input.keyboard.once("keydown", () => {
                this.state.restartFlag = this.state.startProcessingFlag;
            });

            // show the continue text
            this.continueText.setVisible(true);
        }

        if (this.state.restartFlag) {
            this.scene.start("Game");
        }
    }
}
