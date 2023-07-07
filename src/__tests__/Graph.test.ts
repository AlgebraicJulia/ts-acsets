import { ACSet } from "../acset"
import * as graph from "../graph"

test('constructing a graph', () => {
  const g = new ACSet("g", graph.GraphSchema)
  expect(g.nparts(graph.V)).toBe(0)
})

test('basic ops', () => {
  const g = new ACSet("g", graph.GraphSchema)
  expect(g.addParts(graph.V, 2)).toEqual([0,2])
  expect(g.nparts(graph.V)).toBe(2)
  expect(g.addPart(graph.E)).toBe(0)
  g.setSubpart(0, graph.src, 0)
  g.setSubpart(0, graph.tgt, 1)
  g.setSubpart(0, graph.vname, "a")
  g.setSubpart(1, graph.vname, "b")
  expect(g.subpart(0, graph.src)).toBe(0)
  expect(g.subpart(0, graph.tgt)).toBe(1)
  expect(g.subpart(0, graph.vname)).toBe("a")
  expect(g.subpart(1, graph.vname)).toBe("b")
  expect(g.incident(0, graph.tgt)).toEqual([])
  expect(g.incident(1, graph.tgt)).toEqual([0])
})
