export declare class GameOverScene extends Phaser.Scene {
    private score;
    private reason;
    private continueText;
    private state;
    constructor();
    preload(): void;
    init(data: {
        score: number;
        reason: string;
    }): void;
    create(): void;
    update(time: number): void;
}
