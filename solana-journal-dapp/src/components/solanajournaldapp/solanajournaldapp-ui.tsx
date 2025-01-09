'use client';

import { Keypair, PublicKey } from '@solana/web3.js';
import { useMemo, useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useSolanajournaldappProgram, useSolanajournaldappProgramAccount } from './solanajournaldapp-data-access';
import { useWallet } from '@solana/wallet-adapter-react';

export function SolanajournaldappCreate() {
  const { createEntry, accounts } = useSolanajournaldappProgram();
  const { publicKey } = useWallet();
  const { deleteEntry } = useSolanajournaldappProgramAccount({ account: publicKey as PublicKey });

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const isFormValid = title.trim() !== '' && message.trim() !== '';

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
    <div className='w-[600px] h-full flex items-center justify-between gap-[50px] py-[100px]'>
      <div className='flex h-[500px] flex-col items-center gap-[20px]'>
        <input value={title} type='text' placeholder='title' onChange={(e) => setTitle(e.target.value)} className='input input-bordered w-full ' />

        <textarea
          value={message}
          placeholder='message'
          onChange={(e) => setMessage(e.target.value)}
          className='textarea textarea-bordered h-[200px] w-full '
        ></textarea>

        <button onClick={handlerSubmit} disabled={!isFormValid || createEntry.isPending} className='btn btn-primary w-full'>
          Create Journal Entry {createEntry.isPending && '...'}
        </button>
      </div>
      <div className='flex h-[500px] flex-col'>
        {accounts.data
          ?.filter((item) => item.account.owner.equals(publicKey as PublicKey))
          .map((entry, index) => (
            <div key={entry.account.title} className='flex items-center justify-between gap-[10px]'>
              <div
                className='w-[150px] text-ellipsis whitespace-nowrap overflow-hidden bg-slate-300 p-2 text-center my-[5px] rounded-lg'
                style={{ filter: `hue-rotate(${index * 30}deg)` }}
              >
                {entry.account.title}
              </div>
              <div
                onClick={() => handlerDelete(entry.account.title)}
                className={`w-[80px]  text-white p-2 rounded-md text-center ${
                  deleteEntry.isPending ? 'cursor-not-allowed bg-slate-300' : 'cursor-pointer bg-red-400'
                }`}
              >
                {deleteEntry.isPending ? '...' : 'delete'}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
