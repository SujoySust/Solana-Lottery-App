"use client"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter, CloverWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { FC, ReactNode, useMemo } from "react";


export const WalletConnectProvider: FC<{ children: ReactNode }> = ({children}) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => {
    if (network == WalletAdapterNetwork.Devnet) {
      return "https://muddy-thrumming-sanctuary.solana-devnet.quiknode.pro/00c946ce37ff09613dda896c01a0e7619c718c33/";
    }
    return clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new CloverWalletAdapter()],
    [network]
  );
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};


