import { ApolloClient, InMemoryCache } from "@apollo/client";
const url = "https://graphql.mainnet.stargaze-apis.com/graphql";
const clientApollo = new ApolloClient({
  uri: url,
  cache: new InMemoryCache(),
});

export default clientApollo;
