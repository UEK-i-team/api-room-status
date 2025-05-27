# Room Status Display

This is a simple Node.js Express application that displays the status of a "room" (Open/Closed) on a web page and provides an API endpoint to change this status.

## Features

-   Displays room status ("OPEN" or "CLOSED") on a full-page colored background (green for open, red for closed).
-   API endpoint (`/api/changeStatus`) to update the room status.

## Setup

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Create a `.env` file:**
    In the root of the project, create a file named `.env` and add the following environment variables:
    ```env
    PORT=3000
    ACCESS_KEY=your_secret_api_key_here
    ```
    -   `PORT` (Optional): The port on which the server will run. Defaults to 3000 if not specified.
    -   `ACCESS_KEY`: A secret key that must be provided to the `/api/changeStatus` endpoint to authorize status changes. Choose a strong, unique key.

3.  **Install dependencies:**
    Make sure you have Node.js and yarn (or npm) installed.
    ```bash
    yarn install
    # OR if using npm
    # npm install
    ```

## Running the Application

-   **Start the server:**
    ```bash
    node index.js
    # OR if you have nodemon or a similar tool
    # nodemon index.js
    ```
    The server will start, typically on `http://localhost:3000` (or the port specified in your `.env` file).

## API Usage

### Change Room Status

-   **Endpoint:** `POST /api/changeStatus`
-   **Body (JSON):**
    ```json
    {
      "newStatus": "open", // string: "open" or "close"
      "apiKey": "your_secret_api_key_here"
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "message": "Room status successfully changed to "open"."
    }
    ```
    or
    ```json
    {
      "message": "Room status successfully changed to "closed"."
    }
    ```
-   **Error Responses:**
    -   `400 Bad Request`: If `newStatus` is missing or not "open" or "close".
        ```json
        {
          "error": "Invalid status. Allowed values are \"open\" or \"close\"."
        }
        ```
    -   `403 Forbidden`: If `apiKey` is missing or incorrect.
        ```json
        {
          "error": "Unauthorized access - invalid API key."
        }
        ```
