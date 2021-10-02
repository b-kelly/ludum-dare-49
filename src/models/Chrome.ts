import { Cave, CellState } from "./Cave";

export function displayMap(cave: Cave): void {
    const display = document.querySelector<HTMLCanvasElement>(".js-map");
    const map = cave.map;

    const ctx = display.getContext("2d");
    const width = 10;
    const scale = 10; // tweak this to make the display physically larger, scaling the canvas view to match
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

            ctx.fillRect(j * width, i * width, width, width);
        }
    }

    // draw the player start pos
    ctx.fillStyle = "green";
    ctx.fillRect(
        cave.startLocation.x * width,
        cave.startLocation.y * width,
        width,
        width
    );
}
