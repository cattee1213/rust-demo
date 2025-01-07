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
  const { createEntry } = useSolanajournaldappProgram();
  const { publicKey } = useWallet();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const isFormValid = title.trim() !== "" && message.trim() !== "";

  const handlerSubmit = () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return <div>Connect your wallet</div>;
  }

  return (
    <>
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
    </>
  );
}
