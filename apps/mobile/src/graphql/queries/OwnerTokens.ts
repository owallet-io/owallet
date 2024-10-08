import { gql } from "@apollo/client";

export const OwnedTokens = gql(`
    query OwnedTokens(
  $owner: String,
  $seller: String,
  $limit: Int,
  $offset: Int,
  $filterByCollectionAddrs: [String!],
  $filterForSale: SaleType,
  $sortBy: TokenSort
) {
  tokens(
    ownerAddrOrName: $owner,
    sellerAddrOrName: $seller,
    limit: $limit,
    offset: $offset,
    filterForSale: $filterForSale,
    filterByCollectionAddrs: $filterByCollectionAddrs,
    sortBy: $sortBy
  ) {
    tokens {
      id
      tokenId
      name
      rarityOrder
      rarityScore
      mintedAt
      saleType
      ...DynamicProfileToken
      media {
        ...MediaFields
        __typename
      }
      collection {
        ...TokenCollectionFields
        __typename
      }
      __typename
    }
    pageInfo {
      total
      limit
      offset
      __typename
    }
    __typename
  }
}

fragment DynamicProfileToken on Token {
  id
  owner {
    address
    __typename
  }
  listPrice {
    amount
    denom
    symbol
    __typename
  }
  listedAt
  expiresAtDateTime
  highestOffer {
    id
    offerPrice {
      amount
      amountUsd
      denom
      symbol
      __typename
    }
    __typename
  }
  __typename
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

fragment TokenCollectionFields on Collection {
  __typename
  contractAddress
  contractUri
  name
  isExplicit
  floorPrice
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
}
`);
