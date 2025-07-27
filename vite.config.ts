import { reactRouter } from "@react-router/dev/vite";
import { sentryReactRouter, type SentryReactRouterBuildOptions } from "@sentry/react-router";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const sentryConfig: SentryReactRouterBuildOptions = {
  org: "js-mastery-0u",
  project: "javascript-react",
  // An auth token is required for uploading source maps;
  // store it in an environment variable to keep it secure.
  authToken:"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",
  // ...
};

// export default defineConfig({
//   plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
//   ssr: {
//     noExternal: [/@syncfusion/]
//   }
// });

export default defineConfig(config => {
  return {
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), sentryReactRouter(sentryConfig, config)],
  sentryConfig,
  ssr: {
    noExternal: [/@syncfusion/]
  }
  };
});
