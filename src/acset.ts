import { Schema, Ob } from "./schema";

export interface CatlabACSet {
  [ob: string]: {
    "_id": number,
    [prop: string]: any
  }[]
}

export class ACSet {
  name: string
  schema: Schema
  _parts: Map<Ob, number>

  constructor(
    name: string,
    schema: Schema
  ) {
    this.name = name;
    this.schema = schema;
    this._parts = new Map<Ob, number>(schema.schema.Ob.map(ob => [new Ob(ob.name), 0]))
  }
}
