---
created: 2025-07-21 05:44:42
---


### **Module 1: Project Overview & Features**

This module provides a high-level vision for the project, detailing its core purpose, features, and underlying architecture.

#### **1.1 Project Vision**

This project is an **enterprise-grade Telegram bot** engineered to transform a Telegram channel into a **comprehensive business and communication platform** for creators and businesses. It functions as a complete premium messaging service, integrating a sophisticated monetization engine that supports a smart credit system, time-based sessions, pay-to-unlock premium content, and automated auto-recharge subscriptions.

The system revolutionizes admin-user communication through a **topic-based conversation management system**, where each user is given a dedicated, persistent thread in a private admin group, ensuring organized, context-rich support. Beyond simple messaging, the bot acts as a **business intelligence platform**, providing advanced analytics on revenue, user engagement, and content performance, allowing for data-driven decisions to optimize pricing and maximize profit. The entire service is built for **scalability and reliability**, featuring a high-performance backend with database connection pooling, a caching layer, and robust global error handling to deliver a seamless experience for both users and administrators.

#### **1.2 Key Features**

- **Monetization Engine**:
    
    - **Stripe Integration**: Secure, PCI-compliant payment processing with extensive webhook automation for reliability.
        
    - **Smart Credit & Time System**: Users can purchase consumable credits (with configurable costs for text, photo, and voice) or time-based sessions for unlimited messaging.
        
    - **Premium Content**: Sell access to individual locked media files with custom pricing.
        
    - **Auto-Recharge**: Users can opt-in for automatic credit top-ups using saved payment methods.
        
    - **Quick-Buy Commands**: Instant purchase commands like `/buy10` for returning users.
        
- **Admin & Management**:
    
    - **Advanced Admin Panel**: A full-featured dashboard for user management, analytics, and dynamic bot configuration, accessible directly within Telegram.
        
    - **Topic-Based Conversation Management**: Each user is assigned a dedicated conversation thread in a private admin group, eliminating chat clutter and preserving context.
        
    - **Team Collaboration Tools**: The architecture supports multi-admin roles, permissions, and topic assignments for team-based management.
        
- **User Experience**:
    
    - **Rich Visual UX**: The bot utilizes visual progress bars for credit visualization, read receipts, and typing indicators.
        
    - **Self-Service Portal**: A `/billing` command gives users access to a Stripe portal to manage their saved payment methods.
        
    - **Smart Notifications**: The bot sends automated warnings for low credit balances and expiring time sessions.
        

#### **1.3 System Architecture Diagram**

This diagram illustrates the high-level components and data flow. The bot application is the central hub connecting Telegram, the database, and the payment processor.

Code snippet

```
graph TD
    subgraph "Internet"
        U[👤 Fan on Telegram App]
        S[💳 Stripe API]
    end

    subgraph "Your Hosting (e.g., Railway)"
        B(🤖 Your Bot Application <br> Python / python-telegram-bot)
        DB[(🗄️ PostgreSQL Database)]
    end

    T[Telegram API]

    U --> T
    T -- Webhook --> B
    B -- Telegram API Calls --> T
    B <--> DB
    B -- Create Session / Handle Webhook --> S
```

---

### **Module 2: Development Environment & Workflow**

This module provides a detailed, step-by-step guide to setting up your local development environment and establishing a professional workflow. Following these practices is crucial for ensuring code quality, security, and maintainability.

---

### **2.1 Folder Organization**

A clean, hierarchical structure separates concerns and makes the project easier to navigate and maintain.

#### **Implementation Details**

1. **Create the Project Structure**: In your terminal, create the following directories. This layout ensures that your core application logic is decoupled from scripts and deployment configurations.
    
    ```
    telegram_bot/
    ├── 📁 src/
    ├── 📁 scripts/
    ├── 📁 deployment/
    ├── 📁 docs/
    ├── .env
    ├── requirements.txt
    ```
    
2. **Directory Purpose**:
    
    - **`src/`**: Contains all core Python application code (`bot.py`, `database.py`, etc.). This separation makes the logic modular and testable.
        
    - **`scripts/`**: Holds utility scripts that are run manually, such as the initial database setup script (`setup_db.py`).
        
    - **`deployment/`**: Contains infrastructure and deployment configurations, like the `Dockerfile` and `railway.json` file.
        
    - **`docs/`**: All project documentation and guides reside here.
        

---

### **2.2 Version Control & Branching Strategy**

The project uses a **GitFlow-inspired** branching strategy for organized and safe development, protected by automated quality and security checks.

#### **Step 1: Initialize the Git Repository**

1. **Initialize Git**: Navigate to your project's root directory and initialize a new Git repository.
    
    Bash
    
    ```
    cd telegram_bot
    git init
    ```
    
