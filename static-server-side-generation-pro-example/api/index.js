import express from 'express';
import cors from 'cors';

import { toHtml, toImage } from './Flow.js';
import { validateRFQueryParams, validateRFJsonBody } from './middleware.js';

// APP -------------------------------------------------------------------------

const port = 8080;

express()
  // Our service can handle both GET requests and POST requests. For GET requests,
  // we expect the flow to be passed as a query parameter, but for POST requests
  // we can
  .get('/', [cors(), validateRFQueryParams], handler)
  .post('/', [validateRFJsonBody], handler)
  .listen(port, () => {
    console.log(`Server is running on port ${port}...`);
  });

async function handler(_, res) {
  const flow = res.locals.flow;

  switch (flow.type) {
    case 'html': {
      const html = await toHtml(flow);

      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
      break;
    }

    case 'png': {
      const imageBuffer = await toImage(flow);
      res.setHeader('Content-Type', 'image/png');
      res.status(200).send(imageBuffer);
      break;
    }

    case 'jpg': {
      const imageBuffer = await toImage(flow);
      res.setHeader('Content-Type', 'image/jpg');
      res.status(200).send(imageBuffer);
      break;
    }
  }
}
