# Nestjs Google Drive Upload

a nestjs google drive upload app

[![build](https://github.com/allohamora/nestjs-google-drive-upload/actions/workflows/build.yml/badge.svg?event=push)](https://github.com/allohamora/nestjs-google-drive-upload/actions/workflows/build.yml/badge.svg?event=push)
[![test](https://github.com/allohamora/nestjs-google-drive-upload/actions/workflows/test.yml/badge.svg?event=push)](https://github.com/allohamora/nestjs-google-drive-upload/actions/workflows/test.yml/badge.svg?event=push)

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
$ npm run migration:generate --name=example

# run a migration
$ npm run migration:run

# revert a migration
$ npm run migration:revert
```

## Tests (e2e)

```bash
$ npm run test
```

## Q/A

### What is the main goal of this project?

The main goal of this project is to provide a client-driven solution for uploading files to Google Drive. Here, the client initiates the upload and is responsible for handling retries if an upload fails. When the upload is successful, the API immediately returns ready-to-use file links, which the client can use for further actions, such as rendering results or sharing.

If you are looking for a background or queue-based solution—where the client submits an upload request and does not receive immediate links or status, but instead checks back later for results then you can use a queue system like [bull](https://github.com/OptimalBits/bull) or similar. This project is not intended for such asynchronous, server-managed workflows.

### What happens if any file of the upload fails?

If any file of the upload fails, the server will automatically clean up by deleting any files that were successfully uploaded during that request. An error is then returned to the client, allowing the client to retry the entire upload operation if desired.

### Why do I need to share the folder with the service account email?

Service accounts have their own isolated Google Drive storage space. Sharing the folder with the service account email allows you to see the uploaded files in your Google Drive UI. Without sharing, files will still be uploaded successfully but will won't be visible in your Google Drive UI.

Note: If you delete a file from the shared folder in your Google Drive UI, it won't be permanently deleted from the service account's storage—it will only be moved to the trash. To properly delete files, use the API endpoints.

### Why do I need /v1/files/:id/download endpoint?

Google Drive files cannot be embedded into <img> tag directly, they disabled the ability to do it, so we need a proxy endpoint to serve the files, but it's just a browser limit, so you can just do `fetch` on google drive url and receive the file stream.
