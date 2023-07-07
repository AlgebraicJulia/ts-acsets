import { Schema, Ob, Property } from "./schema";

export interface CatlabACSet {
  [ob: string]: {
    "_id": number,
    [prop: string]: any
  }[]
}

export class ACSet {
  name: string
  schema: Schema
  private _parts: Map<Ob, number>
  private _subparts: Map<Property, Map<number, any>>

  constructor(
    name: string,
    schema: Schema
  ) {
    this.name = name;
    this.schema = schema;
    this._parts = new Map<Ob, number>(
      schema.schema.obs.map(ob => [ob, 0])
    )
    this._subparts = new Map<Property, Map<number, any>>(
      schema.schema.homs.concat(schema.schema.attrs).map(f => [f, new Map<number, any>()])
    )
  }

  addParts(ob: Ob, n: number): [number, number] {
    const i = this._parts.get(ob)
    if (i === undefined) {
      throw new Error(`No such object $ob`)
    }
    this._parts.set(ob, i + n)
    return [i, i+n]
  }

  addPart(ob: Ob): number {
    return this.addParts(ob, 1)[0]
  }

  hasSubpart(i: number, f: Property): boolean {
    const map = this._subparts.get(f)
    return !(map === undefined) && map.has(i)
  }

  setSubpart(i: number, f: Property, x: any) {
    if (x === undefined) {
      if (this.hasSubpart(i, f)) {
        this._subparts.get(f)?.delete(i)
      }
    } else {
      this._subparts.get(f)?.set(i, x)
    }
  }

  subpart(i: number, f: Property): any {
    return this._subparts.get(f)?.get(i)
  }

  nparts(ob: Ob): number {
    const n = this._parts.get(ob)
    if (n === undefined) {
      throw new Error(`No such object $ob`)
    }
    return n
  }

  parts(ob: Ob): [number, number] {
    return [0, this.nparts(ob)]
  }

  incident(x: any, f: Property): number[] {
    if (!(this.schema.schema.homs.includes(f)) && !(this.schema.schema.attrs.includes(f))) {
      throw new Error(`No such property $f`)
    }

    return Array.from(
      Array(this.nparts(this.schema.ob_by_name.get(f.dom)!)).keys()
    ).filter((i: number) => this.subpart(i, f) == x)
  }
}
