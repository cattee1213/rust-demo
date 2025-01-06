use anchor_lang::prelude::*;

declare_id!("2HiBF6TsctiN2qXf7vGNKQ4S1wFNL6znuD1U6nCZaP9T");

#[program]
pub mod solana_hello_world {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
