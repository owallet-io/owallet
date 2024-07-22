# OWallet

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/oraichain/owallet/blob/master/LICENSE.txt)
[![Twitter: OWallet](https://img.shields.io/twitter/follow/oraichain.svg?style=social)](https://twitter.com/oraichain)

## OWallet: Cosmos x EVM in one Wallet
OWallet is a secure, easy-to-use Web3 crypto wallet that empowers you to manage your digital assets with ease. OWallet supports both Cosmos-based and EVM-based networks, including Cosmos Hub, TRON, Oraichain, Osmosis, Ethereum, BNB Chain, and more.

OWallet is developed based on Keplr extension and currently maintained by Oraichain Labs.

## OWallet’s key features
 - Strategic Portfolio Management: Experience a seamless multi-chain and multi-account management interface. Conveniently manage multiple accounts from a single interface;
 - Multi-Chain Support: Seamlessly track and manage your crypto assets across multiple blockchains, including Oraichain, Bitcoin, Ethereum, BNB Chain, TRON, Injective, Oasis, Osmosis, Noble, and Stargaze;
 - IBC Transfers: Enable secure and efficient Inter-Blockchain Communication (IBC) transfers;
 - CW20 Tokens: Improved sending and receiving of CW20 standard fungible tokens based on CosmWasm;
 - CosmWasm Compatibility: Compatible with CosmWasm;
 - Ledger Support: Future support for Ledger hardware wallets;
 - Universal Wallet & Swap: Utilize a universal wallet for Bitcoin, EVM, Oraichain, and Cosmos-SDK blockchains. Swap assets seamlessly with the Universal Swap and Smart Routing powered by OBridge Technologies;
 - Mobile and Web Extension: Available on mobile apps and web extensions for greater accessibility.


## Technical inquiries
- OWallet source code: https://github.com/oraichain/owallet
- Support ticket: https://orai.io/support
- OWallet website: https://owallet.dev
- Discord https://discord.gg/XdTVgzKc
- You can create a pull request to add your network

## Mobile structure

packages/mobile
 ┣ .bundle
 ┃ ┗ config
 ┣ e2e
 ┃ ┣ config.json
 ┃ ┣ environment.js
 ┃ ┗ firstTest.e2e.js
 ┣ patches
 ┃ ┣ @ledgerhq+react-native-hw-transport-ble+6.28.3.patch
 ┃ ┗ react-native-scrypt+1.2.1.patch
 ┣ polyfill
 ┃ ┗ crypto.js
 ┣ src
 ┃ ┣ assets
 ┃ ┃ ┣ fonts
 ┃ ┃ ┣ image
 ┃ ┃ ┃ ┣ transactions
 ┃ ┃ ┃ ┣ webpage
 ┃ ┃ ┣ images
 ┃ ┃ ┣ logo
 ┃ ┃ ┣ svg
 ┃ ┃ ┗ selection.json
 ┃ ┣ background
 ┃ ┃ ┗ background.ts
 ┃ ┣ common
 ┃ ┃ ┣ __tests__
 ┃ ┃ ┃ ┗ cw-stargate.spec.ts
 ┃ ┃ ┣ api.ts
 ┃ ┃ ┣ async-kv-store.ts
 ┃ ┃ ┣ constants.ts
 ┃ ┃ ┣ cw-stargate.ts
 ┃ ┃ ┗ index.ts
 ┃ ┣ components
 ┃ ┃ ┣ address-copyable
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ badge
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ bottom-tabbar
 ┃ ┃ ┃ ┣ blurred.tsx
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ button
 ┃ ┃ ┃ ┣ OWButton.tsx
 ┃ ┃ ┃ ┣ OWButtonGroup.tsx
 ┃ ┃ ┃ ┣ button.tsx
 ┃ ┃ ┃ ┣ hooks.tsx
 ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┣ ow-button-icon.tsx
 ┃ ┃ ┃ ┗ ow-button-page.tsx
 ┃ ┃ ┣ camera
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ card
 ┃ ┃ ┃ ┣ body.tsx
 ┃ ┃ ┃ ┣ card.tsx
 ┃ ┃ ┃ ┣ divider.tsx
 ┃ ┃ ┃ ┣ header.tsx
 ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┣ ow-box.tsx
 ┃ ┃ ┃ ┗ ow-linear-gradient-box.tsx
 ┃ ┃ ┣ chain-selector
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ chip
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ drawer
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ empty
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┗ ow-empty.tsx
 ┃ ┃ ┣ header
 ┃ ┃ ┃ ┣ icon
 ┃ ┃ ┃ ┃ ┣ add.tsx
 ┃ ┃ ┃ ┃ ┣ back.tsx
 ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┣ blurred.tsx
 ┃ ┃ ┃ ┣ button.tsx
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ ow-header-right.tsx
 ┃ ┃ ┃ ┣ ow-header-title.tsx
 ┃ ┃ ┃ ┣ ow-sub-title-header.tsx
 ┃ ┃ ┃ ┗ plain.tsx
 ┃ ┃ ┣ icon
 ┃ ┃ ┃ ┣ 3-dot.tsx
 ┃ ┃ ┃ ┣ activity.tsx
 ┃ ┃ ┃ ┣ add-more.tsx
 ┃ ┃ ┃ ┣ add.tsx
 ┃ ┃ ┃ ┣ address-book.tsx
 ┃ ┃ ┃ ┣ alert.tsx
 ┃ ┃ ┃ ┣ apple.tsx
 ┃ ┃ ┃ ┣ arrow-down.tsx
 ┃ ┃ ┃ ┣ arrow.tsx
 ┃ ┃ ┃ ┣ browser.tsx
 ┃ ┃ ┃ ┣ button.tsx
 ┃ ┃ ┃ ┣ camera.tsx
 ┃ ┃ ┃ ┣ carbon-notification.tsx
 ┃ ┃ ┃ ┣ check.tsx
 ┃ ┃ ┃ ┣ clock.tsx
 ┃ ┃ ┃ ┣ close.tsx
 ┃ ┃ ┃ ┣ contact.tsx
 ┃ ┃ ┃ ┣ copy.tsx
 ┃ ┃ ┃ ┣ country.tsx
 ┃ ┃ ┃ ┣ drawer.tsx
 ┃ ┃ ┃ ┣ eye.tsx
 ┃ ┃ ┃ ┣ gift.tsx
 ┃ ┃ ┃ ┣ go-back.tsx
 ┃ ┃ ┃ ┣ google.tsx
 ┃ ┃ ┃ ┣ history.tsx
 ┃ ┃ ┃ ┣ home-2.tsx
 ┃ ┃ ┃ ┣ home.tsx
 ┃ ┃ ┃ ┣ icon-search.tsx
 ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┣ invest.tsx
 ┃ ┃ ┃ ┣ money-bag.tsx
 ┃ ┃ ┃ ┣ namespace-buy.tsx
 ┃ ┃ ┃ ┣ namespace-relink.tsx
 ┃ ┃ ┃ ┣ namespace-unlink.tsx
 ┃ ┃ ┃ ┣ new-wallet.tsx
 ┃ ┃ ┃ ┣ notification.tsx
 ┃ ┃ ┃ ┣ person.tsx
 ┃ ┃ ┃ ┣ plus.tsx
 ┃ ┃ ┃ ┣ quantity.tsx
 ┃ ┃ ┃ ┣ refresh.tsx
 ┃ ┃ ┃ ┣ remove.tsx
 ┃ ┃ ┃ ┣ reward.tsx
 ┃ ┃ ┃ ┣ scan.tsx
 ┃ ┃ ┃ ┣ scanner.tsx
 ┃ ┃ ┃ ┣ search.tsx
 ┃ ┃ ┃ ┣ send.tsx
 ┃ ┃ ┃ ┣ setting.tsx
 ┃ ┃ ┃ ┣ shooting-star.tsx
 ┃ ┃ ┃ ┣ swap.tsx
 ┃ ┃ ┃ ┣ tab.tsx
 ┃ ┃ ┃ ┣ threedots.tsx
 ┃ ┃ ┃ ┣ transaction.tsx
 ┃ ┃ ┃ ┣ trash-can.tsx
 ┃ ┃ ┃ ┣ unconnect.tsx
 ┃ ┃ ┃ ┣ validator.tsx
 ┃ ┃ ┃ ┣ wallet.tsx
 ┃ ┃ ┃ ┗ x-icon.tsx
 ┃ ┃ ┣ input
 ┃ ┃ ┃ ┣ address.tsx
 ┃ ┃ ┃ ┣ amount.tsx
 ┃ ┃ ┃ ┣ currency-selector.tsx
 ┃ ┃ ┃ ┣ fee-buttons.tsx
 ┃ ┃ ┃ ┣ gas.tsx
 ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┣ input.tsx
 ┃ ┃ ┃ ┣ memo.tsx
 ┃ ┃ ┃ ┗ selector.tsx
 ┃ ┃ ┣ maintain
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ mnemonic
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ ow-icon
 ┃ ┃ ┃ ┣ icomoon.tsx
 ┃ ┃ ┃ ┗ ow-icon.tsx
 ┃ ┃ ┣ page
 ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┣ ow-flat-list.tsx
 ┃ ┃ ┃ ┣ scroll-view-in-bottom-tab-view.tsx
 ┃ ┃ ┃ ┣ scroll-view.tsx
 ┃ ┃ ┃ ┣ section-list.tsx
 ┃ ┃ ┃ ┣ utils.ts
 ┃ ┃ ┃ ┣ view-in-bottom-tab-view.tsx
 ┃ ┃ ┃ ┗ view.tsx
 ┃ ┃ ┣ progessive-image
 ┃ ┃ ┃ ┗ index.js
 ┃ ┃ ┣ progress-bar
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ rect-button
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ spinner
 ┃ ┃ ┃ ┣ hooks.tsx
 ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┗ loading.tsx
 ┃ ┃ ┣ svg
 ┃ ┃ ┃ ┣ double-doughnut-chart.tsx
 ┃ ┃ ┃ ┣ gift-staking.tsx
 ┃ ┃ ┃ ┣ gradient-background.tsx
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ owallet-logo.tsx
 ┃ ┃ ┃ ┗ progress-bar.tsx
 ┃ ┃ ┣ text
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┗ ow-text.tsx
 ┃ ┃ ┣ thumbnail
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┗ validator.tsx
 ┃ ┃ ┣ toggle
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ token-symbol
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┗ token-symbol-evm.tsx
 ┃ ┃ ┗ vector-character
 ┃ ┃ ┃ ┣ characters
 ┃ ┃ ┃ ┃ ┣ a.tsx
 ┃ ┃ ┃ ┃ ┣ b.tsx
 ┃ ┃ ┃ ┃ ┣ c.tsx
 ┃ ┃ ┃ ┃ ┣ d.tsx
 ┃ ┃ ┃ ┃ ┣ e.tsx
 ┃ ┃ ┃ ┃ ┣ f.tsx
 ┃ ┃ ┃ ┃ ┣ g.tsx
 ┃ ┃ ┃ ┃ ┣ h.tsx
 ┃ ┃ ┃ ┃ ┣ i.tsx
 ┃ ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┃ ┣ j.tsx
 ┃ ┃ ┃ ┃ ┣ k.tsx
 ┃ ┃ ┃ ┃ ┣ l.tsx
 ┃ ┃ ┃ ┃ ┣ m.tsx
 ┃ ┃ ┃ ┃ ┣ n.tsx
 ┃ ┃ ┃ ┃ ┣ o.tsx
 ┃ ┃ ┃ ┃ ┣ p.tsx
 ┃ ┃ ┃ ┃ ┣ q.tsx
 ┃ ┃ ┃ ┃ ┣ question-mark.tsx
 ┃ ┃ ┃ ┃ ┣ r.tsx
 ┃ ┃ ┃ ┃ ┣ s.tsx
 ┃ ┃ ┃ ┃ ┣ t.tsx
 ┃ ┃ ┃ ┃ ┣ u.tsx
 ┃ ┃ ┃ ┃ ┣ v.tsx
 ┃ ┃ ┃ ┃ ┣ w.tsx
 ┃ ┃ ┃ ┃ ┣ x.tsx
 ┃ ┃ ┃ ┃ ┣ y.tsx
 ┃ ┃ ┃ ┃ ┗ z.tsx
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┣ hooks
 ┃ ┃ ┣ index.ts
 ┃ ┃ ┣ use-flatlist.js
 ┃ ┃ ┣ use-header.tsx
 ┃ ┃ ┣ use-height-header.tsx
 ┃ ┃ ┣ use-keyboard-visible.ts
 ┃ ┃ ┣ use-previous.ts
 ┃ ┃ ┣ use-simple-timer.ts
 ┃ ┃ ┣ use-smart-navigation.tsx
 ┃ ┃ ┗ use-unmount.ts
 ┃ ┣ injected
 ┃ ┃ ┣ index.ts
 ┃ ┃ ┣ init.ts
 ┃ ┃ ┗ injected-provider.ts
 ┃ ┣ modals
 ┃ ┃ ┣ base
 ┃ ┃ ┃ ┣ base.tsx
 ┃ ┃ ┃ ┣ const.ts
 ┃ ┃ ┃ ┣ hooks.tsx
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ provider.tsx
 ┃ ┃ ┃ ┣ transition.tsx
 ┃ ┃ ┃ ┗ utils.tsx
 ┃ ┃ ┣ card
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ home-base
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ ledger
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ password-input
 ┃ ┃ ┃ ┗ modal.tsx
 ┃ ┃ ┣ permission
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ sign
 ┃ ┃ ┃ ┣ amino.tsx
 ┃ ┃ ┃ ┣ direct.tsx
 ┃ ┃ ┃ ┣ erc20.json
 ┃ ┃ ┃ ┣ fee-ethereum.tsx
 ┃ ┃ ┃ ┣ fee.tsx
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ messages.tsx
 ┃ ┃ ┃ ┣ msg.tsx
 ┃ ┃ ┃ ┣ sign-bitcoin.tsx
 ┃ ┃ ┃ ┣ sign-ethereum.tsx
 ┃ ┃ ┃ ┣ sign-oasis.tsx
 ┃ ┃ ┃ ┗ sign-tron.tsx
 ┃ ┃ ┗ unlock
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┣ navigations
 ┃ ┃ ┣ address-book-navigation.tsx
 ┃ ┃ ┣ index.tsx
 ┃ ┃ ┣ invest-navigation.tsx
 ┃ ┃ ┣ main-navigation.tsx
 ┃ ┃ ┣ main-tab-navigation.tsx
 ┃ ┃ ┣ other-navigation.tsx
 ┃ ┃ ┣ register-navigation.tsx
 ┃ ┃ ┣ send-navigation.tsx
 ┃ ┃ ┣ settings-navigation.tsx
 ┃ ┃ ┗ web-navigation.tsx
 ┃ ┣ providers
 ┃ ┃ ┣ confirm-modal
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┗ modal.tsx
 ┃ ┃ ┣ focused-screen
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ interaction-modals-provider
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ loading-screen
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ loading-screen-overlay.tsx
 ┃ ┃ ┃ ┗ modal.tsx
 ┃ ┃ ┗ page-scroll-position
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┣ router
 ┃ ┃ ┣ env.ts
 ┃ ┃ ┣ index.ts
 ┃ ┃ ┣ requester.ts
 ┃ ┃ ┣ rn-router.ts
 ┃ ┃ ┗ root.js
 ┃ ┣ screens
 ┃ ┃ ┣ camera
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ dashboard
 ┃ ┃ ┃ ┣ components
 ┃ ┃ ┃ ┃ ┣ block.tsx
 ┃ ┃ ┃ ┃ ┗ info.tsx
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ governance
 ┃ ┃ ┃ ┣ card.tsx
 ┃ ┃ ┃ ┣ details.tsx
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┗ utils.ts
 ┃ ┃ ┣ home
 ┃ ┃ ┃ ┣ components
 ┃ ┃ ┃ ┃ ┣ my-wallet-modal
 ┃ ┃ ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┃ ┃ ┣ mnemonic-seed.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ my-wallet-modal.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ styles.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ wallet-btn-list.tsx
 ┃ ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┃ ┣ namespace-modal.tsx
 ┃ ┃ ┃ ┃ ┣ network-modal.tsx
 ┃ ┃ ┃ ┃ ┣ qrcode-modal.tsx
 ┃ ┃ ┃ ┃ ┗ wallet-modal.tsx
 ┃ ┃ ┃ ┣ account-box-all.tsx
 ┃ ┃ ┃ ┣ account-box.tsx
 ┃ ┃ ┃ ┣ account-card-bitcoin.tsx
 ┃ ┃ ┃ ┣ account-card-evm.tsx
 ┃ ┃ ┃ ┣ account-card.tsx
 ┃ ┃ ┃ ┣ bip44-selectable.tsx
 ┃ ┃ ┃ ┣ btc-faucet.tsx
 ┃ ┃ ┃ ┣ buy-fiat.tsx
 ┃ ┃ ┃ ┣ dashboard.tsx
 ┃ ┃ ┃ ┣ earning-card.tsx
 ┃ ┃ ┃ ┣ governance-card.tsx
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ my-reward-card.tsx
 ┃ ┃ ┃ ┣ network-error-view-evm.tsx
 ┃ ┃ ┃ ┣ network-error-view.tsx
 ┃ ┃ ┃ ┣ staking-info-card.tsx
 ┃ ┃ ┃ ┣ tokens-bitcoin-card.tsx
 ┃ ┃ ┃ ┣ tokens-card-all.tsx
 ┃ ┃ ┃ ┣ tokens-card.tsx
 ┃ ┃ ┃ ┣ tron-tokens-card.tsx
 ┃ ┃ ┃ ┣ types.d.ts
 ┃ ┃ ┃ ┗ warning-view.tsx
 ┃ ┃ ┣ network
 ┃ ┃ ┃ ┣ add-token-cosmos.tsx
 ┃ ┃ ┃ ┣ add-token-evm.tsx
 ┃ ┃ ┃ ┣ add-token.tsx
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┗ select-network.tsx
 ┃ ┃ ┣ nfts
 ┃ ┃ ┃ ┣ components
 ┃ ┃ ┃ ┃ ┗ nft-item.tsx
 ┃ ┃ ┃ ┣ hooks
 ┃ ┃ ┃ ┃ ┣ __tests__
 ┃ ┃ ┃ ┃ ┃ ┗ useSoulboundNft.spec.ts
 ┃ ┃ ┃ ┃ ┗ useSoulboundNft.ts
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ nft-detail.tsx
 ┃ ┃ ┃ ┗ nfts.tsx
 ┃ ┃ ┣ notifications
 ┃ ┃ ┃ ┗ home.tsx
 ┃ ┃ ┣ onboarding
 ┃ ┃ ┃ ┣ gateway_intro.tsx
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ manage_intro.tsx
 ┃ ┃ ┃ ┣ onboarding.tsx
 ┃ ┃ ┃ ┗ welcome_intro.tsx
 ┃ ┃ ┣ register
 ┃ ┃ ┃ ┣ bip44
 ┃ ┃ ┃ ┃ ┣ advanced-button.tsx
 ┃ ┃ ┃ ┃ ┣ bip44-option.tsx
 ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┣ components
 ┃ ┃ ┃ ┃ ┣ header-welcome.tsx
 ┃ ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┃ ┗ or-text.tsx
 ┃ ┃ ┃ ┣ ledger
 ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┣ mnemonic
 ┃ ┃ ┃ ┃ ┣ backup-mnemonic.tsx
 ┃ ┃ ┃ ┃ ┣ hook.ts
 ┃ ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┃ ┣ new-mnemonic.tsx
 ┃ ┃ ┃ ┃ ┣ recover-mnemonic.tsx
 ┃ ┃ ┃ ┃ ┣ recover-phrase.tsx
 ┃ ┃ ┃ ┃ ┗ verify-mnemonic.tsx
 ┃ ┃ ┃ ┣ done.tsx
 ┃ ┃ ┃ ┣ end.tsx
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ loading-wallet.tsx
 ┃ ┃ ┃ ┣ new-user.tsx
 ┃ ┃ ┃ ┣ not-new-user.tsx
 ┃ ┃ ┃ ┣ owallet-logo.tsx
 ┃ ┃ ┃ ┗ register-pincode.tsx
 ┃ ┃ ┣ send
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ send-btc.tsx
 ┃ ┃ ┃ ┣ send-oasis.tsx
 ┃ ┃ ┃ ┗ send-tron.tsx
 ┃ ┃ ┣ setting
 ┃ ┃ ┃ ┣ components
 ┃ ┃ ┃ ┃ ┣ basic.tsx
 ┃ ┃ ┃ ┃ ┣ country-modal.tsx
 ┃ ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┃ ┣ key-store.tsx
 ┃ ┃ ┃ ┃ ┗ modal.tsx
 ┃ ┃ ┃ ┣ items
 ┃ ┃ ┃ ┃ ┣ biometric-lock.tsx
 ┃ ┃ ┃ ┃ ┣ fiat-currency-setting.tsx
 ┃ ┃ ┃ ┃ ┣ fiat-currency.tsx
 ┃ ┃ ┃ ┃ ┣ remove-account.tsx
 ┃ ┃ ┃ ┃ ┣ switch-mode.tsx
 ┃ ┃ ┃ ┃ ┗ view-private-data.tsx
 ┃ ┃ ┃ ┣ screens
 ┃ ┃ ┃ ┃ ┣ address-book
 ┃ ┃ ┃ ┃ ┃ ┣ add.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┃ ┣ select-account
 ┃ ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┃ ┣ version
 ┃ ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┃ ┗ view-private-data
 ┃ ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ stake
 ┃ ┃ ┃ ┣ components
 ┃ ┃ ┃ ┃ ┣ stake-advance.tsx
 ┃ ┃ ┃ ┃ ┗ validator-item.tsx
 ┃ ┃ ┃ ┣ dashboard
 ┃ ┃ ┃ ┃ ┣ dashboard.tsx
 ┃ ┃ ┃ ┃ ┣ delegations-card.tsx
 ┃ ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┃ ┣ reward-card.tsx
 ┃ ┃ ┃ ┃ ┗ undelegations-card.tsx
 ┃ ┃ ┃ ┣ delegate
 ┃ ┃ ┃ ┃ ┣ delegate-detail.tsx
 ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┣ redelegate
 ┃ ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┃ ┣ modal-validators.tsx
 ┃ ┃ ┃ ┃ ┗ validators-list.tsx
 ┃ ┃ ┃ ┣ undelegate
 ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┣ validator-details
 ┃ ┃ ┃ ┃ ┣ delegated-card.tsx
 ┃ ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┃ ┣ unbonding-card.tsx
 ┃ ┃ ┃ ┃ ┗ validator-details-card.tsx
 ┃ ┃ ┃ ┣ validator-list
 ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ tokens
 ┃ ┃ ┃ ┣ components
 ┃ ┃ ┃ ┃ ┣ token-item-bitcoin.tsx
 ┃ ┃ ┃ ┃ ┗ token-item.tsx
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ token-detail.tsx
 ┃ ┃ ┃ ┗ token.tsx
 ┃ ┃ ┣ transactions
 ┃ ┃ ┃ ┣ components
 ┃ ┃ ┃ ┃ ┣ items
 ┃ ┃ ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┃ ┃ ┣ items.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ transaction-item.tsx
 ┃ ┃ ┃ ┃ ┣ section-title
 ┃ ┃ ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ section-title.tsx
 ┃ ┃ ┃ ┃ ┣ button-filter.tsx
 ┃ ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┃ ┣ item-btn-view-scan.tsx
 ┃ ┃ ┃ ┃ ┣ item-details.tsx
 ┃ ┃ ┃ ┃ ┣ item-divided.tsx
 ┃ ┃ ┃ ┃ ┣ item-received-token.tsx
 ┃ ┃ ┃ ┃ ┣ token-modal.tsx
 ┃ ┃ ┃ ┃ ┣ transaction-box.tsx
 ┃ ┃ ┃ ┃ ┗ type-modal.tsx
 ┃ ┃ ┃ ┣ details.tsx
 ┃ ┃ ┃ ┣ history-transactions-screen.tsx
 ┃ ┃ ┃ ┣ home.tsx
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ news.tsx
 ┃ ┃ ┃ ┣ transaction-detail-screen.tsx
 ┃ ┃ ┃ ┗ types.d.ts
 ┃ ┃ ┣ transfer-nft
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┣ transfer-tokens
 ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┣ transfer-header.tsx
 ┃ ┃ ┃ ┣ transfer-options.tsx
 ┃ ┃ ┃ ┣ transfer-screen.tsx
 ┃ ┃ ┃ ┗ transfer-view-btn.tsx
 ┃ ┃ ┣ tx-result
 ┃ ┃ ┃ ┣ failed.tsx
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ pending.tsx
 ┃ ┃ ┃ ┗ success.tsx
 ┃ ┃ ┣ universal-swap
 ┃ ┃ ┃ ┣ _tests
 ┃ ┃ ┃ ┃ ┗ test-common.ts
 ┃ ┃ ┃ ┣ components
 ┃ ┃ ┃ ┃ ┣ BalanceText.tsx
 ┃ ┃ ┃ ┃ ┣ InputSelectToken.tsx
 ┃ ┃ ┃ ┃ ┗ SwapBox.tsx
 ┃ ┃ ┃ ┣ handler
 ┃ ┃ ┃ ┃ ┗ src
 ┃ ┃ ┃ ┃ ┃ ┣ universal-demos
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ neutaro-ibc-demo.ts
 ┃ ┃ ┃ ┃ ┃ ┃ ┣ noble-ibc-demo.ts
 ┃ ┃ ┃ ┃ ┃ ┃ ┗ offline-wallet.ts
 ┃ ┃ ┃ ┃ ┃ ┣ handler.ts
 ┃ ┃ ┃ ┃ ┃ ┣ helper.ts
 ┃ ┃ ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┃ ┃ ┣ swap-filter.ts
 ┃ ┃ ┃ ┃ ┃ ┣ types.ts
 ┃ ┃ ┃ ┃ ┃ ┗ wrapper.ts
 ┃ ┃ ┃ ┣ modals
 ┃ ┃ ┃ ┃ ┣ SelectNetworkModal.tsx
 ┃ ┃ ┃ ┃ ┣ SelectTokenModal.tsx
 ┃ ┃ ┃ ┃ ┣ SlippageModal.tsx
 ┃ ┃ ┃ ┃ ┗ index.ts
 ┃ ┃ ┃ ┣ wallet
 ┃ ┃ ┃ ┃ ┗ index.ts
 ┃ ┃ ┃ ┣ helpers.ts
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┣ styles.tsx
 ┃ ┃ ┃ ┗ types.ts
 ┃ ┃ ┣ unlock
 ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┗ pincode-unlock.tsx
 ┃ ┃ ┗ web
 ┃ ┃ ┃ ┣ components
 ┃ ┃ ┃ ┃ ┣ context
 ┃ ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┃ ┣ footer-section
 ┃ ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┃ ┣ header
 ┃ ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┃ ┣ section-title
 ┃ ┃ ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ section-title.tsx
 ┃ ┃ ┃ ┃ ┣ switch-tabs
 ┃ ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┃ ┗ webpage-screen
 ┃ ┃ ┃ ┃ ┃ ┣ index.tsx
 ┃ ┃ ┃ ┃ ┃ ┗ screen-options.tsx
 ┃ ┃ ┃ ┣ webpages
 ┃ ┃ ┃ ┃ ┣ dapp.tsx
 ┃ ┃ ┃ ┃ ┗ index.tsx
 ┃ ┃ ┃ ┣ bookmarks.tsx
 ┃ ┃ ┃ ┣ browser.tsx
 ┃ ┃ ┃ ┣ config.ts
 ┃ ┃ ┃ ┗ index.tsx
 ┃ ┣ scripts
 ┃ ┃ ┣ create-sentry-properties.js
 ┃ ┃ ┗ generate-images.js
 ┃ ┣ stores
 ┃ ┃ ┣ app_init
 ┃ ┃ ┃ ┣ index.js
 ┃ ┃ ┃ ┗ init.ts
 ┃ ┃ ┣ browser
 ┃ ┃ ┃ ┣ browser.ts
 ┃ ┃ ┃ ┣ deeplink.ts
 ┃ ┃ ┃ ┗ index.ts
 ┃ ┃ ┣ chain
 ┃ ┃ ┃ ┗ index.ts
 ┃ ┃ ┣ keychain
 ┃ ┃ ┃ ┗ index.ts
 ┃ ┃ ┣ modal
 ┃ ┃ ┃ ┗ index.ts
 ┃ ┃ ┣ notification
 ┃ ┃ ┃ ┗ index.ts
 ┃ ┃ ┣ send
 ┃ ┃ ┃ ┗ index.ts
 ┃ ┃ ┣ txs
 ┃ ┃ ┃ ┣ abstract
 ┃ ┃ ┃ ┃ ┗ txs.ts
 ┃ ┃ ┃ ┣ bitcoin
 ┃ ┃ ┃ ┃ ┣ txs-bitcoin.ts
 ┃ ┃ ┃ ┃ ┣ txs-btc-main.ts
 ┃ ┃ ┃ ┃ ┗ txs-btc-test.ts
 ┃ ┃ ┃ ┣ cosmos
 ┃ ┃ ┃ ┃ ┗ txs-cosmos.ts
 ┃ ┃ ┃ ┣ ethereum
 ┃ ┃ ┃ ┃ ┣ txs-bsc.ts
 ┃ ┃ ┃ ┃ ┣ txs-eth.ts
 ┃ ┃ ┃ ┃ ┣ txs-evm.ts
 ┃ ┃ ┃ ┃ ┣ txs-kawaii.ts
 ┃ ┃ ┃ ┃ ┗ txs-tron.ts
 ┃ ┃ ┃ ┣ helpers
 ┃ ┃ ┃ ┃ ┣ __tests__
 ┃ ┃ ┃ ┃ ┃ ┗ txs-helper.spec.ts
 ┃ ┃ ┃ ┃ ┣ txs-constants.ts
 ┃ ┃ ┃ ┃ ┣ txs-currencies.ts
 ┃ ┃ ┃ ┃ ┣ txs-enums.ts
 ┃ ┃ ┃ ┃ ┣ txs-helper.ts
 ┃ ┃ ┃ ┃ ┗ txs-types.ts
 ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┗ txs-store.ts
 ┃ ┃ ┣ universal_swap
 ┃ ┃ ┃ ┗ index.ts
 ┃ ┃ ┣ index.tsx
 ┃ ┃ ┗ root.tsx
 ┃ ┣ styles
 ┃ ┃ ┣ builder
 ┃ ┃ ┃ ┣ types
 ┃ ┃ ┃ ┃ ┣ all.ts
 ┃ ┃ ┃ ┃ ┣ border.ts
 ┃ ┃ ┃ ┃ ┣ color.ts
 ┃ ┃ ┃ ┃ ┣ common.ts
 ┃ ┃ ┃ ┃ ┣ image.ts
 ┃ ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┃ ┣ layout.ts
 ┃ ┃ ┃ ┃ ┣ margin.ts
 ┃ ┃ ┃ ┃ ┣ opacity.ts
 ┃ ┃ ┃ ┃ ┣ padding.ts
 ┃ ┃ ┃ ┃ ┣ size.ts
 ┃ ┃ ┃ ┃ ┗ text.ts
 ┃ ┃ ┃ ┣ builder.spec.ts
 ┃ ┃ ┃ ┣ builder.ts
 ┃ ┃ ┃ ┣ hook.tsx
 ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┗ utils.ts
 ┃ ┃ ┗ index.tsx
 ┃ ┣ themes
 ┃ ┃ ┣ colors.ts
 ┃ ┃ ┣ fonts.ts
 ┃ ┃ ┣ index.ts
 ┃ ┃ ┣ metrics.ts
 ┃ ┃ ┣ mode-colors.ts
 ┃ ┃ ┣ mode-images.ts
 ┃ ┃ ┣ spacing.ts
 ┃ ┃ ┣ theme-provider.tsx
 ┃ ┃ ┗ typography.ts
 ┃ ┣ utils
 ┃ ┃ ┣ helper
 ┃ ┃ ┃ ┣ index.ts
 ┃ ┃ ┃ ┗ types.d.ts
 ┃ ┃ ┗ ledger
 ┃ ┃ ┃ ┗ index.ts
 ┃ ┣ app.tsx
 ┃ ┣ env.d.ts
 ┃ ┣ navigation.provider.ts
 ┃ ┗ navigation.tsx
 ┣ test
 ┃ ┣ jest.setup.ts
 ┃ ┣ mockFile.ts
 ┃ ┗ setup.ts
 ┣ .detoxrc.json
 ┣ .env.example
 ┣ .eslintrc.js
 ┣ .firebaserc
 ┣ .gitattributes
 ┣ .gitignore
 ┣ .watchmanconfig
 ┣ LICENSE
 ┣ README.md
 ┣ app.json
 ┣ babel.config.js
 ┣ firebase.json
 ┣ index.js
 ┣ init.ts
 ┣ jest.config.js
 ┣ metro.config.js
 ┣ package.json
 ┣ react-native.config.js
 ┣ shim.js
 ┣ tsconfig.json
 ┣ tsconfig.provider.json
 ┗ webpack.config.js

## Install
1. Git clone this repo to desired directory

```shell
git clone https://github.com/oraichain/owallet
```

2. Install required packages

```shell
yarn
```

3. Build necessary packages

```shell
yarn build:libs
```

4. Build provider

```shell
cd packages/mobile && yarn build:provider
```

5. Install Pod for iOS

```shell
cd packages/mobile/ios && pod install
```

6. Run it

Get into packages/mobile and run
- iOS
```shell
yarn ios
```

- Android
```shell
yarn android
```

# Chain integration

## Chain config

| Property        | Type           | Function  |
| ------------- |:-------------:| -----:|
| rpc      | `string` | RPC of a blockchain |
| rest      | `string`      |   LCD of a blockchain |
| chainId      | `string`      |   Chain ID |
| chainName      | `string`      |  Chain Name |
| networkType      | `string`      |  Network Type `("cosmos" or "evm")`: To declare whether the network is Cosmos-based or Ethereum Virtual Machine (EVM)-based  |
| stakeCurrency      | `{coinDenom: string, coinMinimalDenom: string, coinDecimals: number, coinGeckoId: string, coinImageUrl: string, gasPriceStep: { low: number, average: number, high: number}}` | Native stake currency
| bip44      | `{ coinType: number}`      |  Bip44 config |
| coinType      | `number`      |   The coin type is usually 118 for Cosmos, 60 for EVM |
| bech32Config      | `Bech32Address.defaultBech32Config(string)`      |   Config for bech32 address |
| currencies      | `Array<Currency>`      |   Currencies of the chain |
| feeCurrencies      | `Array<Currency>`      |   Fee currencies of the chain |
| features      | `Array<Currency>`      |   To declare what features this chain have`(ex: ["ibc-transfer", "cosmwasm")])` |
| chainSymbolImageUrl      | `string`      |   Chain symbol image URL |
| txExplorer      | `{name: string, txUrl: string, accountUrl: string}` |   Transaction explorer config |


## How to add a chain into OWallet?
1. Clone this repo to desired directory

```shell
git clone https://github.com/oraichain/owallet
```

2. Checkout to main

```shell
git checkout main
```

3. Checkout to new branch

```shell
git checkout -b feat/add-new-chain-config
```

4. Create PR into main

#### If your chain needs to use special packages, please consider taking a look at the [CONTRIBUTING.md](Packages Usage) section to learn how to implement your chain into OWallet

## Example
```shell
{
    rpc: "https://rpc.ankr.com/eth",
    rest: "https://rpc.ankr.com/eth",
    chainId: "0x01",
    chainName: "Ethereum",
    bip44: {
      coinType: 60,
    },
    coinType: 60,
    stakeCurrency: {
      coinDenom: "ETH",
      coinMinimalDenom: "eth",
      coinDecimals: 18,
      coinGeckoId: "ethereum",
      coinImageUrl:
        "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      gasPriceStep: {
        low: 1,
        average: 1.25,
        high: 1.5,
      },
    },
    chainSymbolImageUrl:
      "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    bech32Config: Bech32Address.defaultBech32Config("evmos"),
    networkType: "evm",
    currencies: [
      {
        coinDenom: "ETH",
        coinMinimalDenom: "eth",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      },
      {
        coinDenom: "OCH",
        coinMinimalDenom:
          "erc20:0x19373EcBB4B8cC2253D70F2a246fa299303227Ba:OCH Token",
        contractAddress: "0x19373EcBB4B8cC2253D70F2a246fa299303227Ba",
        coinDecimals: 18,
        coinGeckoId: "och",
        coinImageUrl:
          "https://assets.coingecko.com/coins/images/34236/standard/orchai_logo_white_copy_4x-8_%281%29.png",
      },
      {
        coinDenom: "ORAI",
        coinMinimalDenom:
          "erc20:0x4c11249814f11b9346808179cf06e71ac328c1b5:Oraichain Token",
        contractAddress: "0x4c11249814f11b9346808179cf06e71ac328c1b5",
        coinDecimals: 18,
        coinGeckoId: "oraichain-token",
        coinImageUrl:
          "https://s2.coinmarketcap.com/static/img/coins/64x64/7533.png",
      },
      {
        coinDenom: "ORAIX",
        coinMinimalDenom:
          "erc20:0x2d869aE129e308F94Cc47E66eaefb448CEe0d03e:ORAIX Token",
        contractAddress: "0x2d869aE129e308F94Cc47E66eaefb448CEe0d03e",
        coinDecimals: 18,
        coinGeckoId: "oraidex",
        coinImageUrl: "https://i.ibb.co/VmMJtf7/oraix.png",
      },
    ],
    get feeCurrencies() {
      return [this.stakeCurrency];
    },

    features: ["ibc-go", "stargate", "isEvm"],
    txExplorer: {
      name: "Etherscan",
      txUrl: "https://etherscan.io/tx/{txHash}",
      accountUrl: "https://etherscan.io/address/{address}",
    },
  }
```

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Release
- iOS: https://apps.apple.com/app/owallet/id1626035069
- Android: https://play.google.com/store/apps/details?id=com.io.owallet 
- Chrome extension: https://chrome.google.com/webstore/detail/owallet/hhejbopdnpbjgomhpmegemnjogflenga

## License
```shell
/*
 * Copyright 2022 Oraichain Labs JSC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at

 *      http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 
 * The repository (this work) includes work covered by the following copyright and permission notices:
 *
 *    Copyright 2020 Chainapsis, Inc
 *    Licensed under the Apache License, Version 2.0.
 * 
 * NOTICE: The source code branch of Chainapsis Inc. under Apache 2.0 license:
 *  https://github.com/chainapsis/keplr-wallet/tree/0e137373ac4f526caf97b4694de47fe1ba543bd8
 */
```
Full text: [LICENSE.txt](LICENSE.txt)