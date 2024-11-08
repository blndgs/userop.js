import { ethers } from "ethers";
import axios from "axios";

export class BundlerJsonRpcProvider extends ethers.providers.JsonRpcProvider {
  /**
   * @type {ethers.providers.JsonRpcProvider | undefined} A JsonRpcProvider instance for the bundler.
   * @private
   */
  private bundlerRpc?: ethers.providers.JsonRpcProvider;
  private bundlerMethods = new Set([
    "eth_sendUserOperation",
    "eth_estimateUserOperationGas",
    "eth_getUserOperationByHash",
    "eth_getUserOperationReceipt",
    "eth_supportedEntryPoints",
  ]);

  /**
   * @type {string} User-Agent string for identifying requests.
   * @private
   */
  private userAgent: string;

  /**
   * Initializes the BundlerJsonRpcProvider with a given RPC URL and User-Agent.
   * 
   * @param {string} rpcUrl - The URL of the RPC endpoint.
   * @param {string} userAgent - The User-Agent string for HTTP headers.
   */
  constructor(rpcUrl: string, userAgent: string) {
    super(rpcUrl);
    this.userAgent = userAgent;
  }

  /**
   * Sets the bundler RPC URL and initializes a new JsonRpcProvider for the bundler.
   * 
   * @param {string | undefined} bundlerRpc - The RPC URL for the bundler. If not provided, the bundler RPC will not be set.
   * @returns {BundlerJsonRpcProvider} The instance of the provider, allowing method chaining.
   */
  setBundlerRpc(bundlerRpc?: string): BundlerJsonRpcProvider {
    if (bundlerRpc) {
      this.bundlerRpc = new ethers.providers.JsonRpcProvider(bundlerRpc);
    }
    return this;
  }

 /**
   * Internal method to make a JSON-RPC request with a custom User-Agent header.
   * Overrides the default fetchJson behavior in JsonRpcProvider to add specific HTTP headers.
   * 
   * This method is intended for internal use within JsonRpcProvider and should not be called directly.
   * 
   * @param {string} connection - The URL of the RPC connection.
   * @param {string} json - The JSON-RPC payload to be sent.
   * @returns {Promise<any>} A promise that resolves to the response data from the RPC request.
   * @throws Will throw an error if the RPC request fails.
   * @private
   */
  async fetchJson(connection: string, json: string): Promise<any> {
    const customAxios = axios.create({
      headers: { "User-Agent": this.userAgent, "Content-Type": "application/json" },
    });

    try {
      const response = await customAxios.post(connection, json);
      return response.data;
    } catch (error) {
      throw new Error(`RPC request failed: ${error}`);
    }
  }

  /**
   * Sends a JSON-RPC request. If the method is a bundler-specific method, it uses the bundler RPC.
   * Otherwise, it falls back to the parent provider's send method.
   * 
   * @param {string} method - The JSON-RPC method to be called.
   * @param {any[]} params - The parameters for the JSON-RPC method.
   * @returns {Promise<any>} A promise that resolves to the result of the RPC call.
   */
  send(method: string, params: any[]): Promise<any> {
    if (this.bundlerRpc && this.bundlerMethods.has(method)) {
      return this.bundlerRpc.send(method, params);
    }

    return super.send(method, params);
  }
}
