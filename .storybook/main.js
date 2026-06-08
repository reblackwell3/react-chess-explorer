/** @type { import('@storybook/react-vite').StorybookConfig } */

import { mergeConfig } from "vite";

export default {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "@storybook/preset-typescript",
  ],
  core: {
    builder: "@storybook/builder-vite",
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      optimizeDeps: {
        include: ["react", "react-dom", "react-chessboard", "chess.js"],
      },
    });
  },
};
