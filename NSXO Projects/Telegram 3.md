---
created: 2025-07-21 05:42:59
---

---

## **Project Documentation: The Complete Guide to Your Telegram Premium Messaging Bot**

### **Part 1: Project Overview & Architecture**

This document outlines the architecture, features, and implementation of an enterprise-grade Telegram bot designed for creators and businesses to monetize their audience through a premium messaging service.

#### **1.1 Key Features**

- **Monetization Engine**:
    
    - **Stripe Integration**: Secure, PCI-compliant payment processing with extensive webhook automation for reliability.
        
    - **Smart Credit & Time System**: Users can purchase consumable credits (with configurable costs for text, photo, and voice) or time-based sessions for unlimited messaging.
        
    - **Premium Content**: Sell access to individual locked media files with custom pricing.
        
    - **Auto-Recharge**: Users can opt-in for automatic credit top-ups using saved payment methods.
        
    - **Quick-Buy Commands**: Instant purchase commands like `/buy10` and `/buy25` for returning users.
        
- **Admin & Management**:
    
    - **Advanced Admin Panel**: A full-featured dashboard for user management, analytics, and dynamic bot configuration, accessible directly within Telegram.
        
    - **Topic-Based Conversation Management**: Each user is assigned a dedicated conversation thread in a private admin group, eliminating chat clutter and preserving context.
        
    - **Team Collaboration Tools**: The architecture supports multi-admin roles, permissions, and topic assignments for team-based management.
        
- **User Experience**:
    
    - **Rich Visual UX**: The bot utilizes visual progress bars for credit visualization, read receipts, and typing indicators.
        
    - **Self-Service Portal**: A `/billing` command gives users access to a Stripe portal to manage their saved payment methods.
        
    - **Smart Notifications**: The bot sends automated warnings for low credit balances and expiring time sessions.
        
    - **AI-Powered Features**: The system is designed for future integration of AI for smart replies and sentiment analysis.
        

#### **1.2 System Architecture Diagram**

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

### **Part 2: Getting Started: Setup & Workflow**

This section covers the initial setup of your development environment and the professional workflow practices for building the bot.

#### **2.1 Project Folder Organization**

The project is organized into a clean, hierarchical structure to separate concerns:

```
telegram_bot/
├── 📁 src/                    # Core application code (bot.py, database.py, etc.)
├── 📁 scripts/                # Utility scripts (e.g., setup_db.py)
├── 📁 deployment/             # Deployment configs (Dockerfile, railway.json)
├── 📁 docs/                   # All project documentation
├── 📋 Configuration Files     # Root-level configs (.env, requirements.txt)
└── 📁 venv/                   # Python virtual environment
```

#### **2.2 Version Control & Branching Strategy**

The project uses a **GitFlow-inspired** branching strategy for organized and safe development:

- **`main`**: Production-ready, stable code. Deploys to production.
    
- **`development`**: Integration branch for completed features.
    
- **`feature/*`**: Branches for developing new features.
    
- **`hotfix/*`**: Branches for critical production fixes.
    

All commits must follow the **Conventional Commits** standard (e.g., `feat:`, `fix:`, `docs:`), and the repository should be protected by **pre-commit hooks** that automatically check for syntax errors and prevent accidental commits of secrets.

---

### **Part 3: The Build: Step-by-Step Implementation**

This section provides a detailed guide to building the bot's core components.

#### **Step 1: Database Schema & Setup**

Create a `scripts/setup_db.py` file to initialize a PostgreSQL database with a schema designed for performance and business intelligence. Your setup script should execute the following SQL.

SQL

```
-- Core Table for Users
CREATE TABLE users (
    telegram_id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    message_credits INT DEFAULT 0,
    time_credits_seconds INT DEFAULT 0,
    tier VARCHAR(20) DEFAULT 'New', -- Manages user tiers like New, Regular, VIP
    is_banned BOOLEAN DEFAULT FALSE,
    auto_recharge_enabled BOOLEAN DEFAULT FALSE,
    stripe_customer_id VARCHAR(255)
);

-- Core Table for Products
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

-- Performance Indexes
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_conversations_topic_id ON conversations(topic_id);

-- Dashboard Views for easy analytics
CREATE OR REPLACE VIEW user_dashboard AS
SELECT u.telegram_id, u.username, u.tier, u.message_credits, COALESCE(SUM(t.amount_paid_usd_cents), 0) as total_spent
FROM users u
LEFT JOIN transactions t ON u.telegram_id = t.user_id
GROUP BY u.telegram_id;
```

#### **Step 2: Backend Core Modules (in `src/`)**

Develop these essential backend modules inside the `src/` directory.

