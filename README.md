# Yazeka GenSerp

A React application with OpenAI integration for chat functionality.

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Environment Setup

1. Create a `.env` file in the root directory
2. Add your OpenAI API key: `REACT_APP_OPENAI_API_KEY=your_api_key_here`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

Add these to your GitHub repository settings (Settings → Secrets and variables → Actions):
```
  YC_SERVICE_ACCOUNT_KEY      # Service account JSON key
  YC_REGISTRY_ID              # Container registry ID
  YC_CLOUD_ID                 # Your cloud ID
  YC_FOLDER_ID                # Your folder ID
  YC_CONTAINER_NAME           # Serverless container name
  YC_SERVICE_ACCOUNT_ID       # Service account ID
  REACT_APP_OPENAI_API_KEY    # OpenAI API key
  YANDEX_SEARCH_API_KEY       # Yandex search API key
```