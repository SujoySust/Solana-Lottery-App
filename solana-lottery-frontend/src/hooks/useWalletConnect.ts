import { mockWallet } from "@/utils/helper";
import { getProgram } from "@/utils/program";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

export const useWalletConnect = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const program = useMemo(() => {
      if (connection && wallet) {
        return getProgram(connection, wallet);
      }
    }, [connection, wallet]);

    return {wallet, connection, program};
}