# Coinbase Create Onchain Agent Changelog

## 0.5.6

### Patch Changes

- [#854](https://github.com/coinbase/agentkit/pull/854) [`61d1fb9`](https://github.com/coinbase/agentkit/commit/61d1fb96999827a449e9ff5961020747f37fc446) Thanks [@phdargen](https://github.com/phdargen)! - Made the cdp v2 faucet available to all wallet providers

## 0.5.5

### Patch Changes

- [#847](https://github.com/coinbase/agentkit/pull/847) [`bff37de`](https://github.com/coinbase/agentkit/commit/bff37de7a596867b8abd05db0a1d37e32f04adae) Thanks [@phdargen](https://github.com/phdargen)! - Added gitignore to templates; bumped agentkit/node/next versions; align mcp templates with new v2 wallet settings

## 0.5.4

### Patch Changes

- [#817](https://github.com/coinbase/agentkit/pull/817) [`406f994`](https://github.com/coinbase/agentkit/commit/406f994d3ceec5f3f2092285d1c155b249581137) Thanks [@phdargen](https://github.com/phdargen)! - Fixed bugs in the CDP swap action

## 0.5.3

### Patch Changes

- [#814](https://github.com/coinbase/agentkit/pull/814) [`3211ad0`](https://github.com/coinbase/agentkit/commit/3211ad06a87f0ab3bb1a49f415cfda0b3f8b2db4) Thanks [@phdargen](https://github.com/phdargen)! - Added paymaster capability to CdpSmartWallet

## 0.5.2

### Patch Changes

- [#809](https://github.com/coinbase/agentkit/pull/809) [`059d96d`](https://github.com/coinbase/agentkit/commit/059d96d91e545e643c698cb386415621cb32ab6a) Thanks [@phdargen](https://github.com/phdargen)! - Fixed bugs in next template configs

- [#805](https://github.com/coinbase/agentkit/pull/805) [`082163f`](https://github.com/coinbase/agentkit/commit/082163fa7ada25d9b3d8b5597ccd8de3b85457f1) Thanks [@phdargen](https://github.com/phdargen)! - Fixed a bug in wallet config

## 0.5.1

### Patch Changes

- [#792](https://github.com/coinbase/agentkit/pull/792) [`1aa170f`](https://github.com/coinbase/agentkit/commit/1aa170f2a2c891779290e38ca9a6a185e3f9ae36) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Removed broken references

## 0.5.0

### Minor Changes

- [#773](https://github.com/coinbase/agentkit/pull/773) [`463d310`](https://github.com/coinbase/agentkit/commit/463d3101147cacb0f2044162dd007489f97ef0a0) Thanks [@0xRAG](https://github.com/0xRAG)! - Upgraded to support updated CDP wallet providers

- [#785](https://github.com/coinbase/agentkit/pull/785) [`2d13565`](https://github.com/coinbase/agentkit/commit/2d13565d91e64a13d3ecb8c300d8c0cd973d3fae) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Added Solana option to CLI

## 0.4.0

### Minor Changes

- [#732](https://github.com/coinbase/agentkit/pull/732) [`cd044db`](https://github.com/coinbase/agentkit/commit/cd044db7ae35140726c35ba82429b0f0885ccb60) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Renamed CDP env vars to modern naming convention

### Patch Changes

- [#733](https://github.com/coinbase/agentkit/pull/733) [`8da312c`](https://github.com/coinbase/agentkit/commit/8da312c9a11b9df91a9768eedf9b340f67697dbd) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Improved error handling, particulately for missing .env vars in next template

- [#734](https://github.com/coinbase/agentkit/pull/734) [`4600a98`](https://github.com/coinbase/agentkit/commit/4600a98227d74527e05ff933d364258d488517d7) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Improved default message modifier to better explain tool capabilities/limitations

## 0.3.3

### Patch Changes

- [#674](https://github.com/coinbase/agentkit/pull/674) [`fe38f3e`](https://github.com/coinbase/agentkit/commit/fe38f3e4a02d90f3a5452cc2f7c2273abbe46462) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Fixed build setup for mcp server templates

## 0.3.2

### Patch Changes

- [#663](https://github.com/coinbase/agentkit/pull/663) [`d038cc9`](https://github.com/coinbase/agentkit/commit/d038cc9670c5e59678adc47f0b40da92cac55cc7) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Bump agentkit dependency to 0.6.0 in templates

## 0.3.1

### Patch Changes

- [#642](https://github.com/coinbase/agentkit/pull/642) [`9a946f2`](https://github.com/coinbase/agentkit/commit/9a946f241897bbd1f8fc394861cdbe9e8b6b4e6f) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Removed CdpWalletActionProvider from smart wallet action provider lists

## 0.3.0

### Minor Changes

- [#622](https://github.com/coinbase/agentkit/pull/622) [`1076bb6`](https://github.com/coinbase/agentkit/commit/1076bb661ad6ff533006777ec658547d5a15f1b1) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Updated default wallet provider to SmartWalletProvider

- [#589](https://github.com/coinbase/agentkit/pull/589) [`3aa7931`](https://github.com/coinbase/agentkit/commit/3aa793137c1d7ff0a57fb68be0a97cc1978b51d8) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Added code generation for individual building blocks

  Projects bootstrapped with the `create-onchain-agent` CLI will also have the `agenkit` CLI installed.

  - `agentkit generate wallet-provider`: Generate a custom wallet provider
  - `agentkit generate action-provider`: Generate a custom action provider
  - `agentkit generate prepare`: Generate framework-agnostic AgentKit setup
  - `agentkit generate create-agent`: Generate framework-specific agent creation

## 0.2.0

### Minor Changes

- [#569](https://github.com/coinbase/agentkit/pull/569) [`dea911e`](https://github.com/coinbase/agentkit/commit/dea911e384a702b1c2b26dde66b1f3213683e603) Thanks [@0xRAG](https://github.com/0xRAG)! - Added option to generate MCP Server project

### Patch Changes

- [#548](https://github.com/coinbase/agentkit/pull/548) [`281e81a`](https://github.com/coinbase/agentkit/commit/281e81a46f3148531b1ba13096cbd9b6fcddb7b0) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Added multi framework support

## 0.1.6

### Patch Changes

- [#499](https://github.com/coinbase/agentkit/pull/499) [`15520d4`](https://github.com/coinbase/agentkit/commit/15520d4cf48f204a2b0a43a303f9ab03f3c92409) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Added smart wallet support

- [#511](https://github.com/coinbase/agentkit/pull/511) [`91d6e74`](https://github.com/coinbase/agentkit/commit/91d6e748345beb354c5839c1013f0e94e076e80f) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Fixed linter error in generated project

## [0.1.5] - 2025-02-28

### Fixed

- [#484](https://github.com/coinbase/agentkit/pull/484) [`a1dcd3f`](https://github.com/coinbase/agentkit/commit/a1dcd3fa32dac78a91eb99938e5608672ca005ee) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Added wallet persistence to all templates

- [#468](https://github.com/coinbase/agentkit/pull/468) [`b13c5e6`](https://github.com/coinbase/agentkit/commit/b13c5e685ebeed1d00963286067da1a106b18d37) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Fixed CDP env vars being required, when some cases are optional

- [#485](https://github.com/coinbase/agentkit/pull/485) [`ba7d6bd`](https://github.com/coinbase/agentkit/commit/ba7d6bdb5745f6651c73899f4b5628dd9e331c7e) Thanks [@CarsonRoscoe](https://github.com/CarsonRoscoe)! - Improved network selection & custom chainId/rpc selection

## [0.1.4] - 2025-02-24

## Added

- Added CHANGELOG.md

## [0.1.3] - 2025-02-21

## Fixed

- Fixed the CLI's missing dependencies

## [0.1.2] - 2025-02-24

## Fixed

- Fixed template generation

## [0.1.1] - 2025-02-24

## Fixed

- Fixed package scope

## [0.1.0] - 2024-02-23

### Added

- Initial release of the create-onchain-agent CLI tool
