# bewater-website

This repo is managed via [Yarn](https://yarnpkg.com).

## Requirements
Node >= 16.8
yarn >= 1.22.15

## Recipes

* Install dependencies
  * `yarn install`

* Start dev website with qa backend server
  * set `ENVIRONMENT=qa` in `.env` file
  * `yarn dev`

* Build website
  * `yarn build`
* Export website
  * `yarn export`
* Lint everything
  * `yarn lint`


### .env file
```


# configs for change dev conditions

# base path from next.js\
# ref: https://nextjs.org/docs/api-reference/next.config.js/basepath
NEXT_PUBLIC_BASE_PATH=
# mapping different api url for different environment
# local | qa | prod
ENVIRONMENT=local
```



## Github Workflows
For CI (triggered at PR), we should
* run eslint
* run all the tests (Not done yet)
* run build

For CD (triggered by create new release with tag), we should
* run eslint
* run all the tests
* deploy the project
  * build & publish directly to QA Server
