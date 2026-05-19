# GitHub Pages Deployment Checklist

This project is a static site. No build step is required for GitHub Pages.

## Files Required For The Site

- `index.html`
- `help.html`
- `app.js`
- `styles.css`
- `.nojekyll`

## Recommended Repository Setup

1. Create a GitHub repository.
2. Commit the static site files from this folder.
3. In GitHub, open `Settings > Pages`.
4. Set `Source` to `Deploy from a branch`.
5. Select the branch, usually `main`.
6. Select the root folder `/`.
7. Save and wait for GitHub Pages to publish.

## Notes

- The app uses relative paths such as `./app.js` and `./styles.css`, so it can run from a GitHub Pages subpath.
- TensorFlow.js is loaded from a CDN. If the CDN is unavailable, the app uses the JavaScript fallback graph-propagation path.
- `.pythonlibs/` is excluded from git because it is not needed for the static web page.
- `src/stgnn_demo.py` is a reference Python demo and is not required for the browser page.

