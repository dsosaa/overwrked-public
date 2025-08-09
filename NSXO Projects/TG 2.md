---
created: 2025-07-21 05:32:39
---
Here is a detailed expansion of the **Payments & Monetization** and **Admin & Management** features, including code examples, component relationships, and setup instructions based on the provided documentation.

---

### **Payments & Monetization Features**

These features form the core of your bot's business logic, handling everything from one-time purchases to recurring top-ups.

---

#### **1. Stripe Integration & Webhook Automation**

A robust Stripe integration handles all payment events asynchronously using webhooks, ensuring reliability even if the bot restarts.

- **Relationship & Setup**: Your `src/webhook_server.py` will run a lightweight web server (like Flask) with an endpoint (e.g., `/stripe-webhook`) to receive events from Stripe. The server verifies the event signature using your `STRIPE_WEBHOOK_SECRET` and processes different event types.
    
- **File Location**: `src/webhook_server.py`, `src/database.py`.
    
- **Code Implementation**:
    
    Python
    
    ```
    # src/webhook_server.py
    import stripe
    from flask import Flask, request, jsonify
    
    app = Flask(__name__)
    
    @app.route("/stripe-webhook", methods=['POST'])
    def stripe_webhook_handler():
        payload = request.get_data(as_text=True)
        sig_header = request.headers.get('Stripe-Signature')
    
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except Exception as e:
            return jsonify(status='error', message=str(e)), 400
    
        # Handle different event types
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            user_id = session['metadata']['user_id']
            # Logic to grant credits/time to the user in the database
    
        elif event['type'] == 'payment_intent.payment_failed':
            # Logic to notify the user of the failed payment
    
        elif event['type'] == 'charge.dispute.created':
            # Logic to alert the admin of a chargeback
    
        return jsonify(status='success'), 200
    
    # This server runs as a separate process from your main bot.py
    ```
    

---

#### **2. Smart Credit & Time-Based Session System**

This system allows users to purchase either consumable credits or temporary unlimited access.

- **Relationship & Setup**: Your `products` table in the database will have an `item_type` column (`credits` or `time`) and an `amount` column (number of credits or seconds). The `master_message_handler` in `src/bot.py` checks the user's balance before forwarding a message.
    
- **File Location**: `src/bot.py`, `src/database.py`, `scripts/setup_db.py`.
    
- **Code Implementation**:
    
    Python
    
    ```
    # scripts/setup_db.py - Add to your products table schema
    # item_type VARCHAR(20) NOT NULL, -- 'credits' or 'time'
    # amount INT NOT NULL -- Number of credits or seconds
    
    # src/bot.py - Inside the master_message_handler
    async def master_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.effective_user.id
        user = get_user_from_db(user_id) # Function to get user credits and time
    
        # Check for active time session first
        if user['time_credits_seconds'] > 0:
            # If time is active, forward the message without charging credits
            await context.bot.forward_message(...)
            return
    
        # If no time, check for sufficient credits
        cost = get_message_cost(update.message) # Get cost for text/photo/voice
        if user['message_credits'] >= cost:
            decrement_user_credits(user_id, cost)
            await context.bot.forward_message(...)
        else:
            await update.message.reply_text("You have insufficient credits to send this message.")
    ```
    

---

#### **3. Premium Content (Pay-to-Unlock)**

This feature lets you sell access to specific media files.

- **Relationship & Setup**: This requires a new table, `premium_content`, linking a `file_id` to a `product_id`. When a user purchases that product, an entry is made in a `user_purchases` table. A `CallbackQueryHandler` handles the "unlock" button press.
    
- **File Location**: `src/bot.py`, `scripts/setup_db.py`.
    
- **Code Implementation**:
    
    Python
    
    ```
    # src/bot.py - Example of sending a locked message
    async def send_locked_content(update: Update, context: ContextTypes.DEFAULT_TYPE, content_id):
        content = get_premium_content_from_db(content_id)
        product = get_product_from_db(content['product_id'])
    
        keyboard = [[InlineKeyboardButton(f"Unlock for ${product['price']}", callback_data=f"unlock_{content_id}")]]
        reply_markup = InlineKeyboardMarkup(keyboard)
    
        await update.message.reply_photo(
            photo=content['preview_file_id'], # A low-res preview
            caption=f"Unlock this exclusive content! {content['description']}",
            reply_markup=reply_markup
        )
    ```
    

---

#### **4. Auto-Recharge**

This feature provides convenience for users and a steady revenue stream for you.

- **Relationship & Setup**: Add `auto_recharge_enabled` (boolean) and `auto_recharge_amount` (integer) columns to your `users` table. The logic is triggered by the `payment_intent.payment_failed` webhook or a low balance alert in the `master_message_handler`, which would then attempt to create a new charge on the user's saved payment method.
    
- **File Location**: `src/bot.py`, `src/webhook_server.py`, `scripts/setup_db.py`.
    
- **Code Implementation**:
    
    Python
    
    ```
    # src/bot.py - Inside master_message_handler, after a message is sent
    user = get_user_from_db(user_id)
    if user['auto_recharge_enabled'] and user['message_credits'] <= LOW_BALANCE_THRESHOLD:
        try:
            # Use Stripe API to charge the customer's default payment method
            stripe.PaymentIntent.create(
                amount=user['auto_recharge_price_in_cents'],
                currency='usd',
                customer=user['stripe_customer_id'],
                off_session=True, # Critical for automatic charges
                confirm=True,
            )
            # A 'payment_intent.succeeded' webhook will handle adding credits
        except stripe.error.CardError as e:
            # A 'payment_intent.payment_failed' webhook will notify the user
            pass
    ```
    

---

### **Admin & Management Features**

These features provide the tools to efficiently manage the bot, its users, and conversations.

---

#### **1. Advanced Admin Panel & User Management**

The admin panel provides a centralized command center within Telegram.

- **Relationship & Setup**: The `/admin` command triggers a `ConversationHandler`. Each button in the menu (e.g., "Manage Users," "Edit Credits") leads to a different state in the conversation, prompting the admin for input. User management actions (ban, gift credits) call functions in your `database.py` module.
    
- **File Location**: `src/bot.py`, `src/database.py`.
    
- **Code Implementation**:
    
    Python
    
    ```
    # src/bot.py
    
    from telegram.ext import ConversationHandler
    
    # Define states for the conversation
    MANAGE_USERS, EDIT_USER_CREDITS = range(2)
    
    async def admin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
        # Display main admin menu with buttons
        # ...
        return 'ADMIN_MENU' # Entry point state
    
    async def manage_users_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
        # Show a list of users with buttons
        # ...
        return MANAGE_USERS
    
    async def select_user_to_edit_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
        # User selected, now show edit options (Ban, Gift, etc.)
        # ...
        return EDIT_USER_CREDITS
    
    # ... more handlers for each step ...
    
    # Setup the ConversationHandler in main()
    admin_handler = ConversationHandler(
        entry_points=[CommandHandler("admin", admin_command)],
        states={
            'ADMIN_MENU': [CallbackQueryHandler(manage_users_callback, pattern='manage_users')],
            MANAGE_USERS: [...],
            # ... other states ...
        },
        fallbacks=[CommandHandler("cancel", cancel_command)]
    )
    ```
    

---

#### **2. Topic-Based Conversation Management**

This is the core feature for organized support, creating a dedicated thread for each user in an admin group.

- **Relationship & Setup**: Your bot must be an admin in a Telegram group with "Topics" enabled. The bot needs permissions to manage topics. When a new user messages the bot, a helper function `get_or_create_user_topic` is called. The `master_message_handler` then routes messages to and from these topics.
    
- **File Location**: `src/bot.py`.
    
- **Code Implementation**:
    
    Python
    
    ```
    # src/bot.py
    
    ADMIN_GROUP_ID = -1002705423131 # Your admin group chat ID
    
    async def get_or_create_user_topic(context: ContextTypes.DEFAULT_TYPE, user_id, username):
        """Finds an existing topic for a user or creates a new one."""
        topic_id = get_topic_id_from_db(user_id) # DB call
        if topic_id:
            return topic_id
    
        # If no topic exists, create one
        try:
            topic_name = f"👤 {username} ({user_id})"
            topic = await context.bot.create_forum_topic(chat_id=ADMIN_GROUP_ID, name=topic_name)
    
            # Save the new topic_id to your database for this user
            save_topic_id_to_db(user_id, topic.message_thread_id)
    
            # Pin the user info card in the new topic
            await send_user_info_card(context, topic.message_thread_id, user_id)
    
            return topic.message_thread_id
        except Exception as e:
            # Handle case where bot can't create topic
            return None # Fallback to regular forwarding
    
    # Inside master_message_handler for an incoming user message:
    topic_id = await get_or_create_user_topic(context, user_id, username)
    if topic_id:
        await context.bot.forward_message(
            chat_id=ADMIN_GROUP_ID,
            from_chat_id=user_id,
            message_id=update.message.message_id,
            message_thread_id=topic_id
        )
    else:
        # Fallback to forwarding to the main group if topics fail
        await context.bot.forward_message(...)
    
    # Inside master_message_handler for an admin reply:
    if update.message.is_topic_message:
        topic_id = update.message.message_thread_id
        user_id_to_reply = get_user_id_from_topic_id(topic_id) # DB cal
        # ... logic to send the reply to user_id_to_reply ...

	```

This guide provides a more detailed, step-by-step approach to successfully implement the Topic-Based Conversation Management system. The improvements focus on initial setup, robust error handling, creating rich user information cards, and refining the message routing logic.

---

### **Improved Topic-Based Conversation Management**

This system creates a dedicated, threaded conversation for each user within a single admin group, providing a highly organized way to manage support and communication.

---

#### **Step 1: Prerequisites & Bot Permissions**

Before writing any code, you must correctly configure your Telegram environment.

1. **Create an Admin Group**: Create a new private Telegram group that will serve as your admin dashboard.
    
2. **Enable Topics**: In the group's settings, enable the "Topics" feature. This is essential for the system to work.
    
3. **Add Your Bot as an Admin**: Add your bot to the group and promote it to an administrator.
    
4. **Grant Permissions**: Ensure the bot has the following specific permissions:
    
    - **`Manage Topics`**: To create, edit, or delete topics.
        
    - **`Pin Messages`**: To pin the User Info Card in each topic.
        
    - **`Send Messages`**: To post forwarded messages and info cards.
        

---

#### **Step 2: Database Schema**

Your database needs a `conversations` table to link users to their dedicated topic threads.

- **File Location**: `scripts/setup_db.py`
    
- **Implementation**: Add the following table to your database schema. The `user_id` should be a foreign key to your `users` table.
    
    SQL
    
    ```
    CREATE TABLE conversations (
        user_id BIGINT PRIMARY KEY REFERENCES users(telegram_id),
        topic_id INT UNIQUE, -- Stores the Telegram topic ID
        last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_pinned BOOLEAN DEFAULT FALSE,
        notes TEXT -- For private admin notes
    );
    
    -- Create an index for efficient lookups from topic_id back to user_id
    CREATE INDEX idx_conversations_topic_id ON conversations(topic_id);
    ```
    

---

#### **Step 3: Configuration**

Your application needs to know the ID of your admin group.

- **File Location**: `.env` and `src/config.py`
    
- **Implementation**:
    
    1. Add the `ADMIN_GROUP_ID` to your `.env` file. To get the ID, you can temporarily add a bot like `@userinfobot` to your group. The ID will be a negative number.
        
    2. Load this variable in your `src/config.py` module.
        
        Python
        
        ```
        # src/config.py
        import os
        
        ADMIN_GROUP_ID = int(os.environ.get("ADMIN_GROUP_ID"))
        ```
        

---

#### **Step 4: Code Implementation**

This involves creating helper functions and the main message routing handler.

- **File Location**: `src/bot.py`
    
- **Implementation**:
    
    **1. Create the `send_user_info_card` function:** This function creates the pinned message that gives admins immediate context about the user.
    
    Python
    
    ```
    # src/bot.py
    from telegram import InlineKeyboardButton, InlineKeyboardMarkup
    
    async def send_user_info_card(context: ContextTypes.DEFAULT_TYPE, topic_id: int, user_id: int):
        """Creates and pins a card with user details and quick-action buttons in a topic."""
        user_data = db.get_user_dashboard_info(user_id) # A DB function to get user tier, credits, etc.
    
        if not user_data:
            return
    
        text = (
            f"👤 **User: @{user_data['username']}** (ID: `{user_id}`)\n"
            f"🏆 Tier: {user_data['tier']}\n"
            f"💰 Credits: {user_data['message_credits']}\n"
            f"🕒 Time: {user_data['time_credits_seconds'] // 60} min"
        )
    
        keyboard = [
            [InlineKeyboardButton("👤 User Info", callback_data=f"admin_user_info_{user_id}")],
            [InlineKeyboardButton("🎁 Gift Credits", callback_data=f"admin_gift_{user_id}")],
            [InlineKeyboardButton("🚫 Ban User", callback_data=f"admin_ban_{user_id}")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
    
        try:
            info_message = await context.bot.send_message(
                chat_id=ADMIN_GROUP_ID,
                text=text,
                message_thread_id=topic_id,
                reply_markup=reply_markup,
                parse_mode='Markdown'
            )
            await context.bot.pin_chat_message(
                chat_id=ADMIN_GROUP_ID,
                message_id=info_message.message_id
            )
        except Exception as e:
            print(f"Error sending/pinning info card: {e}")
    ```
    
    **2. Create the `get_or_create_user_topic` function:** This is the core logic for managing threads.
    
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
            db.save_user_topic(user_id, new_topic_id)
            await send_user_info_card(context, new_topic_id, user_id)
            return new_topic_id
        except Exception as e:
            print(f"Could not create topic for user {user_id}: {e}")
            # Fallback: Send an alert to the admin group's "General" topic if creation fails
            await context.bot.send_message(chat_id=ADMIN_GROUP_ID, text=f"🚨 **Critical Error** 🚨\nCould not create a topic for user @{username} (`{user_id}`). Their messages will be forwarded here.")
            return None
    ```
    
    **3. Implement the `master_message_handler`:** This handler intelligently routes all messages.
    
    Python
    
    ```
    # src/bot.py
    
    async def master_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = update.effective_user
        chat = update.effective_chat
    
        # CASE 1: Admin replying inside a topic in the admin group
        if chat.id == ADMIN_GROUP_ID and update.message.is_topic_message and update.message.reply_to_message:
            topic_id = update.message.message_thread_id
            user_to_reply_id = db.get_user_id_from_topic(topic_id) # DB call
    
            if user_to_reply_id:
                try:
                    await context.bot.copy_message(chat_id=user_to_reply_id, from_chat_id=chat.id, message_id=update.message.message_id)
                    # Optional: Add a checkmark reaction to confirm the reply was sent
                    await update.message.react(reaction="✅")
                except Exception as e:
                    await update.message.reply_text(f"❌ Failed to send reply to user: {e}")
            return
    
        # CASE 2: Message from a user in a private chat
        if chat.type == 'private':
            # ... (Your logic to check for credits/time before proceeding) ...
    
            topic_id = await get_or_create_user_topic(context, user.id, user.username)
    
            # Forward the user's message to their dedicated topic (if it exists)
            if topic_id:
                await context.bot.forward_message(
                    chat_id=ADMIN_GROUP_ID,
                    from_chat_id=user.id,
                    message_id=update.message.message_id,
                    message_thread_id=topic_id
                )
            else:
                # Fallback if topic creation failed
                await context.bot.forward_message(chat_id=ADMIN_GROUP_ID, from_chat_id=user.id, message_id=update.message.message_id)
    ```
    

---

#### **Step 5: Register the Handler**

Finally, ensure the `master_message_handler` is registered to listen to all relevant message types in your main application setup.

Python

```
# In your main() function where you set up the application
from telegram.ext import MessageHandler, filters

