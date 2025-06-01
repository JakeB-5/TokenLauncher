import {useState} from "react";
import {useAccount, usePublicClient, useWalletClient, useWriteContract} from "wagmi";
import TOKEN_FACTORY_ABI from '@shares/abi/TokenFactory.json';
import { TokenFactory } from '@shares/addresses.json'
import {decodeEventLog, parseAbi, parseAbiItem, parseUnits} from "viem";

export function TokenCreator() {
    const { data: walletClient } = useWalletClient();

    const publicClient = usePublicClient();

    const { address } = useAccount();

    const [name, setName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [supply, setSupply] = useState('');
    const [tokenAddress, setTokenAddress] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [createdToken, setCreatedToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { writeContractAsync } = useWriteContract();

    const handleCreateToken = async () => {
        if (!walletClient || !address) return;
        setCreatedToken(null);
        try {
            setStatus('loading');
            const initialSupply = parseUnits(supply, 18);

            const { request } = await publicClient.simulateContract({
                address: TokenFactory,
                abi: TOKEN_FACTORY_ABI.abi,
                functionName: 'createToken',
                args: [name, tokenSymbol, initialSupply],
                account: address,
            });

            const hash = await walletClient.writeContract(request);

            setTxHash(hash);
            const receipt = await publicClient.waitForTransactionReceipt({hash});
            console.log(receipt);
            const logs = await publicClient.getLogs({
                address: TokenFactory,
                fromBlock: receipt.blockNumber,
                toBlock: receipt.blockNumber,
                topics: [
                    '0x6e6ae68e7d7d45fbd855c40d1eaafa8de46c5fbec3ee26f1af88730e400bc92c', // TokenCreated
                ],
            });
            //const receipt = await publicClient.
            console.log(logs);

            const abi = parseAbi([
                'event TokenCreated(address indexed token, address indexed owner, string name, string symbol, uint256 initialSupply)',
            ]);

            for (const log of logs) {
                const event = decodeEventLog({
                    abi,
                    data: log.data,
                    topics: log.topics,
                });
                console.log(event);

                if (event.args.owner.toLowerCase() === address.toLowerCase()) {
                    setCreatedToken(event.args.token);
                    setStatus('success');

                    break;
                }
            }
            console.log(receipt);
            // parse logs to extract TokenCreated event

        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    }
    return (
        <div className="max-w-md mx-auto bg-zinc-900 p-6 rounded-2xl shadow-xl mt-10 border border-zinc-700">
            <h2 className="text-xl font-bold mb-6 text-center text-white">Create Your Token</h2>

            <div className="space-y-4">
                <div>
                    <label htmlFor="tokenName" className="block font-medium">Token Name</label>
                    <input
                        id="tokenName"
                        className="w-full p-2 border rounded"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. MyToken"
                    />
                </div>
                <div>
                    <label className="block font-medium">Symbol</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={tokenSymbol}
                        onChange={(e) => setTokenSymbol(e.target.value)}
                        placeholder="e.g. MYT"
                    />
                </div>
                <div>
                    <label className="block font-medium">Initial Supply</label>
                    <input
                        type="number"
                        className="w-full p-2 border rounded"
                        value={supply}
                        onChange={(e) => setSupply(e.target.value)}
                        placeholder="e.g. 1000000"
                    />
                </div>

                <button
                    className="w-full bg-white text-black hover:bg-gray-200 py-2 rounded"
                    onClick={handleCreateToken}
                    disabled={status === "loading"}
                >
                    {status === "loading" ? "Creating..." : "Create Token"}
                </button>

            </div>

            {status === "success" && tokenAddress && (
                <div className="mt-4 text-green-600">
                    ✅ Token Created! Tx: <code>{tokenAddress}</code>
                </div>
            )}

            {status === "error" && (
                <div className="mt-4 text-red-600">❌ Error creating token</div>
            )}
        </div>
    );
}
