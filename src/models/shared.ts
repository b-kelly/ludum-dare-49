export enum Asset {
    Robot,
    Terrain,
}

export enum MoveDirection {
    Stop,
    Up,
    Down,
    Left,
    Right,
}

export interface SetControls {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    dig: Phaser.Input.Keyboard.Key;
}

const VALID_KEYCODE_RANGES = {
    Alpha: [65, 90],
    Numeric: [48, 57],
    Numpad: [96, 105],
    Space: [32, 32],
    Arrow: [37, 40],
    Symbols: [186, 222],
};

/**
 * Valid keys around the US keyboard wasd cluster
 * qwer
 * asdf
 * zxcv
 */
const VALID_CLUSTER_KEYCODES: number[] = [
    Phaser.Input.Keyboard.KeyCodes.Q,
    Phaser.Input.Keyboard.KeyCodes.W,
    Phaser.Input.Keyboard.KeyCodes.E,
    Phaser.Input.Keyboard.KeyCodes.R,

    Phaser.Input.Keyboard.KeyCodes.A,
    Phaser.Input.Keyboard.KeyCodes.S,
    Phaser.Input.Keyboard.KeyCodes.D,
    Phaser.Input.Keyboard.KeyCodes.F,

    Phaser.Input.Keyboard.KeyCodes.Z,
    Phaser.Input.Keyboard.KeyCodes.X,
    Phaser.Input.Keyboard.KeyCodes.C,
    Phaser.Input.Keyboard.KeyCodes.F,
];

function ridx(count: number) {
    return Math.floor(Math.random() * count);
}

export class ControlsHandler {
    scene: Phaser.Scene;
    set: SetControls;

    constructor(scene: Phaser.Scene, controls: SetControls) {
        this.scene = scene;
        this.set = controls;
    }

    scrambleAll(closeToWasd: boolean): void {
        const controls = Object.keys(this.set) as Array<keyof SetControls>;
        for (const control of controls) {
            this.scrambleSingle(control, closeToWasd);
        }
    }

    scrambleSingle(control?: keyof SetControls, closeToWasd = false): void {
        control = control || this.getRandomControl();
        let keyScrambled = false;
        while (!keyScrambled) {
            const keycode = closeToWasd
                ? this.getRandomClusterKey()
                : this.getRandomKey();
            if (this.keyCurrentlyInUse(keycode)) {
                continue;
            }

            this.registerKey(control, keycode);
            keyScrambled = true;
        }
    }

    private getRandomControl(): keyof SetControls {
        const controls = Object.keys(this.set) as Array<keyof SetControls>;
        return controls[ridx(controls.length)];
    }

    /** Gets a random letter key on the keyboard */
    private getRandomKey(): number {
        let keycode = -1;

        do {
            const keyNames = Object.keys(
                Phaser.Input.Keyboard.KeyCodes
            ) as (keyof typeof Phaser.Input.Keyboard.KeyCodes)[];
            const randomKeyName = keyNames[ridx(keyNames.length)];
            keycode = Phaser.Input.Keyboard.KeyCodes[randomKeyName];
        } while (!this.isValidKey(keycode));

        return keycode;
    }

    /** Gets a random key near the wasd cluster */
    private getRandomClusterKey(): number {
        return VALID_CLUSTER_KEYCODES[ridx(VALID_CLUSTER_KEYCODES.length)];
    }

    private keyCurrentlyInUse(keycode: number): boolean {
        return Object.keys(this.set).some(
            (key: keyof SetControls) => this.set[key].keyCode === keycode
        );
    }

    private registerKey(control: keyof SetControls, keycode: number): void {
        this.scene.input.keyboard.removeKey(this.set[control]);
        this.set[control] = this.scene.input.keyboard.addKey(keycode);
    }

    private isValidKey(keycode: number) {
        return Object.keys(VALID_KEYCODE_RANGES).some(
            (key: keyof typeof VALID_KEYCODE_RANGES) => {
                const range = VALID_KEYCODE_RANGES[key];
                return range[0] <= keycode && keycode <= range[1];
            }
        );
    }
}

export interface PlayerState {
    location: Phaser.Math.Vector2;
    resourceCount: number;
    facing: MoveDirection;
    instability: number;
    powerPercentage: number;
}
