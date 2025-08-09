---
created: 2025-07-15 06:28:32
---

# Cursor Instructions

### **Project Summary for CursorAI**

**Project Goal:** To build a Telegram bot using Python that allows fans to pay for the ability to send me direct messages. The bot will manage payments, track message credits, and provide an admin interface for me to manage the service. It needs to be configurable without changing the code.

**Core Features:**

1. **Payment Integration:** Users purchase message credits or timed chat sessions via Stripe.
    
2. **Credit-Based Messaging:** The bot checks and decrements a user's credit balance for each message sent (with different costs for text, photos, etc.).
    
3. **Two-Way Communication:** Messages from fans are forwarded to me (the admin). My replies in the bot chat are sent back to the correct fan.
    
4. **Dynamic Configuration:** The welcome message, product offerings (prices, amounts), and message costs are stored in a database and are editable via an admin panel within the bot.
    
5. **Admin Panel:** A special `/settings` command allows me to manage the bot's configuration, view stats, and manage users.
    

### **Technology Stack**

- **Language:** Python 3.10+
    
- **Framework/Library:** `python-telegram-bot` (v20+)
    
- **Database:** PostgreSQL
    
- **Payment Processor:** Stripe
    
- **Environment Management:** `python-dotenv`
    

### **File Structure**

The project will have the following file structure:

```
/telegram_bot/
├── .env                  # Stores all secret keys (API tokens, DB URL)
├── .gitignore            # Ignores .env, __pycache__, etc.
├── requirements.txt      # Lists all Python dependencies
├── setup_db.py           # A script to initialize the database schema
└── bot.py                # The main bot application code
```

### **Database Schema (PostgreSQL)**

This is the complete schema required for the project.

```
-- Stores user information and their credit/time balances
CREATE TABLE users (
    telegram_id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    message_credits INT DEFAULT 0,
    time_credits_seconds INT DEFAULT 0,
    is_banned BOOLEAN DEFAULT FALSE
);

-- A key-value store for all configurable bot settings
CREATE TABLE bot_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT NOT NULL
);

-- Initial default settings
INSERT INTO bot_settings (setting_key, setting_value) VALUES
('welcome_message', '👋 Welcome! Buy credits or book a time slot to message me directly.'),
('cost_text_message', '1'),
('cost_photo_message', '3'),
('cost_voice_message', '5'),
('maintenance_mode', 'OFF');

-- Stores the products you sell (credit packs, time blocks)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    stripe_price_id VARCHAR(100) NOT NULL,
    item_type VARCHAR(20) NOT NULL, -- 'credits' or 'time'
    amount INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
```

### **Step-by-Step Prompts for CursorAI Chat**

Here are the exact prompts to use in the Cursor chat window (`Cmd/Ctrl+L`) to build the project.

**Step 1: Project Setup**

> **Prompt 1:** "Create a `requirements.txt` file for a Python project that uses `python-telegram-bot`, `psycopg2-binary`, `python-dotenv`, and `stripe`."
> 
> **Prompt 2:** "Create a `.gitignore` file for a Python project. Make sure to include `.env` and `__pycache__/`."

**Step 2: Database Initialization**

> **Prompt 3 (for `setup_db.py`):** "Using the SQL schema I provided earlier, write the Python code for `setup_db.py`. It should use the `psycopg2` and `dotenv` libraries to connect to the PostgreSQL database using the `DATABASE_URL` from the `.env` file. It should then execute all the `CREATE TABLE` and `INSERT` commands to initialize the database. Wrap the execution in a function called `initialize_database`."

**Step 3: Building `bot.py`**

> **Prompt 4 (Imports & Config):** "In a new file `bot.py`, add all necessary imports for a `python-telegram-bot` (v20+) application, including `os`, `logging`, `psycopg2`, `stripe`, and `ConversationHandler`. Load the environment variables from `.env` using `dotenv` and set up basic logging."

> **Prompt 5 (DB Helpers):** "Create a section for database helper functions in `bot.py`. Generate the following Python functions that connect to the database using `psycopg2` and the `DATABASE_URL`:
> 
> 1. `get_setting(key: str) -> str`
>     
> 2. `set_setting(key: str, value: str)`
>     
> 3. `get_user_credits(user_id: int) -> int` (should create the user with 0 credits if they don't exist)
>     
> 4. `get_active_products() -> list`
>     
> 5. `decrement_user_credits(user_id: int, cost: int) -> int`"
>     

> **Prompt 6 (Admin Panel):** "Generate a `ConversationHandler` named `settings_handler` for the admin panel. It must be triggered by a `/settings` command and restricted to the `ADMIN_CHAT_ID`. It should have states and callback functions to allow the admin to edit the `welcome_message` from the database using the helper functions we defined."

> **Prompt 7 (User Handlers):** "Now, generate the user-facing command handlers:
> 
> 6. An `async def start(update, context)` function that fetches the dynamic welcome message and active products from the database to display to the user.
>     
> 7. An `async def button_handler(update, context)` function that handles callbacks from product buttons. It should parse the product ID from the callback data, fetch the `stripe_price_id` from the database, and generate a Stripe Checkout session link for the user."
>     

> **Prompt 8 (Master Message Handler):** "Generate the `master_message_handler` function. This single function must:
> 
> 8. First, check if the message is a reply from the `ADMIN_CHAT_ID` to a forwarded message. If so, relay the reply to the original user.
>     
> 9. If it's a regular user message, determine the message type (text, photo, voice).
>     
> 10. Fetch the corresponding cost from the `bot_settings` table.
>     
> 11. Check if the user has enough credits.
>     
> 12. If they do, decrement their credits and forward the message to the admin. If not, inform them they have insufficient funds."
>     

> **Prompt 9 (Main Function):** "Finally, generate the `main()` function. This function should initialize the `Application`, add all the handlers we've created (`settings_handler`, `start`, `button_handler`, and `master_message_handler`), and start the bot using `application.run_polling()`."