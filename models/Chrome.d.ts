import { Cave } from "./Cave";
import { PlayerState, RecoveryState, SetControls } from "./shared";
declare class ChromeHandler {
    private reverseKeycodeMapping;
    private controlElements;
    displayMap(cave: Cave): void;
    displayState(controls: SetControls, recoverState: RecoveryState): void;
    updateMeters(state: PlayerState): void;
    private get;
}
export declare const Chrome: ChromeHandler;
export {};
