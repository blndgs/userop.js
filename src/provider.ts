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
   * Internal method to send JSON-RPC requests with custom headers.
   * 
   * @param {string} method - The JSON-RPC method to be called.
   * @param {any[]} params - The parameters for the JSON-RPC method.
   * @returns {Promise<any>} A promise that resolves to the result of the RPC call.
   * @throws {Error} When the RPC request fails.
   * @private
   */
  async _send(method: string, params: any[]): Promise<any> {
    const request = {
      method: "POST",
      url: this.connection.url,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": this.userAgent
      },
      data: JSON.stringify({
        method,
        params,
        id: (new Date()).getTime(),
        jsonrpc: "2.0"
      })
    };

    try {
      const response = await axios(request);
      return response.data.result;
    } catch (error) {
      throw new Error(`RPC request failed: ${error}`);
    }
  }

  /**
   * Sends a JSON-RPC request, routing bundler-specific methods to the bundler RPC if configured.
   * 
   * @param {string} method - The JSON-RPC method to be called.
   * @param {any[]} params - The parameters for the JSON-RPC method.
   * @returns {Promise<any>} A promise that resolves to the result of the RPC call.
   */
  async send(method: string, params: any[]): Promise<any> {
    if (this.bundlerRpc && this.bundlerMethods.has(method)) {
      return this.bundlerRpc.send(method, params);
    }
    return this._send(method, params);
  }
}