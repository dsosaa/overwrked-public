---
created: 2025-07-21 05:26:14
---

# Telegram Bot PT 2



---

This document outlines the architecture, features, and implementation of an enterprise-grade Telegram bot. The bot is designed for creators and businesses to monetize their audience through a premium messaging service that integrates Stripe for payment processing, a credit and time-based access system, and a comprehensive admin panel.

---

### **Part 1: Project Overview & Features**

#### **1.1 Key Features**

**Payments & Monetization**:

- **Stripe Integration**: The bot uses secure, PCI-compliant payment processing with extensive webhook automation for reliability.
    
- **Smart Credit System**: Users spend credits on messages, with configurable costs for text, photos, and voice messages.
    
- **Time-Based Sessions**: Users can purchase blocks of time for unlimited messaging.
    
- **Premium Content**: Admins can sell access to individual locked media files with custom pricing.
    
- **Auto-Recharge**: Users can opt-in for automatic credit top-ups using saved payment methods.
    

**Admin & Management**:

- **Advanced Admin Panel**: A full-featured dashboard for user management, analytics, and dynamic bot configuration is accessible directly within Telegram.
    
- **Topic-Based Conversation Management**: Each user is assigned a dedicated conversation thread in a private admin group, eliminating chat clutter and preserving conversation history.
    
- **User Management**: Admins can view user details, edit credit balances, and ban users directly from the UI.
    

**User Experience**:

- **Visual UX**: The bot utilizes progress bars, read receipts, and typing indicators to create an engaging user experience.
    
- **Quick-Buy Commands**: Commands like `/buy10` or `/buy25` allow users to quickly purchase credits.
    
- **Credit Visualization**: A visual progress bar represents the user's remaining credits or time.
    
- **Low Balance Alerts**: The system automatically notifies users when their balance drops below a configurable threshold.
    
- **Self-Service Portals**: Users can manage their saved payment methods via a `/billing` command and configure auto-recharge with `/autorecharge`.
    
- **Smart Notifications**: The bot sends automated warnings for low credit balances and expiring time sessions.
    
- **Improved Welcome Message**: An engaging welcome message with a "Start" button guides new users.
    

**Advanced Features**:

- **AI-Powered Intelligence**:
    
    - **Auto-Categorization & Tagging**: Automatically categorizes messages and detects urgency.
        
    - **Intelligent Response Suggestions**: Generates smart replies for admins based on conversation context.
        
    - **Sentiment Analysis**: Tracks user satisfaction and highlights negative sentiments.
        
- **Team Collaboration Tools**:
    
    - **Multi-Admin Support**: Implements roles and permissions for different admin levels.
        
    - **Topic Assignments**: Allows conversations to be assigned to specific team members.
        
- **Real-Time Communication**: Typing indicators and read receipts show when an admin is actively responding.
    
- **Mini App**: The architecture supports a future React-based web interface.
    

#### **1.2 System Architecture Diagram**

This diagram illustrates the high-level components and data flow of the service. The bot application is the central hub connecting Telegram, the database, and the payment processor.

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

### **Part 2: Development & Deployment Workflow**

The project is built on a foundation of professional development practices to ensure code quality, maintainability, and security.

#### **2.1 Folder Organization**

The project is organized into a clean, hierarchical structure to separate concerns.

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

The project uses a **GitFlow-inspired** branching strategy for organized and safe development.

- **`main`**: Production-ready, stable code that deploys to production.
    
- **`development`**: Integration branch for completed features that deploys to a staging environment.
    
- **`feature/*`**: Branches for developing new features, created from `development`.
    
- **`hotfix/*`**: Branches for critical production fixes, created from `main`.
    

All commits must follow the **Conventional Commits** standard (e.g., `feat:`, `fix:`, `docs:`), and the repository is protected by **pre-commit hooks** that automatically check for syntax errors and prevent accidental commits of secrets like API keys.

---

### **Part 3: Step-by-Step Build Instructions**

This section provides a detailed guide to building the bot from the ground up.

#### **Step 1: Database Schema & Setup**

Create a `scripts/setup_db.py` file to initialize a PostgreSQL database with a schema designed for performance and business intelligence.

- **Core Tables**: `users`, `products`, `transactions`.
    
- **Management & Analytics Tables**:
    
    - `conversations`: Tracks the state of each user's chat, including `topic_id`, `unread_messages`, `priority_level`, and `is_pinned`.
        
	    - `daily_metrics`: Stores aggregated business KPIs like daily active users, new users, and revenue.
        
