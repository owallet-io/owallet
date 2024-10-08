import { gql } from "@apollo/client";
export const CollectionCounts = gql`
  query CollectionCounts(
    $filterForSale: SaleType
    $owner: String
    $seller: String
    $limit: Int
    $offset: Int
  ) {
    collectionCounts(
      filterForSale: $filterForSale
      owner: $owner
      seller: $seller
      limit: $limit
      offset: $offset
    ) {
      collectionCounts {
        count
        collection {
          contractAddress
          contractUri
          name
          media {
            ...MediaFields
            __typename
          }
          __typename
        }
        __typename
      }
      pageInfo {
        total
        offset
        limit
        __typename
      }
      __typename
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
`;
