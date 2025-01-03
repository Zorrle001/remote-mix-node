export enum EQBand {
    L = "L",
    LM = "LM",
    HM = "HM",
    H = "H",
}

type ShelfBands = EQBand.L | EQBand.H;
type ParametricBands = Exclude<EQBand, ShelfBands>;

export type EQ = {
    [shelfBand in ShelfBands]: {
        gain: number;
        freq: number;
    };
} & {
    [paramatricBand in ParametricBands]: {
        gain: number;
        freq: number;
        Q: number;
    };
};
