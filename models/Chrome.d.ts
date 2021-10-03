import { Cave } from "./Cave";
import { PlayerState, RecoveryState, SetControls } from "./shared";
import { ResourceSearchResults } from "./World";
export declare enum MessageType {
    None = 0,
    Collapse = 1,
    PowerDegraded = 2,
    SmallScramble = 3,
    LargeScramble = 4,
    Recovered = 5
}
declare class ChromeHandler {
    private reverseKeycodeMapping;
    private controlElements;
    private messageTimeoutId;
    displayMap(cave: Cave): void;
    displayState(controls: SetControls, recoverState: RecoveryState): void;
    updateMeters(state: PlayerState): void;
    showMessages(types: MessageType[]): void;
    hideMessage(): void;
    updateResourceDetector(results: ResourceSearchResults): void;
    private appendMessage;
    private get;
}
export declare const Chrome: ChromeHandler;
export {};
