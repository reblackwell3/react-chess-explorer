import {
  fitExplorerBoardWidth,
  fitMobileExplorerBoardWidth,
  fitStackedExplorerBoardWidth,
  fitTabletStackedExplorerBoardWidth,
  stackedExplorerSlotHeightCap,
} from './fitExplorerBoardWidth';

describe('fitMobileExplorerBoardWidth', () => {
  it('sizes the board to the full slot width on phones', () => {
    expect(fitMobileExplorerBoardWidth(390, 44, 560)).toBe(390);
  });
});

describe('fitStackedExplorerBoardWidth', () => {
  it('fills a slot up to the max board width', () => {
    expect(fitStackedExplorerBoardWidth(1024, 44, 960)).toBe(960);
  });
});

describe('fitTabletStackedExplorerBoardWidth', () => {
  it('matches review trainer board width at the same viewport', () => {
    expect(fitTabletStackedExplorerBoardWidth(1024, 44, 960)).toBe(848);
  });
});

describe('stackedExplorerSlotHeightCap', () => {
  it('reserves the majority of the grid for the reference panel', () => {
    expect(stackedExplorerSlotHeightCap(800)).toBe(384);
  });
});

describe('fitExplorerBoardWidth', () => {
  it('caps at the configured max board width', () => {
    expect(fitExplorerBoardWidth(800, 800, 44, 560)).toBe(560);
  });

  it('fills the column on side-by-side desktop', () => {
    expect(fitExplorerBoardWidth(960, 900, 44, 960)).toBe(856);
  });

  it('shrinks to fit width', () => {
    expect(fitExplorerBoardWidth(400, 800, 44, 560)).toBe(400);
  });

  it('shrinks to fit height minus nav', () => {
    expect(fitExplorerBoardWidth(800, 500, 44, 560)).toBe(456);
  });

  it('never goes below the minimum board width', () => {
    expect(fitExplorerBoardWidth(100, 200, 44, 560)).toBe(240);
  });
});
