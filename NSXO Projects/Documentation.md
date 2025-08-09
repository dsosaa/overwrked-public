---
created: 2025-07-21 06:27:06
---
Of course. Creating documentation to guide an AI coding assistant like Cursor is different from writing documentation for a human. You need to create a **"Project Blueprint"** that is structured, modular, and provides unambiguous instructions that you can feed to the AI step-by-step.

The goal is not to write one giant document and ask Cursor to "build the project." The goal is to create a master plan that _you_ use to direct Cursor through each phase of development, using specific sections as prompts.

Here’s how to structure the documentation for your project.

---

### **1. The Master File: `PROJECT_BLUEPRINT.md`**

Create a central markdown file in the root of your project. This will be your primary instruction manual. You'll use Cursor's `@` feature to reference this file constantly (e.g., `@PROJECT_BLUEPRINT.md`).

Here’s what it should contain:

#### **`PROJECT_BLUEPRINT.md`**

Markdown

```
# Project Blueprint: Enterprise Telegram Bot

## 1. Project Vision & Core Purpose

- **Goal:** An enterprise-grade Telegram bot that turns a channel into a business platform.
- **Key Functions:** Monetization (credits, time, premium content), topic-based admin conversation management, and business analytics.
- **Core Principles:** Scalable, reliable, modular, secure. All interactions should be webhook-based, not polling.

---

## 2. Tech Stack & Key Libraries

- **Language:** Python 3.11+
- **Framework (Webhooks):** Flask / Gunicorn
- **Telegram Library:** `python-telegram-bot[ext]` (version 21.x or higher)
- **Database:** PostgreSQL
- **DB Driver:** `psycopg2-binary`
- **Payments:** Stripe API (`stripe` library)
- **Environment:** `python-dotenv`
- **Deployment:** Docker, Railway

---

## 3. Project Folder Structure

(This tells Cursor where to create new files.)

```

telegram_bot/

├── 📁 src/ # Core application logic

│ ├── init.py

│ ├── bot.py # Main bot handlers and logic

│ ├── database.py # Database connection and queries

│ ├── config.py # Environment variable management

│ ├── error_handler.py # Global error handling

│ ├── cache.py # Caching layer

│ ├── webhook_server.py # Flask/Gunicorn server

│ └── stripe_utils.py # Stripe API functions

├── 📁 scripts/ # One-off scripts (e.g., DB setup)

│ └── setup_db.py

├── 📁 deployment/ # Deployment files

│ └── Dockerfile

├── 📁 docs/ # Project documentation and prompts

│ ├── PROJECT_BLUEPRINT.md # This file

│ └── schema.sql # The database schema

├── .env # Environment variables (DO NOT COMMIT)

├── .gitignore

└── requirements.txt

```

---

## 4. Step-by-Step Build Plan

### Phase 1: Initial Setup
1.  Initialize Git repository.
2.  Create the `.gitignore` file with standard Python and `.env` entries.
3.  Create the full folder structure as defined above.
4.  Create `requirements.txt` with all libraries from the tech stack.

### Phase 2: Database and Configuration
1.  **Create `docs/schema.sql`:** Use the provided SQL schema from our previous discussion.
2.  **Create `src/config.py`:** It must load all necessary environment variables (BOT_TOKEN, ADMIN_GROUP_ID, DATABASE_URL, STRIPE keys) using `python-dotenv` and `os.environ.get()`.
3.  **Create `src/database.py`:**
    -   Implement a `psycopg2` **connection pool**. This is critical.
    -   Create functions for all required CRUD operations (e.g., `get_user`, `update_user_credits`, `create_conversation_topic`, `get_user_id_from_topic`). Each function should acquire a connection from the pool and release it.
4.  **Create `scripts/setup_db.py`:** A script that connects to the database, reads `docs/schema.sql`, and executes it to create the tables.

### Phase 3: Core Bot Logic
1.  **Create `src/bot.py`:**
2.  **Implement User-Facing Commands:**
    -   `/start`: Onboarding flow with a 'Start' button leading to products.
    -   `/balance`: Shows credits/time with a visual progress bar.
    -   `/billing`: Generates a Stripe customer portal link.
    -   Quick-buy commands (`/buy10`).
3.  **Implement Admin Conversation Bridge (`master_message_handler`):**
    -   **Rule 1 (User to Admin):** If message is from a private user chat, find/create their topic in the admin group (using `get_or_create_user_topic`) and forward the message there.
    -   **Rule 2 (Admin to User):** If message is a reply within an admin group topic, look up the `user_id` from the `topic_id` and send a copy of the message to the user. React to the admin's message with ✅ to confirm it was sent.
4.  **Implement Admin User Info Card:** The `send_user_info_card` function should be created and pinned in each new topic.

### Phase 4: Webhook Server & Deployment
1.  **Create `src/webhook_server.py`:**
    -   Set up a Flask application.
    -   Create a `/telegram-webhook` endpoint to receive updates from Telegram and pass them to the bot logic.
    -   Create a `/stripe-webhook` endpoint to handle `checkout.session.completed`, `payment_intent.payment_failed`, etc. It must verify the Stripe signature.
2.  **Create `deployment/Dockerfile`:** Use the Gunicorn command to run the webhook server.

```

---

### **2. Supporting Snippet Files**

Instead of putting all the code in one massive markdown file, create separate files for complex, pre-defined snippets.

- **`docs/schema.sql`**: Create this file and paste the complete SQL schema you've already designed into it. This is non-negotiable and provides a perfect source of truth.
    
- **`deployment/Dockerfile`**: Create this file and paste the complete Dockerfile content.
    

### **3. The Workflow: How to Use This with Cursor**

Now, here is how you use this documentation to direct Cursor:

1. **Open the Project in Cursor:** Open the root `telegram_bot/` folder.
    
2. **Use the Chat Panel (Cmd/Ctrl + L):** Keep the chat panel open.
    
3. **Provide Initial Context:** Start the conversation by referencing your master plan.
    
    > **Your Prompt:** "Hello Cursor. I'm building a Telegram bot based on the plan in `@PROJECT_BLUEPRINT.md`. Let's start with Phase 1. Please create the full folder structure and the `.gitignore` file as defined in the blueprint."
    
4. **Work Iteratively, Phase by Phase:** Do not ask for the whole project at once.
    
    > **Your Next Prompt:** "Great. Now for Phase 2. Using the schema from `@docs/schema.sql` and the plan in `@PROJECT_BLUEPRINT.md`, please create the `src/database.py` file. It must use a psycopg2 connection pool. Please also create the `src/config.py` file to load variables from a `.env` file."
    
5. **Use "Generate in Place" (Cmd/Ctrl + K):** When you have an empty file like `bot.py` open, you can hit Cmd/Ctrl+K to bring up an inline prompt.
    
    > **Inline Prompt in `bot.py`:** "Create the `/start` command handler. It should send a welcome message and a single inline button with the text '▶️ Start' and callback_data 'show_products'. Reference the blueprint in `@PROJECT_BLUEPRINT.md` for context."
    
6. **Refine and Debug:** After Cursor generates code, review it. If it's not quite right, chat with it.
    
    > **Your Prompt:** "The `database.py` file looks good, but can you add error handling with logging to the `execute_query` function in case the database query fails?"
    

By breaking your project down into a structured blueprint and tackling it piece by piece, you can effectively guide Cursor to build your entire application with high accuracy.
# Documentation