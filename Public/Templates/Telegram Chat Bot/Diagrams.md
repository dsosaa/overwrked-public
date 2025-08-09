---
created: 2025-07-15 06:21:08
---

# Diagrams

Of course. Here are four diagrams that visually explain the bot's architecture, logic flows, and data structure.

---

### ## 1. System Architecture Diagram

This diagram shows the high-level components of your service and how they interact. Your bot application is the central hub that connects Telegram, the database, and the payment processor.

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

- The **Fan** interacts with the **Telegram API** through their app.
    
- The **Telegram API** sends updates (messages, button clicks) to **Your Bot Application**.
    
- Your bot reads from and writes to the **PostgreSQL Database** to manage user state, credits, and settings.
    
- For payments, your bot communicates with the **Stripe API**.
    

---

### ## 2. Admin Settings (`/settings`) Flow

This state diagram visualizes the `ConversationHandler` for your admin panel. It shows how the bot moves between different states as you edit settings.

Code snippet

```
stateDiagram-v2
    direction LR
    state "SETTINGS_MENU" as Menu
    state "Awaiting Welcome Msg" as Welcome
    state "Awaiting Cost Value" as Cost
    
    [*] --> Menu: /settings
    Menu --> Welcome: Clicks "Edit Welcome"
    Welcome --> [*]: Sends new text
    
    Menu --> Cost: Clicks "Edit Costs"
    Cost --> [*]: Sends new number
    
    Welcome --> [*]: /cancel
    Cost --> [*]: /cancel
    Menu --> [*]: /cancel
```

- The conversation starts with the `/settings` command, entering the **SETTINGS_MENU** state.
    
- Depending on the button you press, it transitions to a state where it's waiting for your input (e.g., **Awaiting Welcome Msg**).
    
- Once you provide the information (or cancel), the conversation ends and returns to the start.
    

---

### ## 3. User Message Handling Sequence

This diagram details the step-by-step logic that executes every time a fan sends a message to the bot. This is the core credit-checking and message-forwarding process.

Code snippet

```
sequenceDiagram
    participant Fan as 👤 Fan
    participant Bot as 🤖 Bot App
    participant DB as 🗄️ Database

    Fan->>+Bot: Sends a Photo Message
    Bot->>+DB: Get setting('cost_photo_message')
    DB-->>-Bot: Returns cost (e.g., 3)
    Bot->>+DB: Get user_credits(fan_id)
    DB-->>-Bot: Returns credits (e.g., 10)
    
    alt User has enough credits (10 >= 3)
        Bot->>+DB: Decrement credits by 3
        DB-->>-Bot: Confirms update
        Bot-->>Bot: Forward message to Admin
        Bot-->>-Fan: "Message sent! You have 7 credits left."
    else User has insufficient credits
        Bot-->>-Fan: "Not enough credits for a photo."
    end
```

This shows the precise order of operations: fetch cost, fetch user balance, and then, based on the result, either process the message or inform the user they have insufficient funds.

---

### ## 4. Database Entity-Relationship Diagram (ERD)

This diagram shows the structure of your database tables and the key columns within each.

Code snippet

```
erDiagram
    users {
        bigint telegram_id PK
        varchar username
        int message_credits
        int time_credits_seconds
    }
    
    products {
        int id PK
        varchar label
        varchar stripe_price_id
        varchar item_type
        int amount
        boolean is_active
    }
    
    bot_settings {
        varchar setting_key PK
        text setting_value
    }
```

This clearly defines the three core tables that power your bot: `users` for tracking fan data, `products` for dynamically creating purchase options, and `bot_settings` for making your bot's behavior configurable without changing code.