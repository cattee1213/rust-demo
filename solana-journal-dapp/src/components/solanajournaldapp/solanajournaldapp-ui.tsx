'use client';

import { Keypair, PublicKey } from '@solana/web3.js';
import { useMemo, useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useSolanajournaldappProgram, useSolanajournaldappProgramAccount } from './solanajournaldapp-data-access';
import { useWallet } from '@solana/wallet-adapter-react';

export function SolanajournaldappCreate() {
  const { createEntry, initializeIndex, accounts } = useSolanajournaldappProgram();
  const { publicKey } = useWallet();
  const { accountEntries, queryEntries } = useSolanajournaldappProgramAccount({ account: publicKey as PublicKey });

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const [list, setList] = useState<{ owner: PublicKey; title: string; message: string }[]>([]);

  const isFormValid = title.trim() !== '' && message.trim() !== '';

  const handlerSubmit = () => {
    if (publicKey && isFormValid) {
      if (list.length === 0) {
        handlerInitialize();
      }
      createEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  const handlerInitialize = () => {
    initializeIndex.mutateAsync({});
  };

  const handlerQuery = () => {
    // queryEntries.mutateAsync({}).then((res) => {
    //   console.log(res);
    // });
    console.log(accounts);
    if (accounts.data) {
      let temp: any = [];
      accounts.data.forEach((entry) => {
        temp.push({ owner: entry.account.owner, title: entry.account.title, message: entry.account.message });
      });
      setList(temp as any);
      console.log(list);
    }
  };
  if (!publicKey) {
    return <div>Connect your wallet</div>;
  }

  return (
    <div className='w-full flex'>
      <div className='w-[30%] flex flex-col'>
        <ExplorerLink path={publicKey.toString()} label={publicKey.toString()} />
        <br />
        <div className='text-lg'>我的日志</div>
        {list.map((entry) => (
          <div key={entry.title} className='flex flex-col'>
            <div className='flex-1'>{ellipsify(entry.title, 20)}</div>
          </div>
        ))}
      </div>
      <div className='w-[70%] flex flex-col'>
        <input
          value={title}
          type='text'
          placeholder='title'
          onChange={(e) => setTitle(e.target.value)}
          className='input input-bordered w-full max-w-xs'
        />

        <textarea
          value={message}
          placeholder='message'
          onChange={(e) => setMessage(e.target.value)}
          className='textarea h-24 w-full max-w-xs'
        ></textarea>

        <br />
        <br />

        <button onClick={handlerSubmit} disabled={!isFormValid || createEntry.isPending} className='btn btn-primary'>
          Create Journal Entry {createEntry.isPending && '...'}
        </button>
        <button onClick={handlerQuery} disabled={!publicKey || createEntry.isPending} className='btn btn-primary'>
          Query Journal Entries
        </button>
      </div>
    </div>
  );
}
