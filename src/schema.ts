export interface IVersionSpec {
  ACSetSchema: string;
  Catlab: string;
}

export interface IOb {
  name: string;
}

export interface IHom {
  name: string;
  dom: string;
  codom: string;
}

export interface IAttrType {
  name: string;
}

export interface IAttr {
  name: string;
  dom: string;
  codom: string;
}

export interface ICatlabSchema {
  version?: IVersionSpec;
  Ob: IOb[];
  AttrType: IAttrType[];
  Hom: IHom[];
  Attr: IAttr[];
}

export class Ob {
  readonly name: string;

  constructor(object: IOb) {
    this.name = object.name;
  }

  export(): IOb {
    return {
      name: this.name,
    };
  }
}

export class Hom {
  readonly name: string;
  readonly dom: string;
  readonly codom: string;

  constructor(object: IHom) {
    this.name = object.name;
    this.dom = object.dom;
    this.codom = object.codom;
  }

  export(): IHom {
    return {
      name: this.name,
      dom: this.dom,
      codom: this.codom,
    };
  }
}

export class AttrType {
  readonly name: string;

  constructor(object: IAttrType) {
    this.name = object.name;
  }

  export(): IAttrType {
    return {
      name: this.name,
    };
  }
}

export class Attr {
  readonly name: string;
  readonly dom: string;
  readonly codom: string;

  constructor(object: IAttr) {
    this.name = object.name;
    this.dom = object.dom;
    this.codom = object.codom;
  }

  export(): IAttr {
    return {
      name: this.name,
      dom: this.dom,
      codom: this.codom,
    };
  }
}

export class VersionSpec {
  readonly ACSetSchema: string;
  readonly Catlab: string;

  constructor(object: IVersionSpec) {
    this.ACSetSchema = object.ACSetSchema;
    this.Catlab = object.Catlab;
  }

  export(): IVersionSpec {
    return {
      ACSetSchema: this.ACSetSchema,
      Catlab: this.Catlab,
    };
  }
}

export class CatlabSchema {
  readonly obs: Ob[];
  readonly homs: Hom[];
  readonly attrtypes: AttrType[];
  readonly attrs: Attr[];
  readonly version_spec?: VersionSpec;

  constructor(object: ICatlabSchema);
  constructor(
    obs: Ob[],
    homs: Hom[],
    attrtypes: AttrType[],
    attrs: Attr[],
    version_spec: VersionSpec | undefined,
  );

  constructor(...args: any[]) {
    if (args.length == 1) {
      const object = args[0] as ICatlabSchema;
      this.obs = object.Ob.map((object) => new Ob(object));
      this.homs = object.Hom.map((object) => new Hom(object));
      this.attrtypes = object.AttrType.map((object) => new AttrType(object));
      this.attrs = object.Attr.map((object) => new Attr(object));
      this.version_spec = object.version && new VersionSpec(object.version);
    } else {
      this.obs = args[0] as Ob[];
      this.homs = args[1] as Hom[];
      this.attrtypes = args[2] as AttrType[];
      this.attrs = args[3] as Attr[];
      this.version_spec = args[4] as VersionSpec;
    }
  }

  export(): ICatlabSchema {
    return {
      Ob: this.obs.map((x) => x.export()),
      Hom: this.homs.map((x) => x.export()),
      AttrType: this.attrtypes.map((x) => x.export()),
      Attr: this.attrs.map((x) => x.export()),
      version: this.version_spec && this.version_spec.export(),
    };
  }

  outgoingHoms(ob: Ob): Hom[] {
    return this.homs.filter((f) => f.dom == ob.name);
  }

  outgoingAttrs(ob: Ob): Attr[] {
    return this.attrs.filter((f) => f.dom == ob.name);
  }
}

export type Property = Hom | Attr;

export class Schema {
  readonly ob_by_name: Map<string, Ob>;

  constructor(
    readonly name: string,
    readonly schema: CatlabSchema,
  ) {
    this.ob_by_name = new Map(schema.obs.map((ob) => [ob.name, ob]));
  }
}
