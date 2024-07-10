import { gql } from "@apollo/client";
export const Token =
  gql(`query Token($collectionAddr: String!, $tokenId: String!) {
    token(collectionAddr: $collectionAddr, tokenId: $tokenId) {
      __typename
      id
      name
      description
      tokenId
      isExplicit
      media {
        ...MediaFields
        __typename
      }
      collection {
        contractAddress
        contractUri
        name
        startTradingTime
        creator {
          address
          name {
            name
            __typename
          }
          __typename
        }
        minter {
          type
          publicSale {
            endTime
            mintPrice {
              denom
              symbol
              __typename
            }
            __typename
          }
          __typename
        }
        tokenCounts {
          active
          total
          __typename
        }
        mintStatus
        floorPrice
        royaltyInfo {
          sharePercent
          __typename
        }
        __typename
      }
      traits {
        name
        value
        rarityPercent
        rarity
        __typename
      }
      listPrice {
        amount
        denom
        symbol
        __typename
      }
      owner {
        address
        name {
          name
          __typename
        }
        __typename
      }
      reserveFor {
        address
        name {
          name
          __typename
        }
        __typename
      }
      saleType
      expiresAtDateTime
      rarityOrder
      rarityScore
      onlyOwner
      highestOffer {
        type
        id
        offerPrice {
          amount
          denom
          symbol
          __typename
        }
        token {
          id
          tokenId
          collection {
            contractAddress
            __typename
          }
          __typename
        }
        collection {
          contractAddress
          __typename
        }
        from {
          address
          __typename
        }
        __typename
      }
      lastSalePrice {
        amount
        amountUsd
        denom
        symbol
        __typename
      }
      ...LiveAuctionFragment
    }
  }
  
  fragment MediaFields on Media {
    type
    url
    height
    width
    visualAssets {
      xs {
        type
        url
        height
        width
        staticUrl
        __typename
      }
      sm {
        type
        url
        height
        width
        staticUrl
        __typename
      }
      md {
        type
        url
        height
        width
        staticUrl
        __typename
      }
      lg {
        type
        url
        height
        width
        staticUrl
        __typename
      }
      xl {
        type
        url
        height
        width
        staticUrl
        __typename
      }
      __typename
    }
    __typename
  }
  
  fragment LiveAuctionFragment on Token {
    auction {
      duration
      startTime
      endTime
      highestBid {
        id
        type
        offerPrice {
          amount
          denom
          symbol
          __typename
        }
        from {
          address
          name {
            name
            __typename
          }
          __typename
        }
        __typename
      }
      seller {
        address
        name {
          name
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
  `);
