import { useEffect, useState } from "react";
import { useWalletConnect } from "./useWalletConnect";
import {
  getLotteryAddress,
  getMasterAddress,
  getTicketAddress,
  getTotalPrice,
} from "@/utils/program";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { Address, BN, Idl, Program } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { confirmTx } from "@/utils/helper";
import toast from "react-hot-toast";

export const useLottery = () => {
  const [masterAddress, setMasterAddress] = useState<Address>("");
  const [lotteryAddress, setLotteryAddress] = useState<Address>();
  const [userWinningId, setUserWinningId] = useState<number | undefined>();

  const [lottery, setLottery] = useState<any>();

  const [lotteryId, setLotteryId] = useState<number>(0);

  const [intialized, setIntialized] = useState(false);

  const { wallet, connection, program } = useWalletConnect();

  useEffect(() => {
    updateState();
  }, [program]);

  const getPot = async () => {
    return getTotalPrice(lottery);
  }

  const getPlayers = async (lottery: any) => {
    return [lottery.lastTicketId];
  }

  const updateState = async () => {
    if (!program) return;

    try {
      if (!masterAddress) {
        const masterAddress = getMasterAddress();
        setMasterAddress(masterAddress);
      }
      const master = await program.account.master.fetch(
        masterAddress ?? getMasterAddress()
      );

      setIntialized(false);
      setLotteryId(master.lastId);

      const lotteryAddress = await getLotteryAddress(master.lastid);
      setLotteryAddress(lotteryAddress);

      const lottery = await program.account.lottery.fetch(lotteryAddress);
      setLottery(lottery);

      if (!wallet?.publicKey) return;

      const userTickets = await program.account.ticket.all([
        {
          memcmp: {
            bytes: bs58.encode(new BN(lotteryId).toArrayLike(Buffer, "le", 4)),
            offset: 12,
          },
        },
        {
          memcmp: {
            bytes: wallet.publicKey.toBase58(),
            offset: 16,
          },
        },
      ]);

      // Check whether any of the user tickets win
      const userWin = userTickets.some(
        (t) => t.account.id == lottery.winner_id
      );
      if (userWin) {
        setUserWinningId(lottery.winnerId);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const initMaster = async () => {
    try {
      const txHash = await program?.methods
        .initMaster()
        .accounts({
          master: masterAddress,
          payer: wallet?.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      if (txHash) {
        await confirmTx(txHash, connection);
        updateState();
        toast.success("Initialized Master");
      }
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const createLottery = async () => {
    try {
      const lotteryAddress = await getLotteryAddress(lotteryId + 1);
      const txHash = await program?.methods
        .createLottery(new BN(5).mul(new BN(LAMPORTS_PER_SOL)))
        .accounts({
          lottery: lotteryAddress,
          master: masterAddress,
          authority: wallet?.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      if (txHash) {
        confirmTx(txHash, connection);
        updateState();
        toast.success("Lottery Created!");
      }
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const buyTicket = async (lotteryId: number) => {
    try {
      const txHash = await program?.methods
        .buyTicket(lotteryId)
        .accounts({
          lottery: lotteryAddress,
          ticket: await getTicketAddress(
            lotteryAddress,
            lottery.lastTicketId + 1
          ),
          buyer: wallet?.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      if (txHash) {
        confirmTx(txHash, connection);
        toast.success("Bought a Ticket!");
        updateState();
      }
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const pickWinner = async (lotteryId: number) => {
    try {
      const txHash = await program?.methods
        .pickWinner(lotteryId)
        .accounts({
          lottery: lotteryAddress,
          authority: wallet?.publicKey,
        })
        .rpc();

      if (txHash) {
        await confirmTx(txHash, connection);
        updateState();
        toast.success("Picked winner!");
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const claimPrice = async (lotteryId: number, userWinnerId: number) => {
    try {
      const txHash = await program?.methods
        .claimPrize(lotteryId, userWinnerId)
        .accounts({
          lottery: lotteryAddress,
          ticket: await getTicketAddress(lotteryAddress, userWinnerId),
          authority: wallet?.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

        if (txHash) {
            confirmTx(txHash, connection);
            updateState();
            toast.success("The Winner has claimed the prize!!")
        }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return {
    updateState,
    getPot,
    getPlayers,
    initMaster,
    createLottery,
    buyTicket,
    pickWinner,
    claimPrice,
  };
};