- **Performance Indexes**: Create indexes on frequently queried columns (e.g., `users(telegram_id)`) to ensure fast lookups.
    
- **Dashboard Views**: Create pre-built SQL `VIEW`s like `user_dashboard` and `revenue_dashboard` for instant business insights.
    

#### **Step 2: Backend Core Modules (in `src/`)**

Develop the core backend modules inside the `src/` directory.

- **`config.py`**: A centralized module to manage and validate all environment variables and constants.
    
- **`database.py`**: The database interaction layer that **must** use a `psycopg2` **connection pool** to efficiently manage connections.
    
- **`cache.py`**: A simple caching layer to store frequently accessed data like bot settings, reducing database load.
    
- **`error_handler.py`**: A global error handler to catch all unhandled exceptions, notify the admin, and provide user-friendly error messages.
    

#### **Step 3: The Bot Logic (`src/bot.py`)**

This is the main application file containing the handlers for all user and admin interactions.

- **Topic-Based Conversation Management**: This is the cornerstone admin feature.
    
    - When a new user sends their first message, the bot must automatically create a new **topic** in the designated admin group.
        
    - The topic should be named with the user's identity (e.g., `👤 [Username] ([UserID])`).
        
    - The bot must immediately send and pin a **User Info Card** in the new topic, showing the user's credits, tier, and other relevant details.
        
    - The new `topic_id` must be saved to the `conversations` table in the database.
        
- **Message Routing Handler**:
    
    - **User to Admin**: When a message comes from a user, the bot retrieves their `topic_id` from the database and forwards the message into that specific topic.
        
    - **Admin to User**: When an admin replies _inside a topic_, the bot detects this, looks up the user associated with that `topic_id`, and sends the reply directly to that user.
        

#### **Step 4: The Webhook Server (`src/webhook_server.py`)**

A robust payment system requires handling more than just successful purchases. Use a web framework like Flask or FastAPI to create a webhook server that listens for multiple Stripe events.

- **`checkout.session.completed`**: Grants credits/time upon a successful purchase.
    
- **`payment_intent.payment_failed`**: Notifies a user when their payment fails, which is critical for auto-recharge.
    
- **`payment_method.attached`**: Confirms to the user that their payment method has been successfully saved.
    
- **`charge.dispute.created`**: Immediately alerts the admin via a Telegram message when a user initiates a chargeback.
    

---

### **Part 4: User and Admin Guides**

#### **4.1 Admin Guide: Managing the Bot**

The admin interface is designed for power and simplicity, accessible via commands within Telegram.

- **Primary Command (`/admin`)**: This opens the main dashboard with access to all modules.
    
- **Conversation View (`/conversations`)**: This interface shows a prioritized list of all active user chats.
    
    ```
    ┌─────────────────────────────────────────┐
    │  💬 Active Conversations           │
    │                                         │
    │  📌🔥 1. @alice123 🏆 VIP          │
    │     💬 12 msgs (3) • 5m ago            │
    │     _Hey, I need help with my purchase_ │
    │                                         │
    │  2. @bob456 ⭐ Regular              │
    │     💬 8 msgs (1) • 15m ago             │
    │     _Quick question about credits..._   │
    ```
    
- **Enhanced Message Header**: Every message forwarded from a user to an admin topic is prepended with a header containing the user's key details and quick-action buttons.
    
    ```
    ┌─────────────────────────────────────────┐
    │  📩 New text message               │
    │  From: @alice123 🏆 VIP (ID: `123456`) │
    │  Credits: 45 | Time: None              │
    │  ──────────────────────────────────     │
    │  ┌─────────┬─────────┬─────────────┐     │
    │  │👤User Info│🎁Gift   │ 🚫 Ban     │     │
    │  └─────────┴─────────┴─────────────┘     │
    ```
    

#### **4.2 User Guide: Interacting with the Bot**

Users have access to several commands for a self-service experience.

- `/start`: Begins the interaction, displays the welcome message, and shows available products.
    
- `/balance`: Checks the current credit and/or time remaining.
    
- `/billing`: Accesses the Stripe customer portal to manage saved payment methods.
    
- `/autorecharge`: Configures the automatic credit top-up feature.
    

---

### **Part 5: Production Deployment with Railway**

For production, a webhook-based deployment is necessary for scalability and performance. Railway is the recommended platform.

1. **Prepare Repository**: Ensure a `deployment/Dockerfile` exists for Railway to build and run the application.
    
