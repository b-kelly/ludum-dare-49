import { Cave, CellState } from "./Cave";
import { Controls } from "./shared";

export function displayMap(cave: Cave): void {
    const display = document.querySelector<HTMLCanvasElement>(".js-map");
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

let reverseKeycodeMapping: { [keycode: number]: string };

export function displayMoveControls(controls: Controls): void {
    if (!reverseKeycodeMapping) {
        reverseKeycodeMapping = {};
        Object.keys(Phaser.Input.Keyboard.KeyCodes).forEach((key) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const keycode = Phaser.Input.Keyboard.KeyCodes[key] as number;
            reverseKeycodeMapping[keycode] = key;
        });
    }

    Object.keys(controls).forEach((key: keyof Controls) => {
        const element = document.querySelector<HTMLElement>(
            `.js-move-control-${key}`
        );
        if (!element) {
            return;
        }
        element.innerText = reverseKeycodeMapping[controls[key].keyCode];
    });
}
