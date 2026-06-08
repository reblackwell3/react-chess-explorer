import type { Meta, StoryObj } from "@storybook/react";
import {
  NC6_OPENING_SANS,
  NC6_GAME_COUNT,
  NC6_TABIYA_FEN,
} from "./fixtures/nc6SampleGames";
import {
  nc6FetchGame,
  nc6FetchPosition,
  nc6FetchPositionGames,
  nc6FetchPositionVariations,
} from "./fixtures/nc6MockApi";
import { PositionReferenceExplorer } from "../features/explorer/PositionReferenceExplorer";

const meta: Meta<typeof PositionReferenceExplorer> = {
  title: "Explorer/PositionReferenceExplorer",
  component: PositionReferenceExplorer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Reference explorer with 100 Storybook sample games seeded from the Open Game tabiya (1.e4 e5 2.Nf3 Nc6).",
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    initialLineSans: [...NC6_OPENING_SANS],
    fetchPosition: nc6FetchPosition,
    fetchPositionGames: nc6FetchPositionGames,
    fetchPositionVariations: nc6FetchPositionVariations,
    theme: "dark",
    fillHeight: true,
    defaultMinElo: 1800,
    defaultMaxElo: 2800,
  },
};

export default meta;

type Story = StoryObj<typeof PositionReferenceExplorer>;

/** 100 sample games after 1.e4 e5 2.Nf3 Nc6 — Open Game / Italian–Spanish tabiya. */
export const Nc6100Games: Story = {
  parameters: {
    docs: {
      description: {
        story: `Opens at ${NC6_TABIYA_FEN} with ${NC6_GAME_COUNT} seeded games. Use the games panel and move stats to browse continuations such as 3.Bb5 and 3.Bc4.`,
      },
    },
  },
};

export const LightTheme: Story = {
  args: {
    theme: "light",
  },
};

export const StartingPosition: Story = {
  args: {
    initialLineSans: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Same mock dataset, but starting from the initial position instead of the Nc6 tabiya.",
      },
    },
  },
};

export const WithReplayFetch: Story = {
  args: {
    onGameSelect: (game) => {
      void nc6FetchGame(game.gameId).then((payload) => {
        if (payload) {
          // eslint-disable-next-line no-console
          console.log("Selected game for replay:", payload);
        }
      });
    },
  },
};
