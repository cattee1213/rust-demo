use anchor_lang::prelude::*;

declare_id!("GkfhJkLBLMzjgxSud1YqNcFNwa71mQWT2rFxdqgZb1v5");

#[program]
pub mod solanajournaldapp {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateEntry>,
        title: String,
        message: String,
    ) -> Result<()> {
        msg!("Creating a new journal entry");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title.clone();
        journal_entry.message = message;

        // 给 journal_index 添加新的条目
        let journal_index = &mut ctx.accounts.journal_index;
        journal_index.entries.push(JournalEntryState {
            owner: journal_entry.owner,
            title: journal_entry.title.clone(),
            message: journal_entry.message.clone(),
        });

        Ok(())
    }

    pub fn initialize_journal_index(ctx: Context<Initialize>) -> Result<()> {
        let journal_index = &mut ctx.accounts.journal_index;
        journal_index.entries = Vec::new();
        Ok(())
    }

    pub fn query_journal_entries(ctx: Context<QueryEntries>) -> Result<Vec<JournalEntryState>> {
        msg!(
            "Querying journal entries for owner: {}",
            ctx.accounts.owner.key()
        );
        msg!("Entries: {:?}", &ctx.accounts.journal_index.entries); // 添加日志信息
        let journal_index = &ctx.accounts.journal_index;
        Ok(journal_index.entries.clone())
    }

    pub fn update_journal_entry(
        ctx: Context<UpdateEntry>,
        title: String,
        message: String,
    ) -> Result<()> {
        msg!("Updating a journal entry");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = message;

        Ok(())
    }

    pub fn delete_journal_entry(ctx: Context<DeleteEntry>, title: String) -> Result<()> {
        msg!("Deleting a journal entry");
        msg!("Title: {}", title);

        let journal_index = &mut ctx.accounts.journal_index;
        journal_index.entries.retain(|entry| &entry.title != &title);

        // 如果 journal_index 为空，则关闭它
        if journal_index.entries.is_empty() {
            let journal_index_info = ctx.accounts.journal_index.to_account_info();
            **ctx.accounts.owner.lamports.borrow_mut() += journal_index_info.lamports();
            **journal_index_info.lamports.borrow_mut() = 0;
            journal_index_info.data.borrow_mut().fill(0);
        }
        Ok(())
    }
}

#[account]
#[derive(InitSpace, Debug)]
pub struct JournalEntryState {
    pub owner: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub message: String,
}

#[account]
#[derive(InitSpace)]
pub struct JournalIndex {
    #[max_len(100 * 40)]
    pub entries: Vec<JournalEntryState>,
}

#[derive(Accounts)]
#[instruction(title:String,message:String)]
pub struct CreateEntry<'info> {
    #[account(init_if_needed,seeds=[title.as_bytes(),owner.key().as_ref()],bump, payer=owner,space=8+JournalEntryState::INIT_SPACE)]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut, seeds = [b"index", owner.key().as_ref()], bump)]
    pub journal_index: Account<'info, JournalIndex>,
    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title:String,message:String)]
pub struct UpdateEntry<'info> {
    #[account(mut,seeds=[title.as_bytes(),owner.key().as_ref()],bump,
    realloc = 8 + 32 + 1 + 4 +title.len() + 4 +message.len(),
    realloc::payer=owner,
    realloc::zero = true
)]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title:String)]
pub struct DeleteEntry<'info> {
    #[account(mut,seeds=[title.as_bytes(),owner.key().as_ref()],bump,close=owner)]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut, seeds = [b"index", owner.key().as_ref()], bump)]
    pub journal_index: Account<'info, JournalIndex>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, seeds = [b"index", owner.key().as_ref()], bump, payer = owner, space = 8 + JournalIndex::INIT_SPACE)]
    pub journal_index: Account<'info, JournalIndex>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct QueryEntries<'info> {
    #[account(seeds = [b"index", owner.key().as_ref()], bump)]
    pub journal_index: Account<'info, JournalIndex>,
    #[account(mut)]
    pub owner: Signer<'info>,
}
