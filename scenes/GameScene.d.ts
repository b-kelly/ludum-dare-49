export declare class GameScene extends Phaser.Scene {
    private robot;
    private controls;
    private world;
    private currentlyDigging;
    constructor();
    private get width();
    private get height();
    init(): void;
    preload(): void;
    create(): void;
    update(): void;
    private initDefaultControls;
    private updateChrome;
}
