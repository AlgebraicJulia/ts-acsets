import { Schema, Ob, Property } from './schema';

export interface ExportedPart {
  _id: number;
  [prop: string]: any;
}

export interface ExportedACSet {
  [ob: string]: ExportedPart[];
}

export class ACSet {
  name: string;
  schema: Schema;
  private _parts: Map<Ob, number>;
  private _subparts: Map<Property, Map<number, any>>;

  constructor(name: string, schema: Schema) {
    this.name = name;
    this.schema = schema;
    this._parts = new Map<Ob, number>(schema.schema.obs.map((ob) => [ob, 0]));
    this._subparts = new Map<Property, Map<number, any>>(
      schema.schema.homs.concat(schema.schema.attrs).map((f) => [f, new Map<number, any>()]),
    );
  }

  addParts(ob: Ob, n: number): [number, number] {
    const i = this._parts.get(ob);
    if (i === undefined) {
      throw new Error(`No such object $ob`);
    }
    this._parts.set(ob, i + n);
    return [i, i + n];
  }

  addPart(ob: Ob): number {
    return this.addParts(ob, 1)[0];
  }

  hasPart(ob: Ob, i: number): boolean {
    return 0 <= i && i < this.nparts(ob);
  }

  hasSubpart(i: number, f: Property): boolean {
    const map = this._subparts.get(f);
    return !(map === undefined) && map.has(i);
  }

  setSubpart(i: number, f: Property, x: any) {
    if (x === undefined) {
      if (this.hasSubpart(i, f)) {
        this._subparts.get(f)?.delete(i);
      }
    } else {
      this._subparts.get(f)?.set(i, x);
    }
  }

  subpart(i: number, f: Property): any {
    return this._subparts.get(f)?.get(i);
  }

  nparts(ob: Ob): number {
    const n = this._parts.get(ob);
    if (n === undefined) {
      throw new Error(`No such object $ob`);
    }
    return n;
  }

  parts(ob: Ob): [number, number] {
    return [0, this.nparts(ob)];
  }

  partArray(ob: Ob): number[] {
    return Array.from(Array(this.nparts(ob)).keys());
  }

  incident(x: any, f: Property): number[] {
    if (!this.schema.schema.homs.includes(f) && !this.schema.schema.attrs.includes(f)) {
      throw new Error(`No such property $f`);
    }

    return this.partArray(this.schema.ob_by_name.get(f.dom)!).filter(
      (i: number) => this.subpart(i, f) == x,
    );
  }

  exportPart(ob: Ob, i: number): ExportedPart {
    if (!this.hasPart(ob, i)) {
      throw new Error(`no such part ($ob, $i)`);
    }

    const homSubparts = this.schema.schema
      .outgoingHoms(ob)
      .map((f) => [f.name, (this.subpart(i, f) as number) + 1]);
    const attrSubparts = this.schema.schema
      .outgoingAttrs(ob)
      .map((f) => [f.name, this.subpart(i, f)] as [string, any]);

    return Object.fromEntries(
      homSubparts.concat(attrSubparts).concat([['_id', i]]),
    ) as ExportedPart;
  }

  importPart(ob: Ob, exported: ExportedPart) {
    const i = this.addPart(ob);
    this.schema.schema.outgoingHoms(ob).map((f) => this.setSubpart(i, f, exported[f.name] - 1));
    this.schema.schema.outgoingAttrs(ob).map((f) => this.setSubpart(i, f, exported[f.name]));
  }

  export(): ExportedACSet {
    return Object.fromEntries(
      this.schema.schema.obs.map((ob) => [
        ob.name,
        this.partArray(ob).map((i) => this.exportPart(ob, i)),
      ]),
    );
  }

  static import(name: string, schema: Schema, exported: ExportedACSet): ACSet {
    const acset = new ACSet(name, schema);
    acset.schema.schema.obs.map((ob) =>
      exported[ob.name].map((value) => acset.importPart(ob, value)),
    );
    return acset;
  }
}
