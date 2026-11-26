# Gothic 1 Remake - Lockpick solver
## About

Gothic 1 Remake introduced a novel lockpicking minigame that some players found too tedious for the rewards inside the chests. To help our fellow Gothic players, we created a simple, accessible solution. This repository contains a production-ready, Dockerized frontend and backend that deploys this tool to the web.

## Architecture

The intended way to deploy this project is to host **React frontend on GitHub Pages**, while **Python FastAPI backend** runs on local Ubuntu server.

GitHub Pages provides the frontend over *HTTPS*, which is why requests to *HTTP* backend would be blocked by modern browsers. To solve this, we employ **Caddy**,  that renews free Let's Encrypt TLS certificates and redirects all HTTP traffic to HTTPS. For simplicity, to automatically prove we own our domain, while avoiding DNS challenge, we expose ports `80` and `443`. Caddy injects standard HTTP security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) on every response. The FastAPI container is accessible only inside Docker's private network, unexposed to the internet.


## Docker start
#### Prerequisites
* [Docker Engine](https://docs.docker.com/engine/install/)

This repository supports two Docker setups:
1. **Backend only with Caddy:** Hosting the API on a server while serving the frontend from a static host (here: GitHub Pages).
2. **Full stack:** Runs both backend and frontend on a single server.

Our repository is pre-configured for the **Backend only with Caddy** setup. Running fullstack option would require to change files accordingly.


### Option 1: Backend with Caddy

1. Point a domain `<your-domain>` to your server's public IP, and forward TCP ports `80` and `443` to your server.
2. Set your domain in `Caddyfile` (pointing `reverse_proxy` to `backend:8000`) and ensure `allow_origins` in `backend/app/main.py` matches your frontend host (e.g. `https://<GitHubName>.github.io`).
3. Build and start the containers from the project root:

```bash
sudo docker compose -f docker-compose-backend.yml up -d --build
```
   
*(Required also after any changes to `requirements.txt`, `Dockerfile`, or `docker-compose-backend.yml`)*

4. The API is now available over HTTPS at `https://<your-domain>/lock_input`, and the interactive documentation is at `https://<your-domain>/docs`.

5. To stop the application, run `docker compose -f docker-compose-backend.yml down` in other terminal, or in the same terminal if the app is in detached mode.

#### Deploying Frontend to GitHub Pages

1. Create/update `frontend/.env.production` with your HTTPS backend domain and set `REACT_APP_API_URL=https://<your-domain>`
2. Ensure `homepage` in `frontend/package.json` points to your GitHub Pages URL (`https://<GitHubName>.github.io/g1remake_lockpicker`)
3. Build and deploy by running:
   ```bash
   npm install
   npm run deploy
   ```
  from the `frontend` directory. This builds the production bundle and pushes it to the `gh-pages` branch.

4. Enable GitHub Pages in your GitHub repository: 
* **Settings → Pages**
* Set **Source** to **Deploy from a branch**
* Select **`gh-pages`** and **`/ (root)`**
* Click **Save**. 
Frontend will be accessible at `https://<GitHubName>.github.io/g1remake_lockpicker`.


### Option 2: Fullstack
1. Set `const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5555"` in `frontend/src/App.jsx`
2. Add `http://localhost:7777` to `allow_origins` in `backend/app/main.py`
3. On the first docker start, or after any changes to `package.json`, `requirements.txt` or `docker-compose-full.yml` files run 
```bash
sudo docker compose -f docker-compose-full.yml up -d --build
``` 
in the project root directory.

4. Backend is now running on: 
* `http://localhost:5555/`,
  
frontend is running on 
* `http://localhost:7777/`.

4. To stop the application, run `docker compose -f docker-compose-full.yml down` in other terminal, or in the same terminal if the app is in detached mode.


## Start without docker
#### Prerequisites
1. Python 3.13.5.
2. Node.js v24.21.0 (https://nodejs.org/en/download/).
3. npm v11.19.0 (installed with node.js).

A modification of the files will also be needed (e.g. modifying `allow_origins` to include  `http://localhost:3000`)

### Local backend start:
1. Navigate to g1remake_lockpicker/backend directory.
2. Install the requirements with `pip install -r requirements.txt`.
3. Start the FastAPI server with `uvicorn app.main:app --reload`.
4. In your browser, search `http://127.0.0.1:8000/`.


### Local frontend start:
Useful commands and description is located in g1remake_lockpicker/frontend/README.md.
The app creation relies on the https://www.digitalocean.com/community/tutorials/build-a-to-do-application-using-django-and-react#step-3-setting-up-the-frontend tutorial.

1. Open first terminal and start your local backend.
2. Open the second terminal while the one with backend is running, and navigate to g1remake_lockpicker/frontend directory.
3. Run `npm install` to install the create-react dependencies from package-lock.json.
4. Run `npm start`. You can now view the app in the browser: `http://localhost:3000`.
5. You can input the lock configuration into displayed fields and send the data with a button below. The button should return the lock solution.


#### Testing with automatic API docs
If you don't want to start frontend, you can use automatically generated FastAPI documentation for testing.

1. In your browser, search `http://127.0.0.1:8000/docs`. This command will open a page with automatic API documentation.
2. To send a request for solving a lock puzzle, click on the POST /lock_input and select "Try it out".
3. Input the lock parameters into the 'Request body' window. You may copy the test body: 
```
{
  "lock_state": {
    "start_lock_state": [
      1,2,6
    ]
  },
  "lock_config": {
    "start_lock_config": {
      "0":[1,0,0],"1":[0,1,1],"2":[1,0,1]
    }
  }
}
```
4. The request should result in a response:
```
{
  "lock state": [
    1,
    2,
    6
  ],
  "lock config": {
    "0": [
      1,
      0,
      0
    ],
    "1": [
      0,
      1,
      1
    ],
    "2": [
      1,
      0,
      1
    ]
  },
  "solution": [
    [
      [
        1,
        2,
        6
      ],
      [
        2,
        2,
        6
      ],
      [
        3,
        2,
        6
      ],
      [
        4,
        2,
        6
      ],
      [
        5,
        2,
        6
      ],
      [
        6,
        2,
        6
      ],
      [
        5,
        2,
        5
      ],
      [
        6,
        2,
        5
      ],
      [
        6,
        3,
        6
      ],
      [
        5,
        3,
        5
      ],
      [
        4,
        3,
        4
      ],
      [
        3,
        3,
        3
      ]
    ],
    [
      {
        "slider_idx": 0,
        "direction": "R"
      },
      {
        "slider_idx": 0,
        "direction": "R"
      },
      {
        "slider_idx": 0,
        "direction": "R"
      },
      {
        "slider_idx": 0,
        "direction": "R"
      },
      {
        "slider_idx": 0,
        "direction": "R"
      },
      {
        "slider_idx": 2,
        "direction": "L"
      },
      {
        "slider_idx": 0,
        "direction": "R"
      },
      {
        "slider_idx": 1,
        "direction": "R"
      },
      {
        "slider_idx": 2,
        "direction": "L"
      },
      {
        "slider_idx": 2,
        "direction": "L"
      },
      {
        "slider_idx": 2,
        "direction": "L"
      }
    ]
  ]
}
```







