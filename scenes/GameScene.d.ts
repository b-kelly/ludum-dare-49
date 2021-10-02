export declare class GameScene extends Phaser.Scene {
    private robot;
    private controls;
    private world;
    private currentlyDigging;
    private lastPowerInstabilityPercentage;
    constructor();
    private get width();
    private get height();
    init(): void;
    preload(): void;
    create(): void;
    update(time: number): void;
    private updateHandleControls;
    private updateHandleRobotState;
    private handleDig;
    private triggerInstability;
    private getPowerDegredationDiff;
    private triggerRecovery;
    private handleRobotDeath;
    private updateChrome;
}
