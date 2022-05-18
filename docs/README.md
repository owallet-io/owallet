---
title: Introduction
description: OWallet is a non-custodial blockchain wallets for webpages that allow users to interact with blockchain applications.
footer:
  newsletter: false
aside: true
order: 1
---

# Oraichain wallet Documentation

## Introduction

OWallet is a non-custodial blockchain wallets for webpages that allow users to interact with blockchain applications.

## Why OWallet?

- Private keys are stored locally. This removes the friction and risk of webpages having to manage user private keys safely and securely.
- As the user's private key is not managed by the website, users do not have to worry about the level of security of the website. The user only has to trust the security guarantees of OWallet, and freely interact with various web applications as they wish (and verify the contents of the transaction).
- OWallet can easily connect to libraries such as CosmJS, simplifying the process of connecting webpages to blockchains.

## Sections
[Integrate with OWallet](./api) describes how to integrate with OWallet in the webpage.  

[Use with cosmjs](./api/cosmjs.md) describes how to use cosmjs with OWallet.

[Use with secretjs](./api/secretjs.md) describes how to use secretjs with OWallet if you need to use secret-wasm feature.
  
[Suggest chain](./api/suggest-chain.md) describes how to suggest the chain to OWallet if the chain is not supported natively in OWallet.
