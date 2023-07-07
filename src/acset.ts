import { Schema, Ob, Property } from './schema';

export interface ExportedPart {
  _id: number;
  [prop: string]: any;
}

export interface ExportedACSet {
  [ob: string]: ExportedPart[];
}

/**
An acset consists of a collection of tables, one for every object in the schema.

The rows of the tables are called "parts", and the cells of the rows are called "subparts".

One can get all of the parts corresponding to an object, add parts, get the subparts,
and set the subparts. Removing parts is currently unsupported.
*/
export class ACSet {
  name: string;
  schema: Schema;
  private _parts: Map<Ob, number>;
  private _subparts: Map<Property, Map<number, any>>;

  /**
  Initialize a new ACSet.

  @param name - The name of the ACSset.
  @param schema - The schema of the ACSet.
  */
  constructor(name: string, schema: Schema) {
    this.name = name;
    this.schema = schema;
    this._parts = new Map<Ob, number>(schema.schema.obs.map((ob) => [ob, 0]));
    this._subparts = new Map<Property, Map<number, any>>(
      schema.schema.homs.concat(schema.schema.attrs).map((f) => [f, new Map<number, any>()]),
    );
  }

  /**
  Add `n` parts to an object in the ACset.

  @param ob - The object in the ACSet to add parts to.
  @param n - The number of parts to be added.

  @returns A range of the indexes of the new parts added to the object.
  */
  addParts(ob: Ob, n: number): [number, number] {
    const i = this._parts.get(ob);
    if (i === undefined) {
      throw new Error(`No such object $ob`);
    }
    this._parts.set(ob, i + n);
    return [i, i + n];
  }

  /**
  Add a single part to an object in the ACSet

  @param ob - The object in the ACSet to add a part to.

  @returns The index of the new part added to the object.
  */
  addPart(ob: Ob): number {
    return this.addParts(ob, 1)[0];
  }

  /**
  Checks whether a certain part exists in the ACSet
  */
  hasPart(ob: Ob, i: number): boolean {
    return 0 <= i && i < this.nparts(ob);
  }

  /**
  Check if a property exists for a given row in a table of the ACSset.

  @param i - The row index for the property mapping to be added to.
  @param f - The `Hom` or `Attr` to check for.

  @param `True` if the property `f` exists on row `i` or `False` if it doesn't.
  */
  hasSubpart(i: number, f: Property): boolean {
    const map = this._subparts.get(f);
    return !(map === undefined) && map.has(i);
  }

  /**
  Modify a morphism or attribute for a row in a table of the ACSet.

  @param i - The row index for the property mapping to be added to.
  @param f - The `Hom` or `Attr` to modify.
  @param x - A valid type for the given `Hom` or `Attr` to set the value or `None` to delete the property.
  */
  setSubpart(i: number, f: Property, x: any) {
    if (x === undefined) {
      if (this.hasSubpart(i, f)) {
        this._subparts.get(f)?.delete(i);
      }
    } else {
      this._subparts.get(f)?.set(i, x);
    }
  }

  /**
  Get the subpart of a part in an ACSet

  @param i - The part that you are indexing.
  @param f - The `Hom` or `Attr` to retrieve.

  @returns The subpart of the ACset.
  */
  subpart(i: number, f: Property): any {
    return this._subparts.get(f)?.get(i);
  }

  /**
  Get the number of rows in a given table of the ACSet.

  @param ob - The object in the ACSet.

  @returns The number of rows in `ob`.
  */
  nparts(ob: Ob): number {
    const n = this._parts.get(ob);
    if (n === undefined) {
      throw new Error(`No such object $ob`);
    }
    return n;
  }

  /**
  Get all of the row indexes in a given table of the ACSet.

  @param ob - The object in the ACSet.

  @returns The range of all of the rows in `ob`.
  */
  parts(ob: Ob): [number, number] {
    return [0, this.nparts(ob)];
  }

  partArray(ob: Ob): number[] {
    return Array.from(Array(this.nparts(ob)).keys());
  }

  /**
  Get all of the subparts incident to a part in the ACset.

  @param x - The subpart to look for.
  @param f - The `Hom` or `Attr` mapping to search.

  @returns A list indexes.
  */
  incident(x: any, f: Property): number[] {
    if (!this.schema.schema.homs.includes(f) && !this.schema.schema.attrs.includes(f)) {
      throw new Error(`No such property $f`);
    }

    return this.partArray(this.schema.ob_by_name.get(f.dom)!).filter(
      (i: number) => this.subpart(i, f) == x,
    );
  }

  private exportPart(ob: Ob, i: number): ExportedPart {
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

  private importPart(ob: Ob, exported: ExportedPart) {
    const i = this.addPart(ob);
    this.schema.schema.outgoingHoms(ob).map((f) => this.setSubpart(i, f, exported[f.name] - 1));
    this.schema.schema.outgoingAttrs(ob).map((f) => this.setSubpart(i, f, exported[f.name]));
  }

  /**
  Serialize the ACSet to a JSON object.

  @returns The JSON object of the serialized ACSet.
  */
  export(): ExportedACSet {
    return Object.fromEntries(
      this.schema.schema.obs.map((ob) => [
        ob.name,
        this.partArray(ob).map((i) => this.exportPart(ob, i)),
      ]),
    );
  }

  /**
  Deserialize a JSON object to an ACSet with a given `Schema`.

  @param name - The name of the ACSset.
  @param schema - The `Schema` of the ACSet that is defined in the given JSON.
  @param s - The JSON object

  @returns The deserialized ACSet object.
  */
  static import(name: string, schema: Schema, exported: ExportedACSet): ACSet {
    const acset = new ACSet(name, schema);
    acset.schema.schema.obs.map((ob) =>
      exported[ob.name].map((value) => acset.importPart(ob, value)),
    );
    return acset;
  }
}
