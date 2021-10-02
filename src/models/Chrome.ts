import { Cave, CellState } from "./Cave";

export function displayMap(cave: Cave): void {
    const display = document.querySelector<HTMLCanvasElement>(".js-map");
    const map = cave.map;

    const ctx = display.getContext("2d");
    const width = 10;
    console.log(cave.startLocation);

    display.width = cave.size.width * 10;
    display.height = cave.size.height * 10;
    //ctx.scale(1 / width, 1 / width);

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
