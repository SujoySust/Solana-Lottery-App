"use client"
import { WalletConnectProvider } from "./WalletConnectProvider";

function Providers({ children }: React.PropsWithChildren) {
  return <WalletConnectProvider>{children}</WalletConnectProvider>;
}

export default Providers;