# The handler should listen to all messages that are not commands
application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, master_message_handler))
application.add_handler(MessageHandler(filters.PHOTO | filters.VOICE | filters.VIDEO | filters.DOCUMENT, master_message_handler))
```
---

### **Visual UX & User Engagement Features**

This section details how to implement a rich user experience with interactive commands, visual feedback, and smart notifications. These features are primarily handled within your main `src/bot.py` file, with some configuration in `src/config.py` and potential database additions.

---

#### **1. Improved Welcome Message & Start Button**

An engaging welcome message with a clear call-to-action improves user onboarding.

- **Relationship & Setup**: This is handled by the `/start` command handler. Instead of just sending text, you will create an `InlineKeyboardMarkup` with a single "Start" button. A `CallbackQueryHandler` will then listen for the button press, edit the original message, and display the product list.
    
- **File Location**: `src/bot.py`
    
- **Code Implementation**:
    
    Python
    
    ```
    # src/bot.py
    
    from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
    from telegram.ext import CommandHandler, CallbackQueryHandler, ContextTypes
    
    # --- Welcome Message Handler ---
    async def welcome_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Sends the initial welcome message with a Start button."""
        keyboard = [[InlineKeyboardButton("▶️ Start", callback_data="show_products")]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        welcome_text = "👋 Welcome to the Premium Messaging service! Here you can chat directly with the creator. Click 'Start' below to see the available credit packages and get started!"
        await update.message.reply_text(welcome_text, reply_markup=reply_markup)
    
    # --- Start Button Handler ---
    async def show_products_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handles the 'Start' button click to show products."""
        query = update.callback_query
        await query.answer() # Acknowledge the button press
    
        # Fetch active products from the database
        products = get_active_products() # Assuming this function exists in your database module
    
        keyboard = [[InlineKeyboardButton(prod['label'], callback_data=f"buy_{prod['id']}")] for prod in products]
        reply_markup = InlineKeyboardMarkup(keyboard)
    
        await query.edit_message_text("Please choose a package to get started:", reply_markup=reply_markup)
    
    # --- In your main() function, register the handlers ---
    # application.add_handler(CommandHandler("start", welcome_message))
    # application.add_handler(CallbackQueryHandler(show_products_callback, pattern="^show_products$"))
    ```
    

---

#### **2. Quick-Buy Commands**

These commands allow returning users to purchase credits instantly without navigating menus.

- **Relationship & Setup**: You will create a separate `CommandHandler` for each quick-buy command (e.g., `/buy10`, `/buy25`). This handler will fetch the corresponding product's Stripe Price ID from your database and immediately initiate the payment flow.
    
- **File Location**: `src/bot.py`
    
- **Code Implementation**:
    
    Python
    
    ```
    # src/bot.py
    
    # --- Quick-Buy Command Handler ---
    async def quick_buy_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handles commands like /buy10, /buy25."""
        command = update.message.text.split('@')[0] # Clean command
    
        # Example: parse amount from command like "/buy10"
        try:
            amount_to_buy = int(command.replace("/buy", ""))
        except (ValueError, TypeError):
            await update.message.reply_text("Invalid quick-buy command.")
            return
    
        # Fetch the specific product from the database
        # This requires a new DB function, e.g., get_product_by_credit_amount()
        product = get_product_by_credit_amount(amount_to_buy)
    
        if not product:
            await update.message.reply_text(f"Sorry, no package found for {amount_to_buy} credits.")
            return
    
        # Initiate Stripe checkout flow (assuming you have this function)
        payment_url = await create_stripe_checkout(update.effective_user.id, product['stripe_price_id'])
    
        await update.message.reply_text(f"Click here to purchase {amount_to_buy} credits: {payment_url}")
    
    # --- In your main() function, register the handlers ---
    # from telegram.ext import filters
    # application.add_handler(CommandHandler(["buy10", "buy25", "buy50"], quick_buy_command, filters=filters.COMMAND))
    ```
    

---

#### **3. Credit Visualization & Low Balance Alerts**

Visual feedback helps users manage their balance, and proactive alerts encourage top-ups.

- **Relationship & Setup**: A helper function will generate the progress bar string. This function will be called by the `/balance` command handler and within the `master_message_handler` after a message is successfully sent. The low balance check also occurs in the `master_message_handler`.
    
- **File Location**: `src/bot.py` (handler logic), `src/config.py` (alert threshold)
    
- **Code Implementation**:
    
    Python
    
    ```
    # src/config.py
    # Add a new setting for the low balance threshold
    LOW_BALANCE_THRESHOLD = 10 # Alert user when credits fall below 10
    
    # src/bot.py
    
    # --- Helper function for credit visualization ---
    def create_progress_bar(current, total, length=10):
        """Creates a text-based progress bar."""
        if total == 0: return "[░░░░░░░░░░] 0%"
        percent = int((current / total) * 100)
        filled_length = int(length * current // total)
        bar = '█' * filled_length + '░' * (length - filled_length)
        return f"[{bar}] {percent}%"
    
    # --- Balance Command Handler ---
    async def balance_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Displays user's credit balance with a progress bar."""
        user_id = update.effective_user.id
        credits = get_user_credits(user_id) # Fetch from DB
    
        # Assuming a user's "total" credits could be the last package they bought,
        # or a standard "100" for visualization purposes. This logic can be adapted.
        total_credits_for_vis = 100 # Example total
        bar = create_progress_bar(credits, total_credits_for_vis)
    
        await update.message.reply_text(f"Your Balance:\nCredits: {credits}\n{bar}")
    
    # --- Update the Master Message Handler ---
    async def master_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
        # ... existing logic to check for admin replies, etc. ...
    
        # After successfully sending a message and decrementing credits:
        new_credits = decrement_user_credits(user_id, cost)
        await update.message.reply_text(f"Message sent! You have {new_credits} credits left.")
    
        # Check for low balance alert
        if new_credits > 0 and new_credits <= LOW_BALANCE_THRESHOLD:
            await update.message.reply_text(f"⚠️ Low Balance Alert! You only have {new_credits} credits remaining. Use /start to buy more.")
    
        # Prevent messaging at zero/low credits
        # This check should happen *before* forwarding the message to the admin
        current_credits = get_user_credits(update.effective_user.id)
        if current_credits < cost:
             await update.message.reply_text("You do not have enough credits to send this message. Please use /start to buy more.")
             return # Stop processing
    ```


The existing implementation for credit visualization and low balance alerts can be improved by making it more robust and context-aware. This involves centralizing the logic, adding more dynamic user feedback, and clearly defining how different system components interact.

---

### **Improved Credit Visualization & Balance Alerts**

This enhanced approach provides users with clear, immediate feedback on their credit status while preventing them from sending messages they cannot afford.

#### **1. Centralized Balance & Notification Logic**

Instead of scattering balance checks, centralize the logic into a single helper function. This function will be responsible for sending the balance update and triggering any necessary alerts.

- **Relationship & Setup**: This helper function, `send_balance_update`, will be called from the `/balance` command and from the `master_message_handler` after a user's credits are decremented. The logic to prevent messaging with insufficient funds should be the very first check in the `master_message_handler`.
    
- **File Location**: `src/bot.py` (handlers), `src/config.py` (thresholds).
    

#### **2. Implementation Details & Code**

This implementation ensures that the balance check is efficient and that notifications are sent at the correct time.

- **Define Thresholds in `config.py`**: Your configuration file should hold the alert thresholds for both credits and time sessions.
    
    Python
    
    ```
    # src/config.py
    
    # User-facing alerts
    LOW_CREDIT_ALERT_THRESHOLD = 10  # Alert when credits fall below this number
    LOW_TIME_ALERT_MINUTES = 5       # Alert when a time session has less than 5 minutes left
    ```
    
- **Create the Centralized Helper Function in `bot.py`**: This function generates the complete message, including the progress bar and any relevant alerts.
    
    Python
    
    ```
    # src/bot.py
    
    def create_progress_bar(current, total, length=10):
        """Creates a text-based progress bar."""
        if total == 0: return "[░░░░░░░░░░] 0%"
        percent = int((current / total) * 100)
        filled_length = int(length * current // total)
        bar = '█' * filled_length + '░' * (length - filled_length)
        return f"[{bar}] {percent}%"
    
    async def send_balance_update(update: Update, context: ContextTypes.DEFAULT_TYPE, user_id: int):
        """Sends a user a formatted message with their current balance and any relevant alerts."""
        user_balance = get_user_balance(user_id) # A DB function that returns both credits and time
        message_parts = []
    
        # Handle credit visualization
        if user_balance['message_credits'] is not None:
            bar = create_progress_bar(user_balance['message_credits'], 100) # Assuming 100 is a good visual max
            message_parts.append(f"Credits: {user_balance['message_credits']}\n{bar}")
            if 0 < user_balance['message_credits'] <= LOW_CREDIT_ALERT_THRESHOLD:
                message_parts.append("\n⚠️ **Low Balance Alert!** You're running low on credits. Use /start to top up.")
    
        await update.effective_chat.send_message("\n".join(message_parts))
    
    ```
    
- **Update the `/balance` Command Handler**: The `/balance` command now simply calls the new helper function.
    
    Python
    
    ```
    # src/bot.py
    
    async def balance_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handles the /balance command."""
        await send_balance_update(update, context, update.effective_user.id)
    ```
    
- **Update the `master_message_handler`**: The main message handler now contains two key checks: one at the beginning to block messages and one at the end to provide an update.
    
    Python
    
    ```
    # src/bot.py
    
    async def master_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.effective_user.id
        cost = get_cost_for_message(update.message) # Get cost for text/photo etc.
        user_credits = get_user_credits(user_id)
    
        # 1. Prevent messaging if credits are insufficient (CRITICAL FIRST STEP)
        if user_credits < cost:
            await update.message.reply_text("You do not have enough credits to send this message. Please use /start to buy more.")
            return # Stop all further processing
    
        # ... (Your existing logic to forward the message to the admin topic) ...
    
        # 2. Decrement credits after successful forwarding
        decrement_user_credits(user_id, cost)
    
        # 3. Send the balance update to the user
        await send_balance_update(update, context, user_id)
    ```

---

#### **4. Self-Service Portals & Smart Notifications**

These commands empower users to manage their own accounts and receive important updates automatically.

- **Relationship & Setup**: The `/billing` command will generate a link to the Stripe Customer Portal. This requires an API call to Stripe. The `/autorecharge` command requires adding a boolean column (`auto_recharge_enabled`) to your `users` table and a `ConversationHandler` to guide the user through setup.
    
- **File Location**: `src/bot.py`, `scripts/setup_db.py` (for DB changes)
    
- **Code Implementation**:
    
    Python
    
    ```
    # scripts/setup_db.py
    # Add to your users table schema:
    # auto_recharge_enabled BOOLEAN DEFAULT FALSE,
    # auto_recharge_amount INT DEFAULT 25 -- e.g., recharge with 25 credits
    
    # src/bot.py
    import stripe
    
    # --- Billing Portal Command ---
    async def billing_portal_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Generates a link to the Stripe Customer Portal."""
        # You need the user's Stripe Customer ID, which should be saved during their first purchase
        stripe_customer_id = get_stripe_customer_id(update.effective_user.id)
    
        if not stripe_customer_id:
            await update.message.reply_text("You must make a purchase before accessing the billing portal.")
            return
    
        try:
            session = stripe.billing_portal.Session.create(
                customer=stripe_customer_id,
                return_url=f"https://t.me/{context.bot.username}", # Return to the bot
            )
            await update.message.reply_text(f"Click here to manage your payment methods: {session.url}")
        except Exception as e:
            await update.message.reply_text(f"Could not create billing session: {e}")
    
    # --- Auto-Recharge and other notifications ---
    # The logic for auto-recharge would be handled in your Stripe webhook for failed payments.
    # When `payment_intent.payment_failed` is received for a user with auto-recharge enabled,
    # your webhook server would trigger a Telegram message to that user.
    # This keeps the payment logic separate from the main bot logic.
    ```
Of course. Here is a detailed breakdown of how to implement the system architecture shown in the diagram, including code relationships, file locations, and setup instructions.

---

### **Implementing the System Architecture**

This guide explains how to set up the core data flows outlined in the System Architecture Diagram. The architecture relies on webhooks for real-time communication and separates concerns between the main bot application, a webhook server, and a database module.

---

#### **1. Telegram ↔ Bot Communication (Webhooks)**

The primary interaction between the Telegram API and your bot is handled via webhooks, not polling. This is more efficient and scalable for a production environment.

- **Relationship**: When a user interacts with your bot (e.g., sends a message), Telegram sends an HTTP POST request with the update data to a public URL you provide. Your application listens for these requests, processes them, and then uses standard API calls to send responses back to the user.
    
- **File Location**: The webhook listener is handled in `src/webhook_server.py`. The logic for processing updates and sending replies resides in `src/bot.py`.
    
- **Setup & Code Implementation**:
    
    1. **Create the Webhook Server**: Your `src/webhook_server.py` needs to run a web framework (like Flask or FastAPI) to create an endpoint that accepts data from Telegram. This server will run as your main application process on the hosting platform.
        
        Python
        
        ```
        # src/webhook_server.py
        import asyncio
        from flask import Flask, request
        from telegram import Update
        from bot import application  # Import your bot's application instance
        
        app = Flask(__name__)
        
        @app.route("/telegram-webhook", methods=['POST'])
        async def telegram_webhook_handler():
            """Handles incoming updates from Telegram."""
            data = request.get_json(force=True)
            update = Update.de_json(data, application.bot)
            await application.process_update(update)
            return {"status": "ok"}
        
        @app.route("/health", methods=['GET'])
        def health_check():
            """Health check endpoint for the hosting platform."""
            return {"status": "healthy"}
        
        # The server would be run using a production-grade WSGI server like Gunicorn
        ```
        
    2. **Set the Webhook with Telegram**: After deploying your bot and getting a public URL (e.g., from Railway), you must tell Telegram where to send updates. This is a one-time setup performed by sending a request to the Telegram API.
        
        Bash
        
        ```
        # Replace <YOUR_BOT_TOKEN> and <YOUR_PUBLIC_URL>
        curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_PUBLIC_URL>/telegram-webhook"
        ```
        

---

#### **2. Bot ↔ Database Interaction**

All persistent data—including user information, credits, products, settings, and conversation topics—is stored in a PostgreSQL database.

- **Relationship**: Your bot application in `src/bot.py` never connects to the database directly. Instead, it calls helper functions from the `src/database.py` module. This module manages all SQL queries and uses a **connection pool** for efficient, high-performance database access.
    
- **File Location**: The connection pool and all SQL logic are in `src/database.py`. The database schema is initialized by `scripts/setup_db.py`.
    
- **Setup & Code Implementation**:
    
    1. **Initialize the Database**: First, run `python scripts/setup_db.py` to create all the necessary tables and indexes.
        
    2. **Implement the Database Module**: Your `src/database.py` should contain functions for every required database operation.
        
        Python
        
        ```
        # src/database.py
        from psycopg2 import pool
        
        # Initialize the connection pool once when the module is loaded
        db_pool = pool.ThreadedConnectionPool(minconn=1, maxconn=20, dsn=DATABASE_URL)
        
        def get_user_credits(user_id: int) -> int:
            """Fetches a user's credits, managing the connection from the pool."""
            conn = None
            try:
                conn = db_pool.getconn()
                with conn.cursor() as cur:
                    cur.execute("SELECT message_credits FROM users WHERE telegram_id = %s", (user_id,))
                    result = cur.fetchone()
                    return result[0] if result else 0
            finally:
                if conn:
                    db_pool.putconn(conn) # Return the connection to the pool
        ```
        

---

#### **3. Bot ↔ Stripe API Interaction**

Communication with Stripe is two-way: your bot makes API calls to create payment sessions, and it receives webhooks from Stripe when payments are completed.

- **Relationship**:
    
    - **Bot → Stripe**: When a user clicks a "buy" button, your `src/bot.py` calls the Stripe API to create a `Checkout Session` and gets a payment URL to send to the user.
        
    - **Stripe → Bot**: When the user pays, Stripe sends a `checkout.session.completed` event to your `src/webhook_server.py`, which then updates the user's credits in the database.
        
- **File Location**: Creating payment sessions is handled in `src/bot.py`. Receiving Stripe webhooks is handled in `src/webhook_server.py`.
    
- **Setup & Code Implementation**:
    
    1. **Create the Checkout Session**: This function is called from a command or button handler in `bot.py`.
        
        Python
        
        ```
        # src/bot.py (inside a handler)
        import stripe
        
        async def handle_buy_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
            product = get_product_from_db(...) # Fetch product details
            user_id = update.effective_user.id
        
            checkout_session = stripe.checkout.Session.create(
                line_items=[{'price': product['stripe_price_id'], 'quantity': 1}],
                mode='payment',
                success_url="https://t.me/your_bot_username",
                cancel_url="https://t.me/your_bot_username",
                metadata={'user_id': user_id} # Critical for identifying the user later
            )
            await update.callback_query.message.reply_text(f"Click to pay: {checkout_session.url}")
        ```
        
    2. **Handle the Stripe Webhook**: This code resides in your webhook server. It's the same server that handles Telegram webhooks but at a different endpoint.
        
        Python
        
        ```
        # src/webhook_server.py
        
        @app.route("/stripe-webhook", methods=['POST'])
        def stripe_webhook_handler():
            # ... (Signature verification logic as shown previously) ...
        
            event = stripe.Webhook.construct_event(...)
        
            if event['type'] == 'checkout.session.completed':
                session = event['data']['object']
                user_id = int(session['metadata']['user_id'])
                # Look up the product purchased and add credits/time to the user in the database
                add_credits_to_user(user_id, ...)
        
            return {"status": "ok"}
        ```

Here is the improved and expanded version of the build instructions, complete with detailed implementation steps, code examples, and setup guidance based on the provided documentation.

---

### **Step 1: Database Schema & Setup** 🗄️

You'll create a `scripts/setup_db.py` file to initialize a PostgreSQL database. This schema is designed not just for data storage but also for performance and business intelligence.

#### **Implementation Details**

Your setup script should execute the following SQL to create a comprehensive database structure.

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

-- Core Table for Transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(telegram_id),
    product_id INT REFERENCES products(id),
    stripe_charge_id VARCHAR(255) NOT NULL,
    amount_paid_usd_cents INT NOT NULL,
    credits_purchased INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Management & Analytics Tables
CREATE TABLE conversations (
    user_id BIGINT PRIMARY KEY REFERENCES users(telegram_id),
    topic_id INT, -- Stores the Telegram topic ID for the user's thread
    last_message_at TIMESTAMP,
    unread_messages INT DEFAULT 0,
    priority_level INT DEFAULT 0, -- Calculated priority for sorting
    is_pinned BOOLEAN DEFAULT FALSE
);

CREATE TABLE daily_metrics (
    date DATE PRIMARY KEY,
    active_users INT,
    new_users INT,
    revenue_cents INT
);

-- Performance Indexes
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_conversations_priority ON conversations(priority_level DESC);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Dashboard Views for easy analytics
CREATE OR REPLACE VIEW user_dashboard AS
SELECT u.telegram_id, u.username, u.tier, u.message_credits, SUM(t.amount_paid_usd_cents) as total_spent
FROM users u
LEFT JOIN transactions t ON u.telegram_id = t.user_id
GROUP BY u.telegram_id;

CREATE OR REPLACE VIEW revenue_dashboard AS
SELECT date, SUM(revenue_cents) as daily_revenue
FROM daily_metrics
GROUP BY date
ORDER BY date DESC;
```

---

### **Step 2: Backend Core Modules (in `src/`)** ⚙️

Develop the core backend modules inside the `src/` directory to ensure a robust and maintainable application.

- **`config.py`**: A centralized module to manage and validate all environment variables and constants. This prevents runtime errors from missing configuration.
    
- **`database.py`**: The database interaction layer. It **must** use a `psycopg2` **connection pool** to efficiently manage connections, which is critical for performance.
    
- **`cache.py`**: A simple caching layer to store frequently accessed data like bot settings, reducing database load.
    
- **`error_handler.py`**: A global error handler to catch all unhandled exceptions, notify the admin, and provide user-friendly error messages.
    

#### **Implementation Details**

Python

```
# src/database.py - Connection Pooling Example
from psycopg2 import pool
import os

# Initialize the pool once
db_pool = pool.ThreadedConnectionPool(minconn=1, maxconn=20, dsn=os.environ.get("DATABASE_URL"))

def execute_query(query, params=None, fetch=None):
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            if fetch == 'one':
                return cur.fetchone()
            if fetch == 'all':
                return cur.fetchall()
            conn.commit()
    finally:
        db_pool.putconn(conn)

# src/cache.py - Caching Decorator Example
import time

cache_storage = {}
CACHE_TTL = 300  # 5 minutes

def cached(func):
    def wrapper(*args, **kwargs):
        key = f"{func.__name__}:{args}:{kwargs}"
        if key in cache_storage and time.time() - cache_storage[key]['timestamp'] < CACHE_TTL:
            return cache_storage[key]['value']
        
        result = func(*args, **kwargs)
        cache_storage[key] = {'value': result, 'timestamp': time.time()}
        return result
    return wrapper

# src/error_handler.py - Global Error Handler Example
async def handle_all_exceptions(update, context):
    error = context.error
    # Log the full error
    print(f"Unhandled exception: {error}")
    # Notify admin
    await context.bot.send_message(chat_id=ADMIN_CHAT_ID, text=f"🚨 An error occurred: {error}")
    # Notify user
    if update and update.effective_chat:
        await update.effective_chat.send_message("Sorry, an unexpected error occurred. The issue has been reported.")
```

---

### **Step 3: The Bot Logic (`src/bot.py`)** 🤖

This is the main application file containing the handlers for all user and admin interactions.

- **Topic-Based Conversation Management**: This is the cornerstone admin feature.
    
    - When a new user sends their first message, the bot must automatically create a new **topic** in the designated admin group.
        
    - The topic should be named with the user's identity (e.g., `👤 [Username] ([UserID])`).
        
    - The bot must immediately send and pin a **User Info Card** in the new topic, showing the user's credits, tier, and other relevant details.
        
    - The new `topic_id` must be saved to the `conversations` table in the database.
        
- **Message Routing Handler**:
    
    - **User to Admin**: When a message comes from a user, the bot retrieves their `topic_id` from the database and forwards the message into that specific topic.
        
    - **Admin to User**: When an admin replies _inside a topic_, the bot detects this, looks up the user associated with that `topic_id`, and sends the reply directly to that user.
        

#### **Implementation Details**

Python

```
# src/bot.py
from telegram import Update
from telegram.ext import ContextTypes

ADMIN_GROUP_ID = -1002705423131 # Your admin group chat ID

async def get_or_create_user_topic(context: ContextTypes.DEFAULT_TYPE, user_id, username):
    # 1. Check DB for existing topic_id
    topic_id = db.get_user_topic(user_id) # Assumes db helper function
    if topic_id:
        return topic_id

    # 2. If not found, create a new topic
    try:
        topic = await context.bot.create_forum_topic(chat_id=ADMIN_GROUP_ID, name=f"👤 {username} ({user_id})")
        new_topic_id = topic.message_thread_id
        db.save_user_topic(user_id, new_topic_id) # Save to DB

        # 3. Pin the user info card
        user_info = db.get_user_info(user_id)
        info_text = f"User: @{username}\nID: {user_id}\nTier: {user_info['tier']}"
        info_message = await context.bot.send_message(chat_id=ADMIN_GROUP_ID, text=info_text, message_thread_id=new_topic_id)
        await context.bot.pin_chat_message(chat_id=ADMIN_GROUP_ID, message_id=info_message.message_id)
        
        return new_topic_id
    except Exception as e:
        print(f"Could not create topic: {e}")
        return None

async def master_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    chat = update.effective_chat

    # If message is from an admin replying inside a topic
    if chat.id == ADMIN_GROUP_ID and update.message.is_topic_message and update.message.reply_to_message:
        topic_id = update.message.message_thread_id
        user_to_reply_id = db.get_user_id_from_topic(topic_id)
        if user_to_reply_id:
            # Forward the admin's reply to the user
            await context.bot.copy_message(chat_id=user_to_reply_id, from_chat_id=chat.id, message_id=update.message.message_id)
        return

    # If message is from a user in a private chat
    if chat.type == 'private':
        topic_id = await get_or_create_user_topic(context, user.id, user.username)
        if topic_id:
            # Forward the user's message to their dedicated topic
            await context.bot.forward_message(chat_id=ADMIN_GROUP_ID, from_chat_id=user.id, message_id=update.message.message_id, message_thread_id=topic_id)
```

---

### **Step 4: The Webhook Server (`src/webhook_server.py`)** 🔌

A robust payment system requires handling more than just successful purchases. Use a web framework like Flask or FastAPI to create a webhook server that listens for multiple Stripe events.

- **`checkout.session.completed`**: Grants credits/time upon a successful purchase.
    
- **`payment_intent.payment_failed`**: Notifies a user when their payment fails, which is critical for auto-recharge.
    
- **`payment_method.attached`**: Confirms to the user that their payment method has been successfully saved.
    
- **`charge.dispute.created`**: Immediately alerts the admin via a Telegram message when a user initiates a chargeback.
    

#### **Implementation Details**

Python

```
# src/webhook_server.py
from flask import Flask, request, jsonify
import stripe
import os

app = Flask(__name__)
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")

@app.route("/stripe-webhook", methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        return jsonify(status='error', message=str(e)), 400

    # Handle different event types
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = int(session.get('metadata', {}).get('user_id'))
        # Logic to add credits/time to the user in the DB
        
    elif event['type'] == 'payment_intent.payment_failed':
        # Logic to notify the user via Telegram that their payment failed
        
    elif event['type'] == 'payment_method.attached':
        # Logic to notify the user that their card was saved successfully
        
    elif event['type'] == 'charge.dispute.created':
        # Logic to send an urgent alert to the admin's Telegram chat
    
    return jsonify(status='success'), 200

if __name__ == '__main__':
    app.run(port=8000)
```



---

### **Step 1: Database Schema & Setup** 🗄️

You'll create a `scripts/setup_db.py` file to initialize a PostgreSQL database. This schema is designed not just for data storage but also for performance and business intelligence.

#### **Implementation Details**

Your setup script should execute the following SQL to create a comprehensive database structure.

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

-- Core Table for Transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(telegram_id),
    product_id INT REFERENCES products(id),
    stripe_charge_id VARCHAR(255) NOT NULL,
    amount_paid_usd_cents INT NOT NULL,
    credits_purchased INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Management & Analytics Tables
CREATE TABLE conversations (
    user_id BIGINT PRIMARY KEY REFERENCES users(telegram_id),
    topic_id INT, -- Stores the Telegram topic ID for the user's thread
    last_message_at TIMESTAMP,
    unread_messages INT DEFAULT 0,
    priority_level INT DEFAULT 0, -- Calculated priority for sorting
    is_pinned BOOLEAN DEFAULT FALSE
);

CREATE TABLE daily_metrics (
    date DATE PRIMARY KEY,
    active_users INT,
    new_users INT,
    revenue_cents INT
);

-- Performance Indexes
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_conversations_priority ON conversations(priority_level DESC);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Dashboard Views for easy analytics
CREATE OR REPLACE VIEW user_dashboard AS
SELECT u.telegram_id, u.username, u.tier, u.message_credits, SUM(t.amount_paid_usd_cents) as total_spent
FROM users u
LEFT JOIN transactions t ON u.telegram_id = t.user_id
GROUP BY u.telegram_id;

CREATE OR REPLACE VIEW revenue_dashboard AS
SELECT date, SUM(revenue_cents) as daily_revenue
FROM daily_metrics
GROUP BY date
ORDER BY date DESC;
```

---

### **Step 2: Backend Core Modules (in `src/`)** ⚙️

Develop the core backend modules inside the `src/` directory to ensure a robust and maintainable application.

- **`config.py`**: A centralized module to manage and validate all environment variables and constants. This prevents runtime errors from missing configuration.
    
- **`database.py`**: The database interaction layer. It **must** use a `psycopg2` **connection pool** to efficiently manage connections, which is critical for performance.
    
- **`cache.py`**: A simple caching layer to store frequently accessed data like bot settings, reducing database load.
    
- **`error_handler.py`**: A global error handler to catch all unhandled exceptions, notify the admin, and provide user-friendly error messages.
    

#### **Implementation Details**

Python

```
# src/database.py - Connection Pooling Example
from psycopg2 import pool
import os

# Initialize the pool once
db_pool = pool.ThreadedConnectionPool(minconn=1, maxconn=20, dsn=os.environ.get("DATABASE_URL"))

def execute_query(query, params=None, fetch=None):
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            if fetch == 'one':
                return cur.fetchone()
            if fetch == 'all':
                return cur.fetchall()
            conn.commit()
    finally:
        db_pool.putconn(conn)

# src/cache.py - Caching Decorator Example
import time

cache_storage = {}
CACHE_TTL = 300  # 5 minutes

def cached(func):
    def wrapper(*args, **kwargs):
        key = f"{func.__name__}:{args}:{kwargs}"
        if key in cache_storage and time.time() - cache_storage[key]['timestamp'] < CACHE_TTL:
            return cache_storage[key]['value']
        
        result = func(*args, **kwargs)
        cache_storage[key] = {'value': result, 'timestamp': time.time()}
        return result
    return wrapper

# src/error_handler.py - Global Error Handler Example
async def handle_all_exceptions(update, context):
    error = context.error
    # Log the full error
    print(f"Unhandled exception: {error}")
    # Notify admin
    await context.bot.send_message(chat_id=ADMIN_CHAT_ID, text=f"🚨 An error occurred: {error}")
    # Notify user
    if update and update.effective_chat:
        await update.effective_chat.send_message("Sorry, an unexpected error occurred. The issue has been reported.")
```

---

### **Step 3: The Bot Logic (`src/bot.py`)** 🤖

This is the main application file containing the handlers for all user and admin interactions.

- **Topic-Based Conversation Management**: This is the cornerstone admin feature.
    
    - When a new user sends their first message, the bot must automatically create a new **topic** in the designated admin group.
        
    - The topic should be named with the user's identity (e.g., `👤 [Username] ([UserID])`).
        
    - The bot must immediately send and pin a **User Info Card** in the new topic, showing the user's credits, tier, and other relevant details.
        
    - The new `topic_id` must be saved to the `conversations` table in the database.
        
- **Message Routing Handler**:
    
    - **User to Admin**: When a message comes from a user, the bot retrieves their `topic_id` from the database and forwards the message into that specific topic.
        
    - **Admin to User**: When an admin replies _inside a topic_, the bot detects this, looks up the user associated with that `topic_id`, and sends the reply directly to that user.
        

#### **Implementation Details**

Python

```
# src/bot.py
from telegram import Update
from telegram.ext import ContextTypes

ADMIN_GROUP_ID = -1002705423131 # Your admin group chat ID

async def get_or_create_user_topic(context: ContextTypes.DEFAULT_TYPE, user_id, username):
    # 1. Check DB for existing topic_id
    topic_id = db.get_user_topic(user_id) # Assumes db helper function
    if topic_id:
        return topic_id

    # 2. If not found, create a new topic
    try:
        topic = await context.bot.create_forum_topic(chat_id=ADMIN_GROUP_ID, name=f"👤 {username} ({user_id})")
        new_topic_id = topic.message_thread_id
        db.save_user_topic(user_id, new_topic_id) # Save to DB

        # 3. Pin the user info card
        user_info = db.get_user_info(user_id)
        info_text = f"User: @{username}\nID: {user_id}\nTier: {user_info['tier']}"
        info_message = await context.bot.send_message(chat_id=ADMIN_GROUP_ID, text=info_text, message_thread_id=new_topic_id)
        await context.bot.pin_chat_message(chat_id=ADMIN_GROUP_ID, message_id=info_message.message_id)
        
        return new_topic_id
    except Exception as e:
        print(f"Could not create topic: {e}")
        return None

async def master_message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    chat = update.effective_chat

    # If message is from an admin replying inside a topic
    if chat.id == ADMIN_GROUP_ID and update.message.is_topic_message and update.message.reply_to_message:
        topic_id = update.message.message_thread_id
        user_to_reply_id = db.get_user_id_from_topic(topic_id)
        if user_to_reply_id:
            # Forward the admin's reply to the user
            await context.bot.copy_message(chat_id=user_to_reply_id, from_chat_id=chat.id, message_id=update.message.message_id)
        return

    # If message is from a user in a private chat
    if chat.type == 'private':
        topic_id = await get_or_create_user_topic(context, user.id, user.username)
        if topic_id:
            # Forward the user's message to their dedicated topic
            await context.bot.forward_message(chat_id=ADMIN_GROUP_ID, from_chat_id=user.id, message_id=update.message.message_id, message_thread_id=topic_id)
```

---

### **Step 4: The Webhook Server (`src/webhook_server.py`)** 🔌

A robust payment system requires handling more than just successful purchases. Use a web framework like Flask or FastAPI to create a webhook server that listens for multiple Stripe events.

- **`checkout.session.completed`**: Grants credits/time upon a successful purchase.
    
- **`payment_intent.payment_failed`**: Notifies a user when their payment fails, which is critical for auto-recharge.
    
- **`payment_method.attached`**: Confirms to the user that their payment method has been successfully saved.
    
- **`charge.dispute.created`**: Immediately alerts the admin via a Telegram message when a user initiates a chargeback.
    

#### **Implementation Details**

Python

```
# src/webhook_server.py
from flask import Flask, request, jsonify
import stripe
import os

app = Flask(__name__)
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")

@app.route("/stripe-webhook", methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        return jsonify(status='error', message=str(e)), 400

    # Handle different event types
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = int(session.get('metadata', {}).get('user_id'))
        # Logic to add credits/time to the user in the DB
        
    elif event['type'] == 'payment_intent.payment_failed':
        # Logic to notify the user via Telegram that their payment failed
        
    elif event['type'] == 'payment_method.attached':
        # Logic to notify the user that their card was saved successfully
        
    elif event['type'] == 'charge.dispute.created':
        # Logic to send an urgent alert to the admin's Telegram chat
    
    return jsonify(status='success'), 200

if __name__ == '__main__':
    app.run(port=8000)
```



---

### **Part 4: User and Admin Guides**

#### **4.1 Admin Guide: Managing the Bot**

The admin interface provides complete control over the bot's operations through a powerful, menu-driven command system within Telegram.

##### **Primary Admin Commands**

- **/admin**: The main entry point that opens the full dashboard, organizing all functions by category.
    
- **/conversations**: Directly opens the conversation management view to see all active user threads.
    
- **/dashboard**: Directly accesses the main admin dashboard for a quick overview of bot statistics.
    
- **/users**: Opens the user management panel to search, view, and manage users.
    
- **/products**: Opens the interface for managing credit packages and other sale items.
    
- **/settings**: Directly opens the bot configuration panel.
    

##### **Admin Menu Categories (via `/admin`)**

The main menu is divided into 12 functional categories:

- **💬 Conversations**: Manage all user chats, filter by unread or priority, and view archives.
    
- **📊 Dashboard**: Get a real-time overview of total users, active conversations, and system health.
    
- **📈 Analytics**: Access detailed reports on user engagement, revenue, and system performance.
    
- **👥 User Management**: View all users, manage banned accounts, edit credit balances, and gift credits.
    
- **🛒 Products**: Create, edit, and manage all purchasable items and their pricing.
    
- **💰 Billing**: View payment history, check webhook status, and access the Stripe dashboard.
    
- **📢 Broadcast**: Send messages to all users or target specific segments.
    
- **🎁 Mass Gift**: Send free credits to multiple users at once, useful for promotions or compensation.
    
- **⚙️ Settings**: Dynamically configure message costs, welcome text, and other bot behaviors.
    
- **🔧 System**: Monitor system status and performance, view logs, restart the bot, and create backups.
    
- **📝 Quick Replies**: Manage a library of custom response templates to speed up customer support.
    
- **🔍 Search**: Perform a global search across users, messages, payments, and products.
    

##### **Visual Interface Examples**

- **Conversation View (`/conversations`)**: This interface provides a prioritized list of all ongoing user chats, decorated with visual indicators for status and importance.
    
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
    │                                         │
    │  ┌───────────────┬───────────────────┐   │
    │  │ 📋 View All   │ 📦 Archived      │   │
    │  └───────────────┴───────────────────┘   │
    ```
    
- **Enhanced Message Header**: Every message forwarded from a user to their dedicated admin topic is prepended with a header containing their key details and quick-action buttons.
    
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
    

---

#### **4.2 User Guide: Interacting with the Bot**

Users have access to several commands for a seamless, self-service experience.

- **/start**: Begins the interaction. The user is greeted with an engaging welcome message and a **"▶️ Start"** button that reveals the available products for purchase.
    
- **/balance**: Checks the current credit and/or time remaining. The response includes a visual progress bar for an at-a-glance understanding of their balance.
    
    - **Example**: `Credits: 75/100 [████████░░] 75%`
        
- **/billing**: Accesses the secure Stripe customer portal where users can manage their saved payment methods.
    
- **/autorecharge**: Allows the user to configure the automatic credit top-up feature, ensuring they never run out of credits.
    
- **/purchases**: Lets a user view a list of premium content they have unlocked.
    
- **Quick-Buy Commands** (e.g., `/buy10`, `/buy25`): These commands allow returning users to instantly initiate a purchase for a specific credit package, bypassing the main menu.



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