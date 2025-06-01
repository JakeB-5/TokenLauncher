import './App.css'

import {ConnectButton, RainbowKitProvider} from "@rainbow-me/rainbowkit";
import {WagmiProvider} from "wagmi";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {createAppKit} from "@reown/appkit/react";
import {WagmiAdapter} from "@reown/appkit-adapter-wagmi";
import {arbitrum, hardhat, mainnet, sepolia} from "viem/chains";
import '@rainbow-me/rainbowkit/styles.css';
import {TokenCreator} from "./components/TokenCreator.tsx";

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = '7d7c73d1eccfd900722e5281f12e4222'

// 2. Create a metadata object - optional
const metadata = {
    name: 'TokenLauncher',
    description: 'AppKit Example',
    url: 'http://localhost:5173', // origin must match your domain & subdomain
    icons: ['https://assets.reown.com/reown-profile-pic.png']
}

// 3. Set the networks
const networks = [hardhat, sepolia]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
    networks: [...networks],
    projectId,
    ssr: true,
    autoConnect: true,
});

// 5. Create modal
createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    features: {
        analytics: true // Optional - defaults to your Cloud configuration
    }
})


function App() {
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    <ConnectButton
                        chainStatus="icon"
                        showBalance={false}
                        accountStatus="address"
                    />
                    <TokenCreator/>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default App
