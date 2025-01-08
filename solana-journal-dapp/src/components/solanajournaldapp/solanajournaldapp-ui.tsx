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
  const { accountQuery } = useSolanajournaldappProgramAccount({
    account: publicKey as PublicKey,
  });

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [list, setList] = useState<
    { owner: PublicKey; title: string; message: string }[]
  >([]);

  const isFormValid = title.trim() !== "" && message.trim() !== "";

  const handlerSubmit = () => {
    createEntry.mutateAsync({ title, message, owner: publicKey });
  };

  const handlerQuery = () => {
    const listTemp = accounts.data?.filter((item) =>
      item.account.owner.equals(publicKey as PublicKey),
    );
    if (listTemp) {
      let temp: any = [];
      listTemp.forEach((entry) => {
        temp.push({
          owner: entry.account.owner,
          title: entry.account.title,
          message: entry.account.message,
        });
      });
      setList(temp);
    }
  };
  if (!publicKey) {
    return <div>Connect your wallet</div>;
  }

  return (
    <div className="w-full flex">
      <div className="w-[30%] flex flex-col">
        <ExplorerLink
          path={publicKey.toString()}
          label={publicKey.toString()}
        />
        <br />
        <div className="text-lg">我的日志</div>
        {list.map((entry) => (
          <div key={entry.title} className="flex flex-col">
            <div className="flex-1">{ellipsify(entry.title, 20)}</div>
          </div>
        ))}
      </div>
      <div className="w-[70%] flex flex-col">
        <input
          value={title}
          type="text"
          placeholder="title"
          onChange={(e) => setTitle(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />

        <textarea
          value={message}
          placeholder="message"
          onChange={(e) => setMessage(e.target.value)}
          className="textarea h-24 w-full max-w-xs"
        ></textarea>

        <br />
        <br />

        <button
          onClick={handlerSubmit}
          disabled={!isFormValid || createEntry.isPending}
          className="btn btn-primary"
        >
          Create Journal Entry {createEntry.isPending && "..."}
        </button>
        <button
          onClick={handlerQuery}
          disabled={!publicKey || createEntry.isPending}
          className="btn btn-primary"
        >
          Query Journal Entries
        </button>
      </div>
    </div>
  );
}