2. **Create `.gitignore`**: Create a `.gitignore` file in the root directory. This is critical for preventing sensitive files like `.env` and unnecessary files like `__pycache__` from being committed.
    
3. **Initial Commit**: Make your initial commit to establish the main branch.
    
    Bash
    
    ```
    git add .
    git commit -m "Initial commit: project structure setup"
    ```
    
4. **Create `development` Branch**: Create the primary integration branch from `main`.
    
    Bash
    
    ```
    git checkout -b development
    ```
    

#### **Step 2: Implement the Branching Workflow**

- **`main`**: This branch holds production-ready, stable code. It should be protected, and code should only be merged into it from the `development` branch during a release.
    
- **`development`**: This is the primary branch for ongoing work. All completed features are merged into this branch.
    
- **`feature/*`**: When starting a new feature, create a branch from `development` (e.g., `git checkout -b feature/new-admin-panel`). Once complete, it is merged back into `development`.
    
- **`hotfix/*`**: For urgent production bugs, create a branch from `main` (e.g., `git checkout -b hotfix/payment-bug`). Once the fix is complete, it must be merged into both `main` and `development`.
    

#### **Step 3: Enforce Commit Message Standards**

All commits must follow the **Conventional Commits** standard for a clear and automated version history.

- **Format**: `<type>(<scope>): <description>`
    
- **Types**:
    
    - `feat`: A new feature.
        
    - `fix`: A bug fix.
        
    - `docs`: Documentation changes.
        
    - `refactor`: Code changes that neither fix a bug nor add a feature.
        
    - `chore`: Changes to the build process or auxiliary tools.
        
- **Example**: `git commit -m "feat(payments): add auto-recharge functionality"`
    

#### **Step 4: Set Up Pre-commit Hooks**

The repository should be protected by **pre-commit hooks** that automatically check your code _before_ a commit is finalized. This prevents errors and accidental secret leaks.

- **Setup**: This is typically done using the `pre-commit` framework. You would create a `.pre-commit-config.yaml` file in your root directory.
    
- **Checks**: The hooks are configured to perform the following automated checks on every commit:
    
    - **Secret Detection**: Prevents API keys and tokens from being committed.
        
    - **Syntax Validation**: Ensures all Python files are valid.
        
    - **Environment Protection**: Prevents `.env` files from being committed.

---

### **Module 3: The Build: Step-by-Step Implementation**

This section provides a detailed, step-by-step guide to building the bot's core components.

---

### **Step 1: Database Schema & Setup**

This step establishes the data foundation of your application. The schema is designed not just for data storage but also for performance and business intelligence.

- **Relationship**: The database is the single source of truth for all user data, products, and conversation states. It is accessed exclusively through the `database.py` module to ensure consistency.
    
- **Setup**: This SQL should be saved in a file (e.g., `schema.sql`) and executed by a Python script located at `scripts/setup_db.py`.
    

SQL

```
-- Core Table for Users: Stores all user-specific data
CREATE TABLE users (
    telegram_id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    message_credits INT DEFAULT 0,
    time_credits_seconds INT DEFAULT 0,
    tier VARCHAR(20) DEFAULT 'New', -- Manages user tiers like New, Regular, VIP
    is_banned BOOLEAN DEFAULT FALSE,
    auto_recharge_enabled BOOLEAN DEFAULT FALSE,
    stripe_customer_id VARCHAR(255) -- Links the user to their Stripe customer profile
);

-- Core Table for Products: Defines what you sell
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    stripe_price_id VARCHAR(100) NOT NULL UNIQUE,
    item_type VARCHAR(20) NOT NULL, -- 'credits' or 'time'
    amount INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Management & Analytics Tables
CREATE TABLE conversations (
    user_id BIGINT PRIMARY KEY REFERENCES users(telegram_id),
    topic_id INT UNIQUE, -- Stores the Telegram topic ID for the user's thread
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT FALSE,
    notes TEXT -- For private admin notes
);

-- Performance Indexes: Crucial for fast query performance with many users
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_conversations_topic_id ON conversations(topic_id);

-- Dashboard Views for easy analytics
CREATE OR REPLACE VIEW user_dashboard AS
SELECT u.telegram_id, u.username, u.tier, u.message_credits, COALESCE(SUM(t.amount_paid_usd_cents), 0) as total_spent
FROM users u
LEFT JOIN transactions t ON u.telegram_id = t.user_id
GROUP BY u.telegram_id;
```

---

### **Step 2: Backend Core Modules (in `src/`)**

These modules provide the foundational services that the main bot logic will rely on.

- **`config.py`**: A centralized module to manage and validate all environment variables (e.g., `LOW_CREDIT_ALERT_THRESHOLD`) and constants.
    
- **`database.py`**: The database interaction layer. It **must** use a `psycopg2` **connection pool** to efficiently manage connections, which is critical for performance.
    
- **`cache.py`**: A simple caching layer (e.g., a function decorator) to store frequently accessed data like bot settings, reducing database load.
    
- **`error_handler.py`**: A global error handler to catch all unhandled exceptions, notify the admin, and provide user-friendly error messages.
    

---

### **Step 3: Core Bot Logic & User Experience (in `src/bot.py`)**

This is the main application file containing the handlers that orchestrate all user and admin interactions.

- **Improved Welcome & Onboarding**: The `/start` command should present an engaging welcome message with a single "▶️ Start" button. A `CallbackQueryHandler` listens for this button press to then display the full list of products.
    
- **Topic-Based Conversation Management**: This is the cornerstone admin feature. It requires helper functions `get_or_create_user_topic` (which creates a new thread in the admin group if one doesn't exist) and `send_user_info_card` (which pins a message with the user's details and quick-action buttons). The `master_message_handler` routes user messages to their topic and admin replies from a topic back to the correct user.
    
- **Credit Visualization & Low Balance Alerts**: A centralized helper function, `send_balance_update`, should be created to send users their current balance. This function generates a visual progress bar (e.g., `Credits: 75/100 [████████░░] 75%`) and includes a "Low Balance Alert!" if the user's credits fall below the configured threshold. The `/balance` command calls this helper directly. The `master_message_handler` must contain a check at the very beginning to prevent a user with insufficient credits from sending a message. After a message is successfully sent and credits are decremented, it should call `send_balance_update` to inform the user of their new balance.
    

---

### **Step 4: The Webhook Server (in `src/webhook_server.py`)**

A robust payment system requires handling more than just successful purchases. Use a web framework like Flask to create a webhook server that listens for multiple Stripe events.

- **`/telegram-webhook`**: This endpoint receives updates from the Telegram API.
    
- **`/stripe-webhook`**: This endpoint listens for events from Stripe and must handle:
    
    - `checkout.session.completed`: To grant credits or time after a successful purchase.
        
    - `payment_intent.payment_failed`: To notify a user when their payment fails (critical for auto-recharge).
        
    - `payment_method.attached`: To confirm to the user that their payment method has been saved.
        
    - `charge.dispute.created`: To immediately alert the admin of a chargeback.
---
---

### **Module 4.1: Admin Guide: Managing the Bot**

This guide provides a comprehensive overview of the admin interface, which is designed for powerful and efficient bot management directly within Telegram. The system is built around a central command menu and a topic-based conversation manager.

#### **Initial Setup**

- **Relationship & Setup**: The admin system is restricted to a specific user ID defined by the `ADMIN_CHAT_ID` environment variable. The core of the admin experience, the conversation manager, requires the bot to be an administrator in a private Telegram group with "Topics" enabled.
    

---

#### **Primary Admin Commands**

These commands provide direct access to the most important management panels.

- `/admin`: This is the main entry point that opens the full dashboard, organizing all functions by category.
    
- `/conversations`: Directly opens the conversation management view to see all active user threads.
    
- `/dashboard`: Directly accesses the main admin dashboard for a quick overview of bot statistics.
    
- `/users`: Opens the user management panel to search, view, and manage users.
    
- `/products`: Opens the interface for managing credit packages and other sale items.
    
- `/settings`: Directly opens the bot configuration panel.
    

---

#### **The `/conversations` View: Topic-Based Management**

To successfully implement the topic-based conversation management system, you need to correctly configure the Telegram group and ensure your bot has the necessary permissions. Here are the detailed, step-by-step instructions.

### **Improved Guide: Setting Up Topic-Based Management**

This system transforms a standard Telegram group into an organized support dashboard by creating a dedicated thread for each user. Proper setup is critical for it to function correctly.

---

#### **Step 1: Create and Configure the Admin Group**

First, you need a private Telegram group where the bot will operate.

1. **Create a New Group**: In Telegram, create a new **private** group. This will be your admin-only space for managing conversations.
    
2. **Enable Topics**: This is the most critical step. Go to your group's settings (`Edit` > `Topics`) and toggle the feature **on**. The system will not work in a standard group; it requires the "Topics" (also known as "Forum") mode to be active.
    

---

#### **Step 2: Add and Promote Your Bot**

Your bot needs to be a member and an administrator of the group to manage topics and messages.

1. **Add the Bot**: Add your bot as a member to the newly created group.
    
2. **Promote to Admin**: Go to `Group Settings` > `Administrators` > `Add Admin` and select your bot.
    
3. **Grant Required Permissions**: A custom set of permissions is required. Ensure your bot has **at least** the following permissions enabled:
    
    - `Manage Topics`: Allows the bot to create, edit, and close the user-specific threads.
        
    - `Pin Messages`: Required for pinning the User Info Card at the top of each topic for easy access.
        
    - `Send Messages`: Necessary for the bot to forward user messages into the topics.
        

