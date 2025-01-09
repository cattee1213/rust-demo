"use client";

import { Keypair, PublicKey } from "@solana/web3.js";
import { useMemo, useState } from "react";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  useSolanajournaldappProgram,
  useSolanajournaldappProgramAccount,
} from "./solanajournaldapp-data-access";
import { useWallet } from "@solana/wallet-adapter-react";

export function SolanajournaldappCreate() {
  const { createEntry, accounts } = useSolanajournaldappProgram();
  const { publicKey } = useWallet();
  const { deleteEntry } = useSolanajournaldappProgramAccount({
    account: publicKey as PublicKey,
  });

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const isFormValid = title.trim() !== "" && message.trim() !== "";

  const handlerSubmit = () => {
    createEntry.mutateAsync({ title, message, owner: publicKey });
  };

  const handlerDelete = (title: string) => {
    deleteEntry.mutateAsync(title);
  };

  if (!publicKey) {
    return <div>Connect your wallet</div>;
  }
  return (
    <div className="w-[600px] h-full flex items-center justify-between gap-[50px] py-[100px]">
      <div className="flex w-[300px] h-[500px] flex-col items-center gap-[20px]">
        <input
          value={title}
          type="text"
          placeholder="title"
          onChange={(e) => setTitle(e.target.value)}
          className="w-full shadow-md p-4 outline-none rounded-md"
        />

        <textarea
          value={message}
          placeholder="message"
          onChange={(e) => setMessage(e.target.value)}
          className="textarea textarea-bordered h-[200px] w-full "
        ></textarea>

        <button
          onClick={handlerSubmit}
          disabled={!isFormValid || createEntry.isPending}
          className="btn btn-primary w-full"
        >
          Create Journal Entry {createEntry.isPending && "..."}
        </button>
      </div>
      <div className="flex h-[500px] flex-col gap-[15px]">
        {accounts.data
          ?.filter((item) => item.account.owner.equals(publicKey as PublicKey))
          .sort(
            (a, b) => Number(b.account.timestamp) - Number(a.account.timestamp),
          )
          .map((entry, index) => (
            <div
              key={entry.publicKey.toString()}
              className="flex items-center justify-between gap-[10px]"
            >
              <div className="w-[150px]   relative">
                <div
                  className="w-full bg-slate-300 p-2  rounded-lg text-ellipsis whitespace-nowrap overflow-hidden"
                  style={{ filter: `hue-rotate(${Math.random() * 360}deg)` }}
                >
                  {entry.account.title}
                </div>

                <div
                  onClick={() => handlerDelete(entry.account.title)}
                  className={`z-2 absolute right-[-10px] top-[-10px] w-[20px] h-[20px]  text-white p-2 flex justify-center items-center rounded-[50%]  ${
                    deleteEntry.isPending
                      ? "cursor-not-allowed bg-slate-300"
                      : "cursor-pointer bg-red-400"
                  }`}
                >
                  {deleteEntry.isPending ? "..." : "-"}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
