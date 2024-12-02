import Monaco from '@monaco-editor/react';

import { useStoreActions, useStoreState } from './store';
import { fromJavascript, fromJson } from './utils';

// We can take a look at this blog post to think about implementing autocomplete
// suggestions in our editor. This would let us auto-complete XML tags so folks
// don't get the wrong impression.
//
// https://mono.software/2017/04/11/custom-intellisense-with-monaco-editor/

const options = {
  minimap: { enabled: false },
};

export default function Editor() {
  const { updateFlow, setFlow } = useStoreActions();
  const { lang, buffers } = useStoreState();

  return (
    <Monaco
      path={`flow.${lang}`}
      language={lang}
      theme="light"
      value={buffers[lang]}
      onChange={(source) => {
        switch (lang) {
          case 'xml': {
            updateFlow(source ?? '');
            break;
          }
          case 'json': {
            const result = fromJson(source ?? '');
            if (result) {
              setFlow(result);
            }
            break;
          }
          case 'javascript': {
            const result = fromJavascript(source ?? '');
            if (result) {
              setFlow(result);
            }
            break;
          }
        }
      }}
      options={options}
    />
  );
}
