import { create } from 'zustand';

import type { Flow, Store, Actions } from './types';
import { fromXml, asJavaScript, asJson, asXml } from './utils';
import { useDebouncedValue } from './hooks';

const initFlow: Flow = {
  width: 800,
  height: 600,

  title: '',
  subtitle: '',
  position: 'top-left',
  font: 'Arial',

  nodes: [
    { id: '1', width: 100, height: 40, position: { x: 0, y: 0 } },
    { id: '2', width: 100, height: 40, position: { x: 25, y: 100 } },
  ],
  edges: [{ id: '1-2', source: '1', target: '2' }],
};

// HOOKS -----------------------------------------------------------------------

/**
 *
 * Access the store by calling this hook with a function to extract the slice of
 * the store you're interested in. We use Zustand internally at React Flow and we
 * recommend folks use it for state management in their projects too!
 *
 */
export const useStore = create<Store & Actions>((set) => ({
  flow: initFlow,
  lang: 'javascript',
  buffers: {
    xml: asXml(initFlow),
    json: asJson(initFlow),
    javascript: asJavaScript(initFlow),
  },
  type: 'png',
  aspectRatio: [4, 3],

  updateFlow: (xml) => {
    set((state) => {
      const flow = fromXml(xml, state.flow);
      const buffers = {
        xml,
        json: asJson(flow),
        javascript: asJavaScript(flow),
      };

      return { ...state, buffers, flow };
    });
  },

  setFlow(flow: Flow) {
    const buffers = {
      xml: asXml(flow),
      json: asJson(flow),
      javascript: asJavaScript(flow),
    };
    set((state) => ({ ...state, flow, buffers }));
  },

  setLang: (lang) => {
    set((state) => ({ ...state, lang }));
  },

  setAspectRatio: (aspectRatio) => {
    set((state) => ({
      ...state,
      aspectRatio,
      flow: {
        ...state.flow,
        height: aspectRatio
          ? ~~(state.flow.width / (aspectRatio[0] / aspectRatio[1]))
          : state.flow.height,
      },
    }));
  },

  setDimensions: (dimensions) => {
    set((state) => {
      const flow = { ...state.flow, ...dimensions };
      const buffers = {
        xml: asXml(flow),
        json: asJson(flow),
        javascript: asJavaScript(flow),
      };

      return { ...state, buffers, flow };
    });
  },

  setType: (type) => {
    set((state) => ({ ...state, type }));
  },

  setText: (text) => {
    set((state) => {
      const flow = { ...state.flow, ...text };
      const buffers = {
        xml: asXml(flow),
        json: asJson(flow),
        javascript: asJavaScript(flow),
      };

      return { ...state, buffers, flow };
    });
  },
}));

/**
 *
 * Access the state in the store without any of the actions. This will cause a
 * re-render when any part of the store is updated.
 *
 */
export const useStoreState = () =>
  useStore(
    ({
      // We're destructuring all these actions just so its simple to return only
      // the state.
      updateFlow,
      setLang,
      setFlow,
      setDimensions,
      setText,
      setType,
      setAspectRatio,
      ...state
    }) => state
  );

export const useFlow = () => {
  const flow = useStore((state) => state.flow);

  return useDebouncedValue(flow, 150);
};

export const useStoreActions = () => {
  return useStore(
    ({
      updateFlow,
      setLang,
      setFlow,
      setDimensions,
      setText,
      setType,
      setAspectRatio,
    }) => ({
      updateFlow,
      setLang,
      setFlow,
      setType,
      setAspectRatio,
      setText,
      setDimensions,
    })
  );
};