---

#### **Step 3: Obtain and Configure the Admin Group ID**

Your bot's code needs the unique identifier for your admin group to know where to create topics.

1. **Find the Group ID**: The easiest way to find the group ID is to temporarily add a bot like `@userinfobot` to your group. It will post a message containing the group's chat ID. The ID for a group will be a negative number (e.g., `-1002705423131`). Copy this ID and then you can remove the helper bot.
    
2. **Set the Environment Variable**: In your project's `.env` file, add the group ID.
    
    Code snippet
    
    ```
    # .env
    ADMIN_GROUP_ID="-1002705423131"
    ```
    
3. **Load in Configuration**: Ensure your `src/config.py` file loads this variable so it's accessible to your bot's logic.
    
    Python
    
    ```
    # src/config.py
    import os
    
    ADMIN_GROUP_ID = int(os.environ.get("ADMIN_GROUP_ID"))
    ```
    

---

#### **How It Works: The Relationship Between Setup and Code**

Once the setup is complete, the bot's code can execute the conversation management logic correctly.

- When a new user messages the bot, the `get_or_create_user_topic` function in `src/bot.py` is triggered.
    
- This function uses the configured `ADMIN_GROUP_ID` to target the correct group.
    
- It then makes a `context.bot.create_forum_topic` API call, which succeeds because you granted the bot the `Manage Topics` permission.
    
- Finally, it pins the User Info Card, which works because of the `Pin Messages` permission.
    

Without these specific setup steps, the bot would fail at the topic creation stage, and the entire conversation management system would not function.

---

#### **Enhanced Message Header & Quick Actions**

Every message forwarded from a user to their topic is prepended with an info card, providing immediate context and quick-action buttons.

- **Relationship & Setup**: This header is generated by the `send_user_info_card` function in `src/bot.py`. The buttons are `InlineKeyboardButton`s with `callback_data` that trigger specific `CallbackQueryHandler`s for actions like banning or gifting credits.
    
    ```
    ┌─────────────────────────────────────────┐
    │  📩 New text message               │
    │  From: @alice123 🏆 VIP (ID: `123654`) │
    │  Credits: 45 | Time: None              │
    │  ──────────────────────────────────     │
    │  ┌─────────┬─────────┬─────────────┐     │
    │  │👤User Info│🎁Gift   │ 🚫 Ban     │     │
    │  └─────────┴─────────┴─────────────┘     │
    ```
    

---

### **Module 1: Telegram Group & Bot Setup**

This initial setup is critical. The bot requires a specific environment and permissions to manage topics effectively.

#### **Step 1: Create and Configure the Admin Group**

1. **Create a New Group**: In Telegram, create a new **private** group. This will be your admin-only space.
    
2. **Enable Topics**: Go to your group's settings (`Edit` > `Topics`) and toggle the feature **on**. This "Forum" mode is essential for the system to work.
    

#### **Step 2: Add and Promote the Bot**

1. **Add the Bot**: Add your bot as a member to the group.
    
2. **Promote to Admin**: Promote the bot to an administrator.
    
3. **Grant Required Permissions**: Ensure your bot has at least the following permissions enabled:
    
    - **`Manage Topics`**: To create, edit, and close the user-specific threads.
        
    - **`Pin Messages`**: Required for pinning the User Info Card in each topic.
        
    - **`Send Messages`**: Necessary for the bot to forward user messages and post info cards.
        

#### **Step 3: Obtain and Configure the Admin Group ID**

1. **Find the Group ID**: The easiest way to find the group ID is to temporarily add a bot like `@userinfobot` to your group. It will post a message containing the group's chat ID, which will be a negative number (e.g., `-1002705423131`).
    
2. **Set the Environment Variable**: Add the `ADMIN_GROUP_ID` to your project's `.env` file.
    

---

### **Module 2: The Two-Way Conversation Bridge**

This is the core logic that creates topics and routes messages between the user's private chat and their dedicated admin topic.

#### **Step 1: Implement the Topic Creation Logic**

- **Relationship**: This function in `src/bot.py` is the entry point for new conversations. It checks the `conversations` table in your database and uses the Telegram Bot API to create a new topic if one doesn't exist.
    
- **Code (`get_or_create_user_topic`)**:
    
    Python
    
    ```
    # src/bot.py
    
    async def get_or_create_user_topic(context: ContextTypes.DEFAULT_TYPE, user_id: int, username: str) -> int | None:
        """Finds an existing topic for a user or creates a new one, then pins the info card."""
        topic_id = db.get_user_topic(user_id) # DB call
        if topic_id:
            return topic_id
    
        try:
            topic = await context.bot.create_forum_topic(chat_id=ADMIN_GROUP_ID, name=f"👤 {username} ({user_id})")
            new_topic_id = topic.message_thread_id
            db.save_user_topic(user_id, new_topic_id) # Save to DB
            await send_user_info_card(context, new_topic_id, user_id)
            return new_topic_id
        except Exception as e:
            # Fallback if creation fails
            await context.bot.send_message(chat_id=ADMIN_GROUP_ID, text=f"🚨 Critical Error: Could not create topic for @{username} (`{user_id}`).")
            return None
    ```
    

