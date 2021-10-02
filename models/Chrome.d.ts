import { Cave } from "./Cave";
import { PlayerState, SetControls } from "./shared";
declare class ChromeHandler {
    private reverseKeycodeMapping;
    private controlElements;
    displayMap(cave: Cave): void;
    displayMoveControls(controls: SetControls): void;
    updateMeters(state: PlayerState): void;
    private get;
}
export declare const Chrome: ChromeHandler;
export {};
