# Nestjs Google Drive Upload

a nestjs google drive upload app

## Setup Google Drive API

- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project
- Enable Google Drive API
- Create a service account
- Download the service account key
- Fill the `.env` file with the service account data
- Create a `uploads` folder in your Google Drive
- Share the `uploads` folder with the service account email
- Share the `uploads` folder with anyone who has the link to make the files public

## Running the app

- Install the dependencies

```bash
$ npm i
```

- Create a `.env` file from the `.env.example` file
- Fill the `.env` file with the required data
- Run the app services

```bash
$ docker compose up -d
```

- Run the app

```bash
$ npm run start:dev
```

- Go to [http://localhost:3000](http://localhost:3000) to see the swagger with examples

## Migrations

```bash
# generate a migration
$ npm run migration:generate --name=test

# run a migration
$ npm run migration:run

# revert a migration
$ npm run migration:revert
```