#### **Step 2: Implement the User Info Card with Admin Functions**

- **Relationship**: This function in `src/bot.py` generates the pinned message in each topic, providing admins with immediate context and quick-action buttons. These buttons trigger `CallbackQueryHandler`s to execute admin functions.
    
- **Code (`send_user_info_card`)**:
    
    Python
    
    ```
    # src/bot.py
    
    async def send_user_info_card(context: ContextTypes.DEFAULT_TYPE, topic_id: int, user_id: int):
        """Creates and pins a card with user details and quick-action buttons."""
        user_data = db.get_user_dashboard_info(user_id) # A DB function to get user tier, credits, etc.
    
        text = (f"👤 **User: @{user_data['username']}** (ID: `{user_id}`)\n"
                f"🏆 Tier: {user_data['tier']}\n💰 Credits: {user_data['message_credits']}")
    
        keyboard = [[
            InlineKeyboardButton("👤 User Info", callback_data=f"admin_user_info_{user_id}"),
            InlineKeyboardButton("🎁 Gift Credits", callback_data=f"admin_gift_{user_id}"),
            InlineKeyboardButton("🚫 Ban User", callback_data=f"admin_ban_{user_id}")
        ]]
    
        info_message = await context.bot.send_message(
            chat_id=ADMIN_GROUP_ID, text=text, message_thread_id=topic_id,
            reply_markup=InlineKeyboardMarkup(keyboard), parse_mode='Markdown'
        )
        await context.bot.pin_chat_message(chat_id=ADMIN_GROUP_ID, message_id=info_message.message_id)
    ```
    

#### **Step 3: Implement the Master Message Handler**

- **Relationship**: This central handler in `src/bot.py` intelligently routes all messages. It must distinguish between a user messaging the bot and an admin replying within a topic.
    
- **Code (`master_message_handler`)**:
    
    Python
    
    ```
    # src/bot.py
    
    async def master_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
        # CASE 1: Admin replying inside a topic
        if update.effective_chat.id == ADMIN_GROUP_ID and update.message.is_topic_message:
            topic_id = update.message.message_thread_id
            user_to_reply_id = db.get_user_id_from_topic(topic_id) # DB call
    
            if user_to_reply_id:
                await context.bot.copy_message(chat_id=user_to_reply_id, from_chat_id=ADMIN_GROUP_ID, message_id=update.message.message_id)
                await update.message.react(reaction="✅") # Confirm reply was sent
            return
    
        # CASE 2: Message from a user in a private chat
        if update.effective_chat.type == 'private':
            user = update.effective_user
            topic_id = await get_or_create_user_topic(context, user.id, user.username)
    
            if topic_id:
                await context.bot.forward_message(
                    chat_id=ADMIN_GROUP_ID, from_chat_id=user.id,
                    message_id=update.message.message_id, message_thread_id=topic_id
                )
                # This is where we trigger the "Recent on Top" notification
                await notify_admin_of_new_message(context, user, topic_id)
    ```
    

---

### **Module 3: Managing Topic Order ("Recent on Top")**

While the Telegram API does not allow a bot to arbitrarily reorder topics, you can create a powerful system that effectively brings the most recent conversations to the admin's attention.

#### **The Solution: A "Live Inbox" in the General Topic**

The best approach is to use the group's default "General" topic as a live feed or inbox. Every time a new message arrives from any user, the bot will post a notification in the General topic with a direct link to that user's thread. This keeps all new activity centralized and easily accessible.

- **Implementation**: This logic is added to the `master_message_handler` after a user's message is successfully forwarded.
    
- **Code (`notify_admin_of_new_message`)**:
    
    Python
    
    ```
    # src/bot.py
    
    async def notify_admin_of_new_message(context: ContextTypes.DEFAULT_TYPE, user: User, topic_id: int):
        """Sends a notification to the General topic with a link to the user's topic."""
        # Note: The "General" topic always has a message_thread_id of 1
        general_topic_id = 1
    
        # We need the ID of a message within the topic to link to it. We can use the pinned info card.
        pinned_message_id = db.get_pinned_message_id_for_topic(topic_id) # Requires DB change
    
        if pinned_message_id:
            # Create a deep link to the topic
            topic_link = f"https://t.me/c/{str(ADMIN_GROUP_ID)[4:]}/{topic_id}"
    
            notification_text = (f"📩 New message from **@{user.username}**.\n\n"
                                 f"[Click here to view the conversation]({topic_link})")
    
            await context.bot.send_message(
                chat_id=ADMIN_GROUP_ID,
                text=notification_text,
                message_thread_id=general_topic_id,
                parse_mode='Markdown'
            )
    ```
    

