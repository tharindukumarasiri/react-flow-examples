import type { Flow, Font, TextPosition } from './types';

// CONSTANTS -------------------------------------------------------------------

export const fonts = [
  'Arial',
  'Verdana',
  'Tahoma',
  '"Trebuchet MS"',
  '"Times New Roman"',
  'Georgia',
  'Garamond',
  '"Courier New"',
  '"Brush Script MT"',
] as const;

export const textPositions = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
] as const;

// PARSERS ---------------------------------------------------------------------

const parser = new window.DOMParser();

export const fromXml = (sorce: string, prev: Flow) => {
  const xml = parser.parseFromString(sorce, 'text/xml');

  if (xml.querySelector('parsererror')) return prev;

  const rf = xml.querySelector('react-flow');

  const width = Number(rf?.getAttribute('width')) ?? prev.width;
  const height = Number(rf?.getAttribute('height')) ?? prev.height;
  const title = rf?.getAttribute('title') || prev.title;
  const subtitle = rf?.getAttribute('subtitle') ?? prev.subtitle;
  const position: TextPosition | undefined =
    (rf?.getAttribute('position') as TextPosition) ?? prev.position;
  const font: Font | undefined =
    (rf?.getAttribute('font') as Font) ?? prev.font;

  const nodes = Array.from(xml.querySelectorAll('nodes > node')).flatMap(
    (node) => {
      if (!node.hasAttribute('id')) return [];

      const id = node.getAttribute('id')!;
      const x = Number(node.getAttribute('x'));
      const y = Number(node.getAttribute('y'));
      const nodeWidth = Number(node.getAttribute('width'));
      const nodeHeight = Number(node.getAttribute('height'));

      return [
        {
          id,
          width: nodeWidth || 100,
          height: nodeHeight || 40,
          position: {
            x: Number.isNaN(x) ? 0 : x,
            y: Number.isNaN(y) ? 0 : y,
          },
        },
      ];
    }
  );

  const edges = Array.from(xml.querySelectorAll('edges > edge')).flatMap(
    (edge) => {
      const id = edge.getAttribute('id');
      const source = edge.getAttribute('source');
      const target = edge.getAttribute('target');

      if (!id || !source || !target) return [];

      return [{ id, source, target }];
    }
  );

  return {
    ...prev,
    nodes,
    edges,
    width,
    height,
    title,
    subtitle,
    position,
    font,
  };
};

// CONVERSIONS -----------------------------------------------------------------

export const asXml = (flow: Flow) => `<react-flow
  width="${flow.width}"
  height="${flow.height}"
  title="${flow.title}"
  subtitle="${flow.subtitle}"
  position="${flow.position}"
  font="${(flow.font ?? '').replace(/"/g, '&quot;')}"
  >
  <nodes>
    ${flow.nodes.map(asXmlNode).join('\n    ')}
  </nodes>
  <edges>
    ${flow.edges.map(asXmlEdge).join('\n    ')}
  </edges>
</react-flow>`;

const asXmlNode = (node: Flow['nodes'][number]) =>
  `<node id="${node.id}" width="${node.width}" height="${node.height}" x="${node.position.x}" y="${node.position.y}" />`;

const asXmlEdge = (edge: Flow['edges'][number]) =>
  `<edge id="${edge.id}" source="${edge.source}" target="${edge.target}" />`;

export const asJson = (flow: Flow) => JSON.stringify(flow, null, 2);

export const fromJson = (source: string) => {
  try {
    return JSON.parse(source) as Flow;
  } catch (e) {
    return null;
  }
};

export const fromJavascript = (source: string) => {
  try {
    const flow = eval(source + '(() => flow)()') ?? '';
    return flow;
  } catch (e) {
    return null;
  }
};

export const asJavaScript = (flow: Flow) => `const flow = {
  width: ${flow.width},
  height: ${flow.height},
  title: '${flow.title}',
  subtitle: '${flow.subtitle}',
  position: '${flow.position}',
  font: '${flow.font}',
  nodes: [
    ${flow.nodes.map(asNode).join(',\n    ')}
  ],
  edges: [
    ${flow.edges.map(asEdge).join(',\n    ')}
  ],
};
`;

const asNode = (node: Flow['nodes'][number]) =>
  `{ id: '${node.id}', width: ${node.width}, height: ${node.height}, position: { x: ${node.position.x}, y: ${node.position.y} } }`;

const asEdge = (edge: Flow['edges'][number]) =>
  `{ id: '${edge.id}', source: '${edge.source}', target: '${edge.target}' }`;
