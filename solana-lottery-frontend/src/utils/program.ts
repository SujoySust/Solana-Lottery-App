import { AnchorProvider, BN, Idl, Program } from "@project-serum/anchor";
import { AnchorWallet, Wallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { LOTTERY_SEED, MASTER_SEED, PROGRAM_ID, TICKET_SEED } from "./constant";
import IDL from "./idl.json";

// How to fetch our Program
export const getProgram = (connection: Connection, wallet: AnchorWallet) => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const idl = <Idl>IDL;
  const program = new Program(idl, PROGRAM_ID, provider);
  return program;
};

export const getMasterAddress = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MASTER_SEED)],
    PROGRAM_ID
  )[0];
};

export const getLotteryAddress = async (id: number) => {
  return (
    PublicKey.findProgramAddressSync(
      [Buffer.from(LOTTERY_SEED), new BN(id).toArrayLike(Buffer, "le", 4)],
      PROGRAM_ID
    )
  )[0];
};

export const getTicketAddress = async (lotteryPk: any, id: number) => {
  return (
    PublicKey.findProgramAddressSync(
      [
        Buffer.from(TICKET_SEED),
        lotteryPk.toBuffer(),
        new BN(id).toArrayLike(Buffer, "le", 4),
      ],
      PROGRAM_ID
    )
  )[0];
};