2. **Create Railway Project**: Link your GitHub repository to a new Railway project.
    
3. **Add PostgreSQL Service**: Add a PostgreSQL database to your project. Railway will automatically provision it and provide the `DATABASE_URL` environment variable.
    
4. **Configure Environment Variables**: In the "Variables" tab on Railway, add all necessary secrets (`BOT_TOKEN`, `ADMIN_CHAT_ID`, `STRIPE_API_KEY`, etc.).
    
5. **Deploy and Set Webhooks**:
    
    - Once deployed, copy the public domain provided by Railway (e.g., `https://your-app.railway.app`).
        
    - Set your Telegram webhook to `https://your-app.railway.app/telegram-webhook`.
        
    - In your Stripe dashboard, add a webhook endpoint pointing to `https://your-app.railway.app/stripe-webhook` and select the required events.


Here are the improved and more detailed step-by-step instructions for deploying your bot to Railway, based on the provided documentation.

---

### **Part 5: Production Deployment with Railway**

For a production environment, a webhook-based deployment is essential for scalability and performance. Railway is the recommended platform due to its seamless integration with GitHub, automatic database provisioning, and minimal configuration.

---

### **Step 1: Prepare Your Repository**

Before deploying, ensure your project is properly configured and all changes are committed.

1. **Verify Configuration Files**: Make sure your repository contains the necessary deployment files, including `deployment/Dockerfile` and `deployment/railway.json`.
    
2. **Commit Your Code**: Add all your changes to Git and push them to your main branch.
    
    Bash
    
    ```
    git add .
    git commit -m "feat: Prepare for Railway deployment"
    git push origin main
    ```
    

---

### **Step 2: Create and Configure the Railway Project**

Set up your project and database directly within the Railway dashboard.

1. **Create a New Project**: Sign up for Railway with your GitHub account. Select "Start a New Project," choose "Deploy from GitHub repo," and select your bot's repository.
    
2. **Add a PostgreSQL Database**: In your Railway project dashboard, click "Add Service" or the "+" button and select "PostgreSQL." Railway will automatically provision a database and make its connection URL available to your bot.
    

---

### **Step 3: Configure Environment Variables**

Securely add your secrets and configuration variables to the Railway environment.

1. **Access Variables**: Navigate to your bot service in the Railway project and open the "Variables" tab.
    
2. **Add Required Variables**: Add the following variables. Railway will automatically inject the `DATABASE_URL` from the PostgreSQL service you created.
    
    - `BOT_TOKEN`: Your bot token from @BotFather.
        
    - `ADMIN_CHAT_ID`: Your personal Telegram user ID.
        
    - `STRIPE_API_KEY`: Your secret key from the Stripe dashboard.
        
    - `STRIPE_WEBHOOK_SECRET`: The webhook signing secret from Stripe.
        
    - `DATABASE_URL`: Leave this as `${Postgres.DATABASE_URL}`; Railway manages it automatically.
        

---

### **Step 4: Deploy and Monitor**

Railway automatically handles the deployment process.

1. **Trigger Deployment**: A deployment is automatically triggered when you push to your main branch. You can also trigger a manual deployment from the "Deployments" tab in Railway.
    
2. **Monitor Logs**: Watch the build and deployment logs in real-time from the "Logs" tab. Look for confirmation messages like "✅ Database initialization completed" and "Starting webhook server..." to ensure everything started correctly.
    
3. **Check Health**: Once deployed, check your bot's health endpoint (e.g., `https://your-app.railway.app/health`). It should return a healthy status.
    

---

### **Step 5: Configure Webhooks**

Finally, connect the Telegram and Stripe APIs to your live application.

1. **Get Your Public Domain**: In your service's "Settings" tab on Railway, find and copy the "Public Domain" URL.
    
2. **Set Telegram Webhook**: You must tell Telegram where to send updates. Use the following `curl` command with your bot token and public URL:
    
    Bash
    
    ```
    curl "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-app.railway.app/telegram-webhook"
    ```
    
3. **Set Stripe Webhook**: In your Stripe Dashboard, go to the "Webhooks" section and add a new endpoint.
    
    - **Endpoint URL**: `https://your-app.railway.app/stripe-webhook`.
        
    - **Events**: Select the events your server is configured to handle, such as `checkout.session.completed`.
        
    - **Get Signing Secret**: Copy the generated webhook signing secret and add it to the `STRIPE_WEBHOOK_SECRET` variable in Railway.