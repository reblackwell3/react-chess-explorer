# react-chess-explorer

```bash
npm install
npm run build
```

React components for **browsing and replaying chess games**. This package depends on **`react-chess-core` only** (board + engine primitives), not `react-chess-puzzle-kit`.

Used in production at [endchess.com](https://endchess.com).

**Status:** Phase 5 scaffold — paste requirements into `docs/REQUIREMENTS.md` (or issue) before implementing replay UI.

---

## Local setup

```bash
# Build core first
cd ../react-chess-core-2 && npm run build

cd ../react-chess-explorer-2
npm install
npm run build
```

**Peer dependencies:** `react`, `react-chessboard`, `chess.js`, **`react-chess-core`**

```bash
npm install react-chess-explorer react-chess-core
```

---

## Exports (scaffold)

| Export | Role |
|--------|------|
| **`ExplorerPlaceholder`** | Themed board at start position + scaffold label |
| **`EXPLORER_START_FEN`** | Default FEN constant |

---

## Requirements

Add product/API requirements here when ready:

- `docs/REQUIREMENTS.md` (create when you paste the doc)

Planned scope (from migration plan): move list, ply navigation, optional engine — wired to EndChess `/games` routes.

---

## Related packages

| Package | Role |
|---------|------|
| [react-chess-core](https://github.com/reblackwell3/react-chess-core) | Board theme, highlights, Stockfish |
| [react-chess-puzzle-kit](https://github.com/reblackwell3/react-chess-puzzle-kit) | Puzzles (separate; not a dependency) |

---

## License

MIT © Robert Blackwell
