# g1remake_lockpicker

## Prerequisites

1. Docker Desktop. (https://docs.docker.com/desktop/setup/install/windows-install/)  (if installed by wsl, make sure wsl is installed)

# How to work with g1remake_lockpicker?

After cloning repo's main branch, you can start the app:


## Docker start:

1. On the first docker start, or after any changes to package.json, requirements.txt or compose.yml files: Run ```docker-compose up --build``` in the project root directory.
   
2. Normal backend and frontend start: Run ```docker-compose up``` in the project root directory. You can run ```docker-compose up -d``` for the app to run in detached mode.
3. Backend is now running on: http://localhost:8000/, frontend is running on http://localhost:3000/.
4. To stop the application, run ```docker-compose down``` in other terminal, or in the same terminal if the app is in detached mode.


## Start without docker:
### Prerequisites:
1. This project is developed on Python 3.13.5.
2. Node.js v24.21.0 (https://nodejs.org/en/download/).
3. npm v11.19.0 (installed with node.js).
4. axios v1.20.0 (installed with ```npm install axios```)

### Local backend start:
1. Navigate to g1remake_lockpicker/backend directory.
2. Install the requirements with ```pip install requirements.txt``` or, if using conda: ```conda install --file requirements.txt```
3. Navigate to g1remake_lockpicker/backend/app directory.
4. To start the application, run ```uvicorn main:app --reload```.
5. In your browser, search ```http://127.0.0.1:8000/```.


### Local frontend start:
Useful commands and description is located in g1remake_lockpicker/frontend/README.md.
The app creation relies on the https://www.digitalocean.com/community/tutorials/build-a-to-do-application-using-django-and-react#step-3-setting-up-the-frontend tutorial.

1. Open first terminal and start your local backend.
2. Open the second terminal while the one with backend is running, and navigate to g1remake_lockpicker/frontend directory.
3. Run ```npm install``` to install the create-react dependencies from package-lock.json.
4. Run ```npm start```. You can now view the app in the browser: http://localhost:3000.
5. You can input the lock configuration into displayed fields and send the data with a button below. The button should return the lock solution.


#### Testing with automatic API docs
If you don't want to start frontend, you can use automatically generated FastAPI documentation for testing.

1. In your browser, search ```http://127.0.0.1:8000/docs```. This command will open a page with automatic API documentation.
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
        4,
        2,
        4
      ],
      [
        3,
        2,
        3
      ],
      [
        2,
        2,
        2
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







