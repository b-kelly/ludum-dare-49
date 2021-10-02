export class GameOverScene extends Phaser.Scene {
    private score = 0;
    private reason: string;

    constructor() {
        super({ key: "GameOver" });
    }

    init(data: { score: number; reason: string }): void {
        this.score = data.score || 0;
        this.reason = data.reason || "";
    }

    create(): void {
        this.cameras.main.setBackgroundColor(0x000000);
        this.add.text(
            0,
            0,
            `${this.reason}\nGame Over\nResources collected: ${this.score}`,
            {}
        );
    }
}
