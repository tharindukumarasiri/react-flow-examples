import fs from 'node:fs/promises';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Background, ReactFlow } from '@xyflow/react';
import puppeteer from 'puppeteer';

export function Flow({ flowId, nodes, edges, width, height }) {
  return React.createElement(
    ReactFlow,
    {
      id: flowId,
      nodes: nodes,
      edges: edges,
      fitView: true,
      width: width,
      height: height,
    },
    React.createElement(Background, null)
  );
}

const styles = await fs.readFile(
  // This path will be different depending on where react flow is installed on
  // your system. All our Pro Examples live in a monorepo with a workspace set up
  // to share dependencies, that's why the path walks up the tree quite a bit.
  process.env.NODE_MODULES
    ? `${process.env.NODE_MODULES}/node_modules/@xyflow/react/dist/style.css`
    : '../../../node_modules/@xyflow/react/dist/style.css'
);

const absolute = {
  ['top-left']: 'top: 20px; left: 20px',
  ['top-right']: 'top: 20px; right: 20px',
  ['bottom-left']: 'bottom: 20px; left: 20px',
  ['bottom-right']: 'bottom: 20px; right: 20px',
};

export async function toHtml(flow) {
  const content = toStaticMarkup(flow);

  return `
    <html style="overflow: hidden;">
      <head>
        <style>${styles}</style>
        <style>html, body { margin: 0; font-family: Arial, sans-serif; }</style>
      </head>
      <body 
        style="width: ${flow.width}px; height: ${flow.height}px; margin: 0;"
      >
        <header style="position: absolute; ${
          absolute[flow.position]
        }; font-family: ${flow.font.replace('"', "'")};">
          <h1 style="line-height: 1; margin-bottom: 16px">${flow.title}</h1>
          <div>${flow.subtitle}</div>
        </header>
        ${content}
      </body>
    </html>`;
}

const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  ignoreHTTPSErrors: true,
  dumpio: false,
});

export async function toImage(flow, type) {
  const html = await toHtml(flow);
  const page = await browser.newPage();

  await page.setViewport({ width: flow.width, height: flow.height });
  await page.setContent(html);

  const image = await page.screenshot({ type });

  await page.close();

  return image;
}

export default Flow;

function toStaticMarkup({ width, height, edges, ...flow }) {
  const nodes = flow.nodes.map((node) => {
    const data = { label: node.id };
    const handles = [
      { type: 'target', position: 'top', x: node.width / 2, y: 0 },
      { type: 'source', position: 'bottom', x: node.width / 2, y: node.height },
    ];

    return { ...node, data, handles };
  });

  return renderToStaticMarkup(
    React.createElement(Flow, {
      flowId: 'todo flow id',
      nodes,
      edges,
      width,
      height,
    })
  );
}
