# Movie Manager API

The Movie Manager API is a GraphQL API that allows you to manage movies and users. It provides functionality to create, update, and delete movies, as well as user authentication and authorization.

## Tech Stack

The Movie Manager API is built using the following technologies:

- Node.js
- TypeScript
- Apollo Server
- Prisma
- PostgreSQL
- bcrypt
- jsonwebtoken
- dotenv

## Dependencies

The Movie Manager API relies on the following dependencies:

- apollo-server-express: ^2.25.2
- bcrypt: ^5.0.1
- dotenv: ^10.0.0
- graphql: ^15.7.2
- jsonwebtoken: ^8.5.1
- prisma: ^3.2.1
- @prisma/client: ^3.2.1

## Getting Started

To use the Movie Manager API, follow these steps:

1. Clone the repository:

```bash
git clone git@github.com:NayaOnwubiko/movie-mgr.git
```

2. Install the dependencies:

```bash
cd movie-mgr
npm install
```

3. Set up the database connection:

DATABASE_URL=<database-url>
JWT_SECRET=<jwt-secret>

4. Run the API server:

```bash
npm start
```

The API server will start at http://localhost:4000.

## Authentication

To access certain API endpoints, you need to include an authentication token in the request headers. Follow these steps to obtain an authentication token:

1. Register a new user:

Send a signup mutation request with the user's username, email, and password.

2. Obtain an authentication token:

Use the login mutation request with the user's email and password to obtain an authentication token.

3. Include the authentication token:

Include the authentication token in the request headers using the Authorization header with the value Bearer <token>. Replace <token> with the actual authentication token.

## Endpoints

# Users

### signup

Creates a new user.

```bash
mutation Signup {
signup(data: {
username: "example_user",
email: "user@example.com",
password: "password123"
}) {
token
user {
id
username
email
}
}
}
```

### login

Logs in a user and returns an authentication token.

```bash
mutation Login {
login(data: {
email: "user@example.com",
password: "password123"
}) {
token
user {
id
username
email
}
}
}
```

### updateUser

Updates a user's information.

```bash
mutation UpdateUser {
updateUser(id: 1, data: {
username: "new_username"
email: "new_email@example.com"
password: "new_password"
}) {
id
username
email
}
}
```

### changePassword

Changes a user's password.

```bash
mutation ChangePassword {
changePassword(id: 1, data: {
currentPassword: "old_password"
newPassword: "new_password"
}) {
id
username
email
}
}
```

### deleteUser

Deletes a user.

```bash
mutation DeleteUser {
deleteUser(id: 1) {
id
username
email
}
}
```

# Movies

### movies

Retrieves a list of movies.

```bash
query GetMovies {
movies(filters: { search: "example" }, options: { sortBy: "releaseDate", sortOrder: "asc" }) {
id
movieName
description
director
releaseDate
user {
id
username
email
}
}
}
```

### movie

Retrieves a specific movie by ID.

```bash
query GetMovie {
movie(id: 1) {
id
movieName
description
director
releaseDate
user {
id
username
email
}
}
}
```

### createMovie

Creates a new movie.

```bash
mutation CreateMovie {
createMovie(data: {
movieName: "Example Movie"
description: "This is an example movie"
director: "John Doe"
releaseDate: "2023-07-12"
}) {
id
movieName
description
director
releaseDate
user {
id
username
email
}
}
}
```

### updateMovie

Updates a movie's information.

```bash
mutation UpdateMovie {
updateMovie(data: {
id: 1
movieName: "Updated Movie Name"
description: "Updated movie description"
director: "Jane Doe"
releaseDate: "2023-08-15"
}) {
id
movieName
description
director
releaseDate
user {
id
username
email
}
}
}
```

### deleteMovie

Deletes a movie.

```bash
mutation DeleteMovie {
deleteMovie(id: 1) {
id
movieName
description
director
releaseDate
user {
id
username
email
}
}
}
```
