# Prolog Tic-Tac-Toe with Minimax AI

A modern, web-based Tic-Tac-Toe game powered by a **Prolog** backend. It features a stunning UI, animations, and an unbeatable AI opponent using the **Minimax algorithm**.

## 🚀 Features

-   **Unbeatable AI**: The robot uses Minimax to calculate the perfect move every time.
-   **2-Player Mode**: Play locally against a friend.
-   **Premium UI**: Glassmorphism effects, smooth animations, and confetti celebrations.
-   **Pure Prolog Backend**: All game logic and AI is written in Prolog.

## 🛠️ Prerequisites

-   **SWI-Prolog**: You need to have SWI-Prolog installed.
    -   [Download SWI-Prolog](https://www.swi-prolog.org/Download.html)

## 🎮 How to Run

1.  **Clone/Download** this repository.
2.  Open your terminal or command prompt in the project folder.
3.  Run the following command to start the server:

    ```bash
    swipl -s server.pl -g "server(8080)"
    ```

    *(Keep this terminal window open while playing)*

4.  Open your web browser and go to:

    [http://localhost:8080/index.html](http://localhost:8080/index.html)

## 🧠 How it Works

-   The **Frontend** (HTML/JS) handles the UI and sends the board state to the server.
-   The **Backend** (Prolog) receives the board, calculates the optimal move using Minimax, and returns it.
-   The server also hosts the static files, eliminating any CORS issues.

Enjoy playing!
