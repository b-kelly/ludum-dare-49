import { Cave, CellState } from "./Cave";
import {
    PlayerState,
    RecoveryState,
    RECOVERY_KEY,
    ridx,
    SetControls,
} from "./shared";
import { ResourceSearchResults } from "./World";

export enum MessageType {
    None,
    Collapse,
    PowerDegraded,
    SmallScramble,
    LargeScramble,
    RecoveryAvailable,
    Recovered,
    ResourceAcquired,
    DifficultyRaised,
}

const MESSAGES: Record<MessageType, string[]> = {
    [MessageType.None]: [],
    [MessageType.Collapse]: [
        "Watch out for falling rocks!",
        "Yikes! That one almost got me.",
        "Assessing damages... None.",
        "Cave in!",
    ],
    [MessageType.PowerDegraded]: [
        "Battery starting to run low...",
        "Oof. Getting tired over here.",
        "I could use some juice.",
        "Think you could steer me towards an outlet?",
    ],
    [MessageType.SmallScramble]: [
        "BzzZzt! Rerouting movement to auxillary control...",
        "[SHORT CIRCUIT DETECTED]",
        "*Zap* Rerouting controls to backup...",
        "Just lost another control. Getting you back online now.",
    ],
    [MessageType.LargeScramble]: [
        "*POP* Do you smell smoke?",
        "AH! MY HARDWARE IS ON FIRE!",
        "oU4LygiU2p*N. rQ%!6EKvTZTi?",
        "BzzzZZZzzZzzZtTt. Oh goodness, that can't be good.",
    ],
    [MessageType.RecoveryAvailable]: [
        "Ready to execute self diagnostics!",
        "[STABILITY PROTOCOL ONLINE]",
        "Let's get me all fixed up.",
    ],
    [MessageType.Recovered]: [
        "[ALL SYSTEMS NOMINAL]",
        "Got it! I'm back to full functionality.",
    ],
    [MessageType.ResourceAcquired]: [
        "Oooh, shiny!",
        "I found a new resource!",
        "Battery levels rising.",
        "I wonder what this is worth...",
    ],
    [MessageType.DifficultyRaised]: [
        "Uh oh, it's starting to get a bit shaky in here.",
        "Maybe we should think about high-tailing it out of here?",
        "Do we have an exit plan?",
        "I'm getting a bit unstable here.",
        "Is it just me, or does this whole place look like it's about to fall apart?",
        "I don't know how much longer my circuits can take this...",
    ],
};

const MESSAGE_TIMEOUT_MS = 5000;

class ChromeHandler {
    private reverseKeycodeMapping: { [keycode: number]: string };
    private controlElements: { [key: string]: HTMLElement } = {};
    private messageTimeoutId: number;

    displayMap(cave: Cave): void {
        const display = this.get<HTMLCanvasElement>(".js-map");
        display.classList.remove("hide-debug");
        const map = cave.map;

        const ctx = display.getContext("2d");
        const width = 10;
        const scale = 1; // increase this to make the display physically larger, scaling the canvas view to match
        const ctxScale = (1 / width) * scale;

        display.width = cave.size.width * scale;
        display.height = cave.size.height * scale;
        ctx.scale(ctxScale, ctxScale);

        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[i].length; j++) {
                const cell = map[i][j];
                switch (cell) {
                    case CellState.Open:
                        ctx.fillStyle = "white";
                        break;
                    case CellState.Wall:
                        ctx.fillStyle = "grey";
                        break;
                    case CellState.Resource:
                        ctx.fillStyle = "red";
                        break;
                    default:
                        ctx.fillStyle = "black";
                }

                ctx.fillRect(i * width, j * width, width, width);
            }
        }

        // draw the player start pos
        ctx.fillStyle = "green";
        const playerWidth = width / 2; // show some of the square behind the player for debugging
        ctx.fillRect(
            cave.startLocation.x * width + playerWidth / 2,
            cave.startLocation.y * width + playerWidth / 2,
            playerWidth,
            playerWidth
        );
    }

    displayState(controls: SetControls, recoverState: RecoveryState): void {
        if (!this.reverseKeycodeMapping) {
            this.reverseKeycodeMapping = {};
            Object.keys(Phaser.Input.Keyboard.KeyCodes).forEach((key) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const keycode = Phaser.Input.Keyboard.KeyCodes[key] as number;
                this.reverseKeycodeMapping[keycode] = key;
            });
        }

        Object.keys(controls).forEach((control: keyof SetControls) => {
            const element = this.get(`.js-move-control-${control}`);
            if (!element) {
                return;
            }

            const keyName =
                this.reverseKeycodeMapping[controls[control].keyCode];
            element.innerText = keyName;
        });

        let recoverText: string;
        switch (recoverState) {
            case RecoveryState.Available:
                recoverText = `Press ${this.reverseKeycodeMapping[RECOVERY_KEY]} to activate!`;
                break;
            default:
                recoverText = "Charging...";
        }

        this.get(".js-recover-state").innerText = recoverText;
    }

    updateMeters(state: PlayerState) {
        const update = (selector: string, value: number) => {
            const el = this.get(selector);
            el.style.setProperty("--percent-filled", `${Math.max(0, value)}%`);
            el.classList.toggle("meter--charged", value >= 100);
        };

        update(".js-power-meter", state.powerPercentage);
        update(".js-recover-meter", state.recoveryPercentage);
        update(".js-instability-meter", state.totalInstabilityPercentage);
    }

    showMessages(types: MessageType[]) {
        types.forEach((type) => {
            this.appendMessage(type);
        });

        // if the message is already showing, clear the timeout so we can extend it
        if (this.messageTimeoutId > -1) {
            window.clearTimeout(this.messageTimeoutId);
        }

        this.messageTimeoutId = window.setTimeout(
            () => this.hideMessage(),
            MESSAGE_TIMEOUT_MS
        );
    }

    hideMessage() {
        window.clearTimeout(this.messageTimeoutId);
        this.messageTimeoutId = -1;
        this.get(".js-message-box").classList.add("message-box--empty");
        this.get(".js-message").innerText = "";
    }

    updateResourceDetector(results: ResourceSearchResults) {
        const direction = results.direction;
        const classes = [];

        if (direction) {
            if (direction.y < 0) {
                classes.push("n");
            } else if (direction.y > 0) {
                classes.push("s");
            }

            if (direction.x > 0) {
                classes.push("e");
            } else if (direction.x < 0) {
                classes.push("w");
            }

            if (!results.isNear) {
                classes.push("far");
            }
        }

        if (!classes.length) {
            classes.push("none");
        }

        const baseClass = "resource-direction";

        const el = this.get(".js-resource-direction");
        el.className = baseClass;
        classes.forEach((c) => el.classList.add(`${baseClass}--${c}`));
    }

    private appendMessage(type: MessageType) {
        const messages = MESSAGES[type] ?? [];

        if (!messages.length) {
            return;
        }
        let message = "";
        message += messages[ridx(messages.length)] + "\n\n";
        this.get(".js-message-box").classList.remove("message-box--empty");
        const el = this.get(".js-message");
        el.innerText = el.innerText + message;
        el.scrollTo(0, el.scrollHeight);
    }

    private get<T extends HTMLElement = HTMLElement>(selector: string): T {
        if (selector in this.controlElements) {
            return this.controlElements[selector] as T;
        }

        const element = document.querySelector<T>(selector);
        this.controlElements[selector] = element;
        return element;
    }
}

export const Chrome = new ChromeHandler();
