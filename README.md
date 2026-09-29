# g1remake_lockpicker


## How to work with g1remake_lockpicker?

After cloning repo's main branch, you can start the app:

### Local start:

1. Install the requirements with ```pip install requirements.txt```.
2. Navigate to g1remake_lockpicker\backend\app directory.
3. To start the application, run ```uvicorn main:app --reload```.
4. In your browser, search ```http://127.0.0.1:8000/docs```. This command will open a page with automatic API documentation.
5. To send a request for solving a lock puzzle, click on the POST /lock_input and select "Try it out".
6. Input the lock parameters into the 'Request body' window. You may copy the test body: 
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
7. The request should result in a response:
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
