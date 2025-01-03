export enum DynamicID {
    DYN1 = "dyn1",
    DYN2 = "dyn2",
}

export enum DynamicType {
    GATE = "gate",
    COMP = "comp",
}

export type DynamicTypeGenerator<ID extends DynamicID> =
    ID extends DynamicID.DYN1 ? DynamicType.GATE : DynamicType.COMP;

export type DynamicDataGenerator<TYPE extends DynamicType> =
    TYPE extends DynamicType.GATE ? GateData : CompressorData;

export type GateData = {
    enabled: boolean;
    thrshold: number;
    depth: number;
    attack: number;
    release: number;
    hpfFreq: number;
    lpfFreq: number;
};

export type CompressorData = {
    enabled: boolean;
    threshold: number;
    ratio: number;
    makeupGain: number;
    attack: number;
    release: number;
};

export type Dynamic<ID extends DynamicID> = {
    id: ID;
    type: DynamicTypeGenerator<ID>;
    data: DynamicDataGenerator<DynamicTypeGenerator<ID>>;
};
