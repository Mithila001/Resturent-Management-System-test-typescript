# Restaurant Management System - UML Diagrams

This document contains the UML diagrams representing the architecture and workflows of the Restaurant Management System.

## 1. Use Case Diagram
Visualizes the actors and their interactions with the system.

```mermaid
usecaseDiagram
    actor "Customer" as C
    actor "Waiter" as W
    actor "Chef" as K
    actor "Admin" as A

    package "Restaurant Management System" {
        usecase "View Menu" as UC1
        usecase "Place Order" as UC2
        usecase "Make Reservation" as UC3
        usecase "Manage Orders" as UC4
        usecase "Update Order Status" as UC5
        usecase "Manage Menu" as UC6
        usecase "Manage Staff" as UC7
        usecase "View Reports" as UC8
    }

    C --> UC1
    C --> UC3
    
    W --> UC1
    W --> UC2
    W --> UC4
    
    K --> UC5
    
    A --> UC6
    A --> UC7
    A --> UC8
    
    UC2 .> UC1 : include
```

## 2. Class Diagram
Represents the static structure of the database entities and their relationships.

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String username
        +String password
        +String role
        +String email
        +login()
        +logout()
    }

    class Product {
        +ObjectId _id
        +String name
        +String category
        +Float price
        +Boolean isAvailable
        +String image
    }

    class Order {
        +ObjectId _id
        +ObjectId tableId
        +ObjectId waiterId
        +List~OrderItem~ items
        +String status
        +Float totalAmount
        +Date createdAt
        +updateStatus()
    }

    class OrderItem {
        +ObjectId productId
        +Integer quantity
        +String notes
    }

    class Reservation {
        +ObjectId _id
        +String customerName
        +String contactNumber
        +Date dateTime
        +Integer partySize
        +String status
    }

    User "1" -- "*" Order : manages
    Order "1" -- "*" OrderItem : contains
    Product "1" -- "*" OrderItem : part of
    User "1" -- "*" Reservation : manages
```

## 3. Sequence Diagram (Order Flow)
Shows the sequence of interactions when a waiter places an order.

```mermaid
sequenceDiagram
    participant W as Waiter
    participant FE as Client (Frontend)
    participant API as Server (Backend)
    participant DB as MongoDB
    participant K as Kitchen Display

    W->>FE: Select Table & Items
    W->>FE: Click "Place Order"
    FE->>API: POST /api/orders
    activate API
    API->>DB: Save Order
    activate DB
    DB-->>API: Order Created
    deactivate DB
    API-->>FE: Order Confirmation
    API->>K: Emit "New Order" Event (WebSocket)
    deactivate API
    K-->>K: Update Kitchen View
```

## 4. Activity Diagram (Order Lifecycle)
Illustrates the flow of an order from creation to payment.

```mermaid
stateDiagram-v2
    [*] --> OrderPlaced
    OrderPlaced --> Preparation : Chef accepts
    Preparation --> Ready : Chef completes
    Ready --> Served : Waiter delivers
    Served --> Paid : Customer pays
    Paid --> [*]
```

## 5. ER Diagram (Conceptual)
Shows the entity relationships in the database.

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "places/manages"
    USERS {
        ObjectId _id
        string username
        string role
    }
    
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS {
        ObjectId _id
        string status
        float total
    }
    
    PRODUCTS ||--o{ ORDER_ITEMS : "is in"
    PRODUCTS {
        ObjectId _id
        string name
        float price
    }
    
    RESERVATIONS {
        ObjectId _id
        string customer_name
        datetime booking_time
    }
```
