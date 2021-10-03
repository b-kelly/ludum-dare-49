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
    Recovered,
}

const MESSAGES: Record<MessageType, string[]> = {
    [MessageType.None]: [],
    [MessageType.Collapse]: ["Collapse!"],
    [MessageType.PowerDegraded]: ["Short circuit!"],
    [MessageType.SmallScramble]: ["Small scramble"],
    [MessageType.LargeScramble]: ["Large scramble"],
    [MessageType.Recovered]: ["Recovered!"],
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
        let el = this.get(".js-power-meter");
        el.style.setProperty(
            "--percent-filled",
            `${Math.max(0, state.powerPercentage)}%`
        );

        el = this.get(".js-recover-meter");
        el.style.setProperty(
            "--percent-filled",
            `${Math.max(0, state.recoveryPercentage)}%`
        );
        el.parentElement.classList.toggle(
            "meter--charged",
            state.recoveryPercentage >= 100
        );

        el = this.get(".js-instability-meter");
        el.style.setProperty(
            "--percent-filled",
            `${Math.max(0, state.totalInstabilityPercentage)}%`
        );
        el.parentElement.classList.toggle(
            "meter--charged",
            state.totalInstabilityPercentage >= 100
        );
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
        message += messages[ridx(messages.length)] + "\n";
        const el = this.get(".js-message");
        el.innerText = el.innerText + message;
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