This solution effectively replicates the "most recent on top" feel of an inbox, ensuring admins never miss a new message while keeping conversations perfectly organized in their respective topics.
---

### **Module 4.2: User Guide: Interacting with the Bot**

This guide details the commands and features available to end-users for a seamless, self-service experience.

#### **`/start`**: Onboarding & Product Discovery

- **Function**: This is the primary entry point for new users. It displays an engaging welcome message and a single, clear call-to-action.
    
- **Implementation**:
    
    1. The `welcome_message` handler for the `/start` command sends a message with an `InlineKeyboardMarkup` containing one "▶️ Start" button.
        
    2. A `CallbackQueryHandler` listens for the `show_products` callback data from this button.
        
    3. When pressed, the handler edits the original message, removing the "Start" button and displaying a list of purchasable products fetched from the `products` table.
        

---

#### **`/balance`**: Checking Credits & Time

- **Function**: Allows a user to check their remaining message credits and/or time. The response includes a visual progress bar for an at-a-glance understanding.
    
- **Implementation**:
    
    1. The `balance_command` handler fetches the user's current `message_credits` from the database.
        
    2. It calls the `create_progress_bar` helper function to generate a visual representation of the balance (e.g., `Credits: 75/100 [████████░░] 75%`).
        
    3. The bot replies with the formatted balance message.
        

---

#### **`/billing`**: Managing Payment Methods

- **Function**: Provides users with a secure way to manage their saved payment methods via the Stripe Customer Portal.
    
- **Implementation**:
    
    1. The `billing_portal_command` handler first retrieves the user's `stripe_customer_id` from your `users` table.
        
    2. It then makes an API call to `stripe.billing_portal.Session.create`, passing the customer ID.
        
    3. Stripe returns a unique, short-lived URL for the portal session, which the bot sends to the user.
        

---

#### **`/autorecharge`**: Configuring Automatic Top-Ups

- **Function**: Allows a user to enable or disable the automatic credit top-up feature, ensuring they never run out of credits.
    
- **Implementation**:
    
    1. This command should trigger a `ConversationHandler` to guide the user through the setup process.
        
    2. The bot asks if they want to enable or disable the feature and which credit package they want to auto-recharge with.
        
    3. The user's choices (`auto_recharge_enabled` and `auto_recharge_amount`) are saved to their record in the `users` table.
        

---

#### **Quick-Buy Commands** (e.g., `/buy10`, `/buy25`)

- **Function**: Allows returning users to instantly initiate a purchase for a specific credit package, bypassing the main menu.
    
- **Implementation**:
    
    1. A single `CommandHandler` is registered for a list of commands (e.g., `["buy10", "buy25"]`).
        
    2. The handler parses the command to determine the desired credit amount (e.g., extracts "10" from `/buy10`).
        
    3. It queries the `products` table for a product matching that credit amount.
        
    4. If found, it immediately initiates the Stripe checkout flow for that product's `stripe_price_id`.

---

### **Module 5: Production Deployment Guide**

This module provides a fine-grained, step-by-step guide to deploying your bot to a production environment using Railway. A webhook-based deployment is essential for scalability and performance, and Railway is the recommended platform due to its seamless integration with GitHub and automatic database provisioning.

---

### **Step 1: Prepare Your Local Repository**

Before deploying, you must ensure your project is properly configured for a containerized environment and that all code is committed to your GitHub repository.

1. **Create a `Dockerfile`**: In your `deployment/` directory, create a `Dockerfile`. This file tells Railway how to build and run your application.
    
    Dockerfile
    
    ```
    # deployment/Dockerfile
    
    # Use an official Python runtime as a parent image
    FROM python:3.11-slim
    
    # Set the working directory in the container
    WORKDIR /app
    
    # Copy the requirements file into the container
    COPY requirements.txt .
    
    # Install any needed packages specified in requirements.txt
    RUN pip install --no-cache-dir -r requirements.txt
    
    # Copy the rest of your application code into the container
    COPY src/ ./src
    COPY scripts/ ./scripts
    
    # Command to run your application
    # This should start your webhook server (e.g., using Gunicorn)
    CMD ["gunicorn", "--bind", "0.0.0.0:8000", "src.webhook_server:app"]
    ```
    
2. **Verify Your `requirements.txt`**: Ensure this file in your root directory lists all necessary Python libraries, including `python-telegram-bot[ext]`, `psycopg2-binary`, `stripe`, `flask`, and `gunicorn`.
    
