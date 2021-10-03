export declare class GameScene extends Phaser.Scene {
    private robot;
    private controls;
    private recoveryKey;
    private world;
    private currentlyDigging;
    private lastPowerInstabilityPercentage;
    private recoveryState;
    private messageQueue;
    private flags;
    constructor();
    private get width();
    private get height();
    init(): void;
    preload(): void;
    create(): void;
    update(time: number): void;
    private updateHandleControls;
    private updateHandleRobotState;
    private updateHandleChrome;
    private handleDig;
    private triggerInstability;
    private getPowerDegredationDiff;
    private triggerRecovery;
    private handleRobotDeath;
    private updateResourceDetector;
    private displayMessage;
    private setFlag;
}
