/**
 * Transaction call data for prepared transactions
 */
export interface TransactionCall {
  to: string;
  data: string;
  value: string;
}

/**
 * Prepared transaction response from the agent
 */
export interface TransactionPrepared {
  type: "TRANSACTION_PREPARED";
  description: string;
  calls: TransactionCall[];
  metadata: {
    tokenAddress: string;
    amount: string;
    destinationAddress: string;
    tokenName?: string;
    tokenDecimals?: number;
  };
}

/**
 * Request type for agent API
 */
export type AgentRequest = {
  userMessage: string;
  walletAddress?: string;
};

/**
 * Response type for agent API
 */
export type AgentResponse = {
  response?: string;
  error?: string;
  transaction?: TransactionPrepared;
};
