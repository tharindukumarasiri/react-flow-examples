import { Background, ReactFlow } from '@xyflow/react';

import { useStoreState, useStoreActions } from './store';
import { fonts, textPositions } from './utils';
import { Font } from './types';

import Editor from './Editor';
import Preview from './Preview';

import '@xyflow/react/dist/style.css';
import './index.css';

export default function App() {
  const state = useStoreState();
  const { setLang, setType, setDimensions, setText, setAspectRatio } =
    useStoreActions();

  return (
    <div className="grid grid-rows-2 grid-cols-2 gap-4 p-4 w-screen h-screen font-mono bg-gray-100 [&>*]:rounded-md [&>*]:bg-white [&>*]:shadow-sm [&>*]:p-4 overflow-hidden">
      <div className="row-span-1 col-span-1 relative">
        <span className="absolute top-4 left-4">Preview</span>
        <ReactFlow
          nodes={state.flow.nodes.map((node) => ({
            ...node,
            data: { label: node.id },
          }))}
          edges={state.flow.edges}
          fitView
        >
          <Background />
        </ReactFlow>
      </div>

      <div className="row-span-1 col-span-1 relative">
        <span className="absolute top-4 left-4 z-10">Output</span>
        <Preview />
      </div>

      <div className="row-span-1 col-span-1 relative flex flex-col">
        <div>
          <div>Flow Data Editor</div>
          <div className="flex gap-4 my-4">
            {(['javascript', 'json', 'xml'] as const).map((lang) => (
              <button
                key={lang}
                className={`px-2 py-1 text-sm text-gray-700 rounded border border- ${
                  state.lang === lang
                    ? 'border-[#FF0073] bg-[#FF0073] text-white'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
                onClick={() => setLang(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
        <Editor />
      </div>

      <div className="row-span-1 col-span-1 gap-x-4 grid grid-cols-4 auto-rows-min overflow-auto">
        <div className="col-span-4 mb-2">Format</div>
        {(['html', 'png', 'jpg'] as const).map((type) => (
          <button
            key={type}
            className={`col-span-1 px-2 py-1 text-sm text-gray-700 rounded border ${
              state.type === type
                ? 'border-[#FF0073] bg-[#FF0073] text-white'
                : 'border-gray-100 hover:border-gray-200'
            }`}
            onClick={() => setType(type)}
          >
            {type}
          </button>
        ))}
        <div className="col-span-1"></div>

        <div className="col-span-4 mt-8 mb-2">Aspect Ratio</div>
        {([[1, 1], [4, 3], [16, 9], null] as ([number, number] | null)[]).map(
          (ratio, i) => {
            return (
              <button
                key={i}
                className={`col-span-1 px-2 py-1 text-sm text-gray-700 rounded border ${
                  state.aspectRatio?.[0] === ratio?.[0] &&
                  state.aspectRatio?.[1] === ratio?.[1]
                    ? 'border-[#FF0073] bg-[#FF0073] text-white'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
                onClick={() => setAspectRatio(ratio)}
              >
                {ratio ? ratio.join(':') : 'custom'}
              </button>
            );
          }
        )}

        <div className="col-span-4 mt-8 mb-2">Dimensions</div>
        <label className="col-span-2 group text-gray-700 text-sm">
          width
          <input
            type="range"
            min={400}
            max={1200}
            value={state.flow.width}
            onChange={(event) => {
              const width = Number(event.target.value);
              const height = state.aspectRatio
                ? ~~(width / (state.aspectRatio[0] / state.aspectRatio[1]))
                : state.flow.height;

              setDimensions({ width, height });
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between">
            <span>400</span>
            <span className="group-active:text-[#FF0073]">
              {state.flow.width}px
            </span>
            <span>1200</span>
          </div>
        </label>

        <label
          className={`col-span-2 group text-gray-700 text-sm ${
            state.aspectRatio ? 'opacity-50' : 'opacity-100'
          }`}
        >
          height
          <input
            type="range"
            min={400}
            max={1200}
            value={state.flow.height}
            onChange={(event) => {
              if (!state.aspectRatio) {
                const height = Number(event.target.value);
                setDimensions({ height });
              }
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between">
            <span>400</span>
            <span className="group-active:text-[#FF0073]">
              {state.flow.height}px
            </span>
            <span>1200</span>
          </div>
        </label>

        <div className="col-span-4 mt-8 mb-2">Text Overlay</div>
        <label className="col-span-2 group text-gray-700 text-sm">
          title
          <input
            value={state.flow.title}
            onChange={(event) => setText({ title: event.target.value })}
            className="p-2 border-gray-200 border rounded-lg w-full mt-1"
          />
        </label>

        <label className="col-span-2 group text-gray-700 text-sm">
          font
          <select
            className="mt-1 col-span-2 h-10 w-full self-end text-sm border-gray-200 border rounded-md px-2"
            value={state.flow.font}
            onChange={(event) => setText({ font: event.target.value as Font })}
          >
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </label>

        <label className="col-span-2 group text-gray-700 text-sm mb-4 mt-4">
          subtitle
          <input
            value={state.flow.subtitle}
            onChange={(event) => setText({ subtitle: event.target.value })}
            className="p-2 border-gray-200 border rounded-lg w-full mt-1"
          />
        </label>

        <div className="col-span-2" />

        <div className="col-span-4 group text-gray-700 text-sm mb-1">
          text position
        </div>
        {textPositions.map((pos) => (
          <button
            key={pos}
            className={`px-2 py-1 text-sm text-gray-700 rounded border ${
              state.flow.position === pos
                ? 'border-[#FF0073] bg-[#FF0073] text-white'
                : 'border-gray-100 hover:border-gray-200'
            }`}
            onClick={() => setText({ position: pos })}
          >
            {pos}
          </button>
        ))}
      </div>
    </div>
  );
}
