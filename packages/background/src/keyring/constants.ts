export const ROUTE = "keyring";
export const ETHEREUM_BASE_FEE = 1000000000;
export const TYPED_MESSAGE_SCHEMA = {
  type: "object",
  properties: {
    types: {
      type: "object",
      additionalProperties: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            type: { type: "string" },
          },
          required: ["name", "type"],
        },
      },
    },
    primaryType: { type: "string" },
    domain: { type: "object" },
    message: { type: "object" },
  },
  required: ["types", "primaryType", "domain", "message"],
};