3. **Commit All Changes**: Make sure your local repository is up to date with your remote GitHub repository.
    
    Bash
    
    ```
    git add .
    git commit -m "feat: Finalize configuration for Railway deployment"
    git push origin main
    ```
    

---

### **Step 2: Create and Configure the Railway Project**

This involves setting up the application and database services directly within the Railway dashboard.

1. **Create a New Project**: Sign up for Railway using your GitHub account. From the dashboard, click **"Start a New Project"** and select **"Deploy from GitHub repo."**
    
2. **Select Your Repository**: Choose the GitHub repository containing your bot's code. Railway will automatically detect the `Dockerfile` and begin a build process.
    
3. **Add a PostgreSQL Database**: While the initial build is running, navigate back to your project dashboard. Click the **"+"** button or **"Add Service"** and select **"PostgreSQL."** Railway will instantly provision a new database and automatically link it to your bot service.
    

---

### **Step 3: Configure Environment Variables**

Securely add your bot's secrets and configuration variables to the Railway environment.

1. **Access Variables**: In your Railway project, click on your bot's service (not the database) and open the **"Variables"** tab.
    
2. **Add Required Variables**: Add the following variables. Do not manually add `DATABASE_URL`; Railway injects this automatically from the PostgreSQL service you created.
    
    - `BOT_TOKEN`: Your bot token from @BotFather.
        
    - `ADMIN_CHAT_ID`: Your personal Telegram user ID.
        
    - `STRIPE_API_KEY`: Your secret key (`sk_...`) from the Stripe dashboard.
        
    - `STRIPE_WEBHOOK_SECRET`: The webhook signing secret (`whsec_...`) from the Stripe dashboard.
        
3. **Redeploy**: After adding the variables, Railway will automatically trigger a new deployment to apply them.
    

---

### **Step 4: Deploy and Monitor Initial Startup**

Railway automatically handles the deployment process. Your role is to monitor the logs to ensure a successful start.

1. **Monitor Logs**: From the **"Deployments"** tab, click on the latest deployment to view its logs in real-time. Look for key confirmation messages:
    
    - Logs indicating the database schema was created by `setup_db.py`.
        
    - `Gunicorn` startup messages indicating your web server is running.
        
    - A final message like "Application startup successful."
        
2. **Check Health Endpoint**: Once the deployment is complete, navigate to your bot's health endpoint. You can find your public URL in the **"Settings"** tab of your service. It should look like `https://your-app.railway.app/health` and return `{"status": "healthy"}`.
    

---

### **Step 5: Configure Production Webhooks**

Finally, connect the live Telegram and Stripe APIs to your running application.

1. **Get Your Public Domain**: In your service's **"Settings"** tab on Railway, find and copy the **"Public Domain"** URL.
    
2. **Set the Telegram Webhook**: You must tell Telegram where to send all user updates. Execute the following `curl` command in your terminal, replacing `<YOUR_TOKEN>` and `<YOUR_RAILWAY_URL>`.
    
    Bash
    
    ```
    curl "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=<YOUR_RAILWAY_URL>/telegram-webhook"
    ```
    
3. **Set the Stripe Webhook**: In your **Stripe Dashboard**, navigate to **"Developers" -> "Webhooks"** and add a new endpoint.
    
    - **Endpoint URL**: `https://your-app.railway.app/stripe-webhook`
        
    - **Events to listen to**: Select the events your server is configured to handle, such as `checkout.session.completed`, `payment_intent.payment_failed`, and `charge.dispute.created`.
        
    - **Get Signing Secret**: After creating the endpoint, copy the generated webhook signing secret and ensure it matches the `STRIPE_WEBHOOK_SECRET` variable in Railway.
        

---

### **Step 6: Post-Deployment Health Checks & Troubleshooting**

After setup, perform these final checks and know how to troubleshoot common issues.

1. **End-to-End Test**: Use a separate Telegram account to send `/start` to your bot, purchase the smallest credit package, and send a message to confirm the entire flow is working.
    
2. **Troubleshooting Common Issues**:
    
    - **Bot not responding**: Check the Railway logs for errors. The most common issues are missing environment variables or a database connection failure.
        
    - **Webhook issues**: If payments are not granting credits, check the Stripe dashboard for webhook delivery failures. A `4xx` error means the URL is wrong; a `5xx` error means there's a bug in your webhook handler. A signature verification failure means your `STRIPE_WEBHOOK_SECRET` is incorrect.

To implement the feature allowing an admin to edit packages, prices, and welcome messages directly in Telegram, you need to use a **`ConversationHandler`**. This component from the `python-telegram-bot` library creates a guided, multi-step conversation, essentially a state machine, to walk the admin through the editing process safely.

Here is a detailed, step-by-step guide on how to set it up.

### **Step 1: The Foundation - The `ConversationHandler`**

The `ConversationHandler` is the core of this feature. It allows you to define a series of steps (states) for a conversation. The bot will transition from one state to the next based on the admin's input (e.g., clicking a button or sending a message), making it perfect for guided tasks like editing a setting.

---

### **Step 2: Database & Configuration Setup**

Your bot's configurable variables must be stored in the database so they can be updated without changing the code.

- **Relationship**: The settings you want to edit, like the welcome message and message costs, are stored in the `bot_settings` table. Product prices and labels are stored in the `products` table. The `ConversationHandler` will execute database queries to update these values.
    
- **Setup**:
    
    1. Ensure your `bot_settings` and `products` tables are created as per the database schema.
        
    2. Make sure your `ADMIN_CHAT_ID` is correctly set in your `.env` file and loaded in `src/config.py`. This is crucial for restricting access to these powerful commands.
        

---

### **Step 3: Code Implementation**

This involves creating the entry point, defining the states, and building the conversation flow within `src/bot.py`.

#### **1. Define Conversation States**

First, define unique identifiers for each step of your conversation.

Python

```
# src/bot.py

# Define states for the conversation handler
SETTINGS_MENU, AWAITING_WELCOME_MESSAGE, AWAITING_TEXT_COST = range(3)
```

#### **2. Create the Entry Point (`/settings` command)**

This command starts the conversation and displays the main menu to the admin.

Python

```
# src/bot.py
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import CommandHandler, CallbackQueryHandler, ConversationHandler, MessageHandler, filters, ContextTypes

async def settings_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Entry point for the admin settings conversation."""
    user_id = update.effective_user.id
    # CRITICAL: Restrict access to the admin
    if user_id != ADMIN_CHAT_ID:
        return ConversationHandler.END

    keyboard = [
        [InlineKeyboardButton("📝 Edit Welcome Message", callback_data="edit_welcome_message")],
        [InlineKeyboardButton("💰 Edit Text Message Cost", callback_data="edit_text_cost")],
        [InlineKeyboardButton("❌ Cancel", callback_data="cancel_conversation")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text("⚙️ **Admin Settings**\nPlease choose a setting to edit:", reply_markup=reply_markup, parse_mode='Markdown')
    
    return SETTINGS_MENU
```

#### **3. Build the Conversation Flow**

Now, create the handlers for each step of the conversation. These will prompt the admin for new values and then save them.

Python

```
# src/bot.py

# --- Handlers to ask for new values ---
async def ask_for_new_welcome_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    await query.edit_message_text("Please send the new welcome message.")
    return AWAITING_WELCOME_MESSAGE

async def ask_for_new_text_cost(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    await query.edit_message_text("Please send the new cost for a text message (e.g., '1').")
    return AWAITING_TEXT_COST

# --- Handlers to save the new values ---
async def save_new_welcome_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    new_message = update.message.text
    db.set_setting('welcome_message', new_message) # Assumes a db helper function
    await update.message.reply_text("✅ Welcome message updated successfully!")
    return ConversationHandler.END

async def save_new_text_cost(update: Update, context: ContextTypes.DEFAULT_TYPE):
    new_cost = update.message.text
    if not new_cost.isdigit():
        await update.message.reply_text("Invalid input. Please send a number.")
        return AWAITING_TEXT_COST
    
    db.set_setting('cost_text_message', new_cost)
    await update.message.reply_text("✅ Text message cost updated successfully!")
    return ConversationHandler.END

# --- Handler to cancel the conversation ---
async def cancel_conversation(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if query:
        await query.answer()
        await query.edit_message_text("Operation cancelled.")
    else:
        await update.message.reply_text("Operation cancelled.")
    return ConversationHandler.END
```

#### **4. Assemble and Register the `ConversationHandler`**

Finally, assemble all the pieces into a single `ConversationHandler` and register it with your application in your main startup function.

Python

```
# In your main() function in bot.py or webhook_server.py

settings_handler = ConversationHandler(
    entry_points=[CommandHandler("settings", settings_command)],
    states={
        SETTINGS_MENU: [
            CallbackQueryHandler(ask_for_new_welcome_message, pattern="^edit_welcome_message$"),
            CallbackQueryHandler(ask_for_new_text_cost, pattern="^edit_text_cost$"),
            CallbackQueryHandler(cancel_conversation, pattern="^cancel_conversation$")
        ],
        AWAITING_WELCOME_MESSAGE: [MessageHandler(filters.TEXT & ~filters.COMMAND, save_new_welcome_message)],
        AWAITING_TEXT_COST: [MessageHandler(filters.TEXT & ~filters.COMMAND, save_new_text_cost)],
    },
    fallbacks=[CommandHandler("cancel", cancel_conversation)],
)

application.add_handler(settings_handler)
```

This setup creates a secure, admin-only interface that allows you to dynamically change your bot's core settings directly from your Telegram chat, without needing to modify code or access the database manually.