// Define the function to map the input object dynamically
export function mapToDynamicAction(input: any): { action: string; value: any } {
  // Get the key of the action (e.g., "transfer", "ibc_transfer")
  const action = Object.keys(input)[0]; // Assumes the input object has exactly one key

  if (!action || !input[action]) {
    throw new Error("Invalid input structure");
  }

  return {
    action, // Action key is dynamic
    value: input[action], // Use the corresponding value from the input
  };
}

export function camelCaseToTitleCase(camelCase) {
  return camelCase
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replace(/^./, function (str) {
      return str.toUpperCase();
    });
}
