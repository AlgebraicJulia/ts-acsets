import {Ob, Hom, AttrType, Attr, Schema, CatlabSchema} from "./schema"

export const V = new Ob({ name: "V" })
export const E = new Ob({ name: "E" })
export const src = new Hom({ name: "src", dom: "E", codom: "V" })
export const tgt = new Hom({ name: "tgt", dom: "E", codom: "V" })

export const Name = new AttrType({ name: "Name" })
export const vname = new Attr({ name: "vname", dom: "V", codom: "Name" })

export const GraphSchema = new Schema(
  "Graph",
  new CatlabSchema([V,E], [src, tgt], [Name], [vname], undefined)
)