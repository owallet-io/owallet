export class Address {
  static shortAddress(address: string, limitFirst = 10, limitLast = 8): string {
    if (!address) return "...";
    const fristLetter = address?.slice(0, limitFirst) ?? "";
    const lastLetter = address?.slice(-limitLast) ?? "";

    return `${fristLetter}...${lastLetter}`;
  }
}
