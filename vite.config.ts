import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import copy from "rollup-plugin-copy";
import externals from "rollup-plugin-node-externals";
import { terser } from "rollup-plugin-terser";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, PluginOption } from "vite";
import dts from "vite-plugin-dts";

const reactgrid = "src/reactgrid.ts";
const reactgridCore = "src/core/index.ts";
const NODE_ENV = JSON.stringify(process.env.NODE_ENV || "development");
const includeSourceMaps = true;

const plugins = [
  replace({
    "process.env.NODE_ENV": NODE_ENV,
    preventAssignment: true,
  }),
  externals({
    devDeps: false,
  }),
  nodeResolve(),
  commonjs(),
  terser({
    format: {
      comments: false,
    },
    compress: true,
    keep_classnames: true,
  }),
  copy({
    targets: [
      {
        src: [
          "src/**/*.scss",
          "package.json",
          "README.md",
          "LICENSE",
          ".npmignore",
        ],
        dest: "dist",
      },
      { src: "src/test/theming-test.scss", dest: "dist/test" },
      // { src: "cypress/integration", dest: "dist/cypress" },
      {
        src: "src/test/flagCell/flag-cell-style.scss",
        dest: "dist/test/flagCell",
      },
    ],
  }),
];

export default defineConfig({
  build: {
    sourcemap: includeSourceMaps,
    lib: {
      entry: [reactgridCore, reactgrid],
      name: "ReactGrid",
    },
    rollupOptions: {
      input: [reactgridCore, reactgrid],
      output: [
        {
          entryFileNames: "[name].esm.js",
          dir: "dist/core/",
          format: "esm",
        },
        {
          entryFileNames: "[name].js",
          dir: "dist/core/",
          format: "cjs",
        },
      ],
      plugins: [...plugins],
    },
  },
  plugins: [
    visualizer({
      filename: "dist/stats.html",
      brotliSize: true,
      open: true,
    }) as PluginOption,
    dts({
      rollupTypes: true,
      exclude: "src/test/**/*",
    }),
  ],
});
