export type BtcBalances = Utxos[];

export interface Utxos {
  txid: string;
  vout: number;
  status: Status;
  value: number;
}
export interface UtxosWithNonWitness extends Utxos {
  nonWitnessUtxo?: any; // For non-SegWit UTXOs (Legacy addresses)
}
export interface UtxosWithWitness extends Utxos {
  witnessUtxo?: {
    script: any;
    value: number;
  };
}

export interface Status {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
}

export interface IFeeHistory {
  "16": number;
  "25": number;
  "14": number;
  "144": number;
  "504": number;
  "22": number;
  "6": number;
  "8": number;
  "10": number;
  "11": number;
  "18": number;
  "20": number;
  "23": number;
  "7": number;
  "15": number;
  "21": number;
  "24": number;
  "3": number;
  "1008": number;
  "5": number;
  "19": number;
  "12": number;
  "9": number;
  "4": number;
  "17": number;
  "1": number;
  "2": number;
  "13": number;
}
