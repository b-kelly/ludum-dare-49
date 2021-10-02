export declare class GameOverScene extends Phaser.Scene {
    private score;
    private reason;
    constructor();
    init(data: {
        score: number;
        reason: string;
    }): void;
    create(): void;
}
