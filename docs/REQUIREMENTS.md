# Explorer requirements (Reference MVP)

ChessBase **Reference**-style position explorer: board, move statistics, filterable game list. Data from `endchess-mass-games-import` → Mongo → `endchess-backend`.

## API (endchess-backend)

Base path: `/positions` (cookie auth same as puzzles).

### `GET /positions?fen=<full FEN>`

Move aggregates for the position.

**Response** `PositionApiDto`:

```json
{
  "positionKey": "sha256…",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
  "totalGames": 1250000,
  "moves": [
    {
      "san": "e4",
      "uci": "e2e4",
      "games": 520000,
      "whiteWins": 180000,
      "draws": 140000,
      "blackWins": 200000,
      "avgElo": 2450
    }
  ],
  "sampleGameIds": ["abc123"]
}
```

**404** when no data for that FEN.

### `GET /positions/games?fen=&minElo=&maxElo=&uci=&limit=&topOnly=`

Games that reached this position (and optionally played `uci` from here).

| Param | Default | Notes |
|-------|---------|--------|
| `fen` | required | Full FEN from board |
| `minElo`, `maxElo` | 2200, 2800 | **Both** players must be in band |
| `uci` | — | Filter to games that played this move from `fen` |
| `limit` | 50, max 100 | |
| `topOnly` | false | When true, avg Elo ≥ 2500 and sort by strength |

**Response** `PositionGamesApiDto`: `games[]` with `gameId`, `url` (Lichess), players, Elos, `result`, `nextSan`, `nextUci`, `avgElo`.

### `GET /positions/games/:gameId`

Full game for in-app replay training.

**Response** `ExplorerGameReplayApiDto`: metadata plus `movesUci[]` and `movesSan[]` from the starting position.

**404** when game not found or move list not stored yet (re-import required).

Lichess link still available via `url` for external replay.

## react-chess-explorer

### Layout (ChessBase Reference)

- **Two columns only** — board left (~60%), reference panel right (~40%). `flexWrap` is off; nothing stacks below the board on desktop widths.
- **Right column** (top → bottom): Reference tab bar → move stats (scroll) → variations strip (placeholder) → games list (scroll) with **Filter / Top games toolbar inside the panel footer** (not a page footer).
- **`fillHeight`** (default `true`) — shell uses `minHeight: calc(100vh - 120px)` so the host page should not add extra content under the explorer.

### Exports

| Export | Role |
|--------|------|
| `PositionReferenceExplorer` | Defaults for layout + all `render*` slots |
| `PositionReferenceExplorerCore` | Same; override `renderLayout`, `renderMoveStats`, `renderGamesPanel`, … for MUI |
| `defaultRender*` / `Default*` | Puzzle-kit–style hooks for partial customization |
| `mockFetchPosition`, `mockFetchPositionGames` | Dev without backend |
| `GameReplayTrainer`, `useGameReplayTraining` | Per-game guess-the-move training |
| `ExplorerPlaceholder` | Legacy scaffold |

**Host wiring example:**

```ts
fetchPosition: (fen) => api.get('/positions', { params: { fen } }).then(r => r.data),
fetchPositionGames: (p) => api.get('/positions/games', { params: p }).then(r => r.data),
```

## Out of scope (v1)

- Move stats filtered by rating slider (aggregates only; games list is filtered)
- Full variation tree / “hot” lines
- Community position names
- Opening repertoires

## Data pipeline

See `endchess-mass-games-import` README and `docs/DISCUSSION.md`.
