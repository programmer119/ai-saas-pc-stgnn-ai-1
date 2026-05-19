# FarmShield AI

FarmShield AI is a static web prototype for visualizing farm biosecurity priority signals on a graph-based map.

The current browser page uses sample farm data to show how a selected source farm, farm attributes, and graph connections can produce day-by-day priority scores. It is intended for product demonstration and workflow validation. Production use should be refined with customer data, validation criteria, and domain review.

## Run Locally

Open `index.html` directly in a browser, or serve the folder with any static file server.

```powershell
py -m http.server 4173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4173
```

## Static Deployment

No build step is required. The GitHub Pages entry point is `index.html`.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the pre-publish checklist.

## Implementation

- Uses `index.html`, `app.js`, `styles.css`, and `help.html`.
- Uses TensorFlow.js tensor operations when the CDN is available.
- Uses the JavaScript fallback graph-propagation path when TensorFlow.js is unavailable.
- Displays a SaaS-style JSON payload preview for integration discussions.
- Includes a Korean/English UI toggle and a help page.

## Model Note

The current runtime is a rule-based, STGNN-inspired graph-propagation prototype. It is not a trained TensorFlow model. A production model should be trained, validated, or integrated with customer-provided models and real operational data.