- **`config.py`**: A centralized module to manage and validate all environment variables (e.g., `LOW_CREDIT_ALERT_THRESHOLD`) and constants.
    
- **`database.py`**: The database interaction layer. It **must** use a `psycopg2` **connection pool** to efficiently manage connections, which is critical for performance.
    
- **`cache.py`**: A simple caching layer (e.g., a function decorator) to store frequently accessed data like bot settings, reducing database load.
    
- **`error_handler.py`**: A global error handler that catches all unhandled exceptions, notifies the admin, and provides users with a friendly error message.
    

#### **Step 3: Core Bot Logic & User Experience (in `src/bot.py`)**

This is the main application file containing the handlers for all user and admin interactions.

- **Improved Welcome & Onboarding**:
    
    - The `/start` command should present an engaging welcome message with a single "▶️ Start" button. A `CallbackQueryHandler` listens for this button press to then display the full list of products.
        
- **Topic-Based Conversation Management**:
    
    - This is the cornerstone admin feature. It requires helper functions `get_or_create_user_topic` (which creates a new thread in the admin group if one doesn't exist) and `send_user_info_card` (which pins a message with the user's details and quick-action buttons). The `master_message_handler` routes user messages to their topic and admin replies from a topic back to the correct user.
        
- **Credit Visualization & Low Balance Alerts**:
    
    - A centralized helper function, `send_balance_update`, should be created to send users their current balance. This function generates a visual progress bar (e.g., `Credits: 75/100 [████████░░] 75%`) and includes a "Low Balance Alert!" if the user's credits fall below the configured threshold.
        
    - The `/balance` command calls this helper directly.
        
    - The `master_message_handler` must contain a check at the very beginning to prevent a user with insufficient credits from sending a message. After a message is successfully sent and credits are decremented, it should call `send_balance_update` to inform the user of their new balance.
        

#### **Step 4: The Webhook Server (in `src/webhook_server.py`)**

A robust payment system requires handling multiple Stripe events. Use a web framework like Flask to create a webhook server.

- **`/telegram-webhook`**: This endpoint receives updates from the Telegram API.
    
- **`/stripe-webhook`**: This endpoint listens for events from Stripe and must handle:
    
    - `checkout.session.completed`: To grant credits or time after a successful purchase.
        
    - `payment_intent.payment_failed`: To notify a user when their payment fails (critical for auto-recharge).
        
    - `payment_method.attached`: To confirm to the user that their payment method has been saved.
        
    - `charge.dispute.created`: To immediately alert the admin of a chargeback.
        

---

### **Part 4: Usage Guides**

#### **4.1 Admin Guide: Managing the Bot**

The admin interface provides complete control via commands within Telegram.

- **Primary Commands**: `/admin` (main dashboard), `/conversations` (chat view), `/users`, `/products`, and `/settings`.
    
- **Visual Interface**: The `/conversations` view provides a prioritized list of user chats with visual indicators (e.g., 📌🔥). When a message is forwarded, it is prepended with an enhanced header containing user details and quick-action buttons (👤User Info, 🎁Gift, 🚫 Ban).
    

#### **4.2 User Guide: Interacting with the Bot**

Users have access to several commands for a self-service experience.

- `/start`: Begins the interaction and shows available products.
    
- `/balance`: Checks the current credit and/or time remaining, displayed with a visual progress bar.
    
- `/billing`: Accesses the Stripe customer portal to manage payment methods.
    
- `/autorecharge`: Configures the automatic credit top-up feature.
    
- `/buy10`, `/buy25`, etc.: Quick-buy commands to instantly purchase specific credit packages.
    

---

### **Part 5: Production Deployment with Railway**

A webhook-based deployment is essential for scalability. Railway is the recommended platform.

1. **Prepare Repository**: Ensure a `deployment/Dockerfile` exists. Commit and push all code to your GitHub repository.
    
2. **Create Railway Project**: Link your GitHub repository to a new Railway project and add a PostgreSQL database service.
    
3. **Configure Environment Variables**: In the Railway "Variables" tab, add all necessary secrets (`BOT_TOKEN`, `ADMIN_CHAT_ID`, `STRIPE_API_KEY`, etc.). Railway will automatically inject the `DATABASE_URL`.
    
4. **Deploy and Monitor**: Railway automatically deploys on push. Monitor the logs to ensure a successful start.
    
5. **Configure Webhooks**: Once deployed, get your public URL from Railway's settings.
    
    - Set your Telegram webhook to `https://your-app.railway.app/telegram-webhook`.
        
    - Set your Stripe webhook to `https://your-app.railway.app/stripe-webhook` in the Stripe Dashboard, selecting all required events.