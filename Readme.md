# @dvhb/cli [![Build Status](https://travis-ci.org/dvhb/cli.svg?branch=master)](https://travis-ci.org/dvhb/cli)

Build tool with zero initial configuration

## Features

- Webpack 3
- Babel 7
- Optional static views with pug template engine (for static websites)

## Install in existing project

```bash
yarn add @dvhb/cli
```

Add scripts to package.json

```bash
"scripts": {
  ...
  "start": "dvhb server",
  "build": "dvhb build"
  ...
}
```

See basic starter project for more details [examples/basic](https://github.com/dvhb/cli/tree/master/examples/basic).

## Workflow

- Add code to `src/`.
- Build and watch changes in `src/` with `yarn start`
- Open [localhost:3000](http://localhost:3000)

## Requirements

- Node.js v7+ and npm
