export interface CatlabSchema {
  version?: {
    ACSetSchema: string;
    Catlab?: string;
  };
  Ob: {
    name: string;
  }[];
  AttrType: {
    name: string;
  }[];
  Hom: {
    name: string;
    dom: string;
    codom: string;
  }[];
  Attr: {
    name: string;
    dom: string;
    codom: string;
  }[];
}

export class Ob {
  constructor(
    readonly name: string
  ) {}
}

export class Hom {
  constructor(
    readonly name: string,
    readonly dom: string,
    readonly codom: string
  ) {}
}

export class AttrType {
  constructor(
    readonly name: string,
  ) {}
}

export class Attr {
  constructor(
    readonly name: string,
    readonly dom: string,
    readonly codom: string
  ) {}
}

export class VersionSpec {
  constructor(
    readonly ACSetSchema: string,
    readonly Catlab: string
  ) {}
}

export class Schema {
  constructor(
    readonly name: string,
    readonly schema: CatlabSchema,
    readonly model: any,
    readonly ob_models: any
  ) {}
}
