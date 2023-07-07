import { ACSet, ExportedACSet } from '../acset';
import { ICatlabSchema, CatlabSchema } from '../schema';
import * as graph from '../graph';

test('serializing and deserializing schema', () => {
  const schema_record = graph.GraphSchema.schema.export();
  const schema_record_serialized = JSON.stringify(schema_record);
  const schema_record_deserialized = JSON.parse(schema_record_serialized) as ICatlabSchema;
  const schema_deserialized = new CatlabSchema(schema_record_deserialized);
  expect(schema_deserialized).toEqual(graph.GraphSchema.schema);
});

test('constructing a graph', () => {
  const g = new ACSet('g', graph.GraphSchema);
  expect(g.nparts(graph.V)).toBe(0);
});

function arrowGraph(): ACSet {
  const g = new ACSet('g', graph.GraphSchema);

  g.addParts(graph.V, 2);
  g.addPart(graph.E);
  g.setSubpart(0, graph.src, 0);
  g.setSubpart(0, graph.tgt, 1);
  g.setSubpart(0, graph.vname, 'a');
  g.setSubpart(1, graph.vname, 'b');

  return g;
}

test('basic ops', () => {
  const g = new ACSet('g', graph.GraphSchema);
  expect(g.addParts(graph.V, 2)).toEqual([0, 2]);
  expect(g.nparts(graph.V)).toBe(2);
  expect(g.addPart(graph.E)).toBe(0);
  g.setSubpart(0, graph.src, 0);
  g.setSubpart(0, graph.tgt, 1);
  g.setSubpart(0, graph.vname, 'a');
  g.setSubpart(1, graph.vname, 'b');
  expect(g.subpart(0, graph.src)).toBe(0);
  expect(g.subpart(0, graph.tgt)).toBe(1);
  expect(g.subpart(0, graph.vname)).toBe('a');
  expect(g.subpart(1, graph.vname)).toBe('b');
  expect(g.incident(0, graph.tgt)).toEqual([]);
  expect(g.incident(1, graph.tgt)).toEqual([0]);
});

test('serializing and deserializing acset', () => {
  const g = arrowGraph();

  const g_record = g.export();
  const g_record_serialized = JSON.stringify(g_record);
  const g_record_deserialized = JSON.parse(g_record_serialized) as ExportedACSet;
  const g_deserialized = ACSet.import('g', graph.GraphSchema, g_record_deserialized);

  expect(g_deserialized).toEqual(g);
});
