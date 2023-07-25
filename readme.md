
## User Routes

### POST /user

Creates a new user with the given information. Accepts the following parameters in the request body:

- `name`: (string) The name of the user. Required.
- `description`: (string, optional) Description of the user.
- `mbti`: (string, optional) MBTI personality type of the user.
- `enneagram`: (string, optional) Enneagram type of the user.
- `variant`: (string, optional) Variant type of the user.
- `tritype`: (string, optional) Tritype of the user.
- `socionics`: (string, optional) Socionics type of the user.
- `sloan`: (string, optional) Sloan type of the user.
- `psyche`: (string, optional) Psyche type of the user.
- `image`: (string, optional) URL of the user's image. Default is a default image URL.

Returns:
- 200 OK with response object `{ response: true }` if the user is created successfully.
- 400 Bad Request with response object `{ response: false, message: "Name is required" }` if `name` is missing.
- 500 Internal Server Error with response object `{ response: false }` for any other error.

### POST /comment

Creates a new comment with the given information. Accepts the following parameters in the request body:

- `title`: (string) The title of the comment. Required.
- `description`: (string) Description of the comment. Required.
- `mbti`: (string, optional) MBTI personality type of the comment.
- `enneagram`: (string, optional) Enneagram type of the comment.
- `variant`: (string, optional) Variant type of the comment.
- `commentedBy`: (string) ID of the user who posted the comment. Required.
- `commentedOn`: (string) ID of the post, user, or reply that the comment is posted on. Required.
- `commentType`: (string) Type of the comment (e.g., "POST", "USER", "REPLY"). Required.

Returns:
- 200 OK with response object `{ response: true }` if the comment is created successfully.
- 400 Bad Request with response object `{ response: false, message: "Bad Request" }` if any required field is missing.
- 400 Bad Request with response object `{ response: false, message: "Invalid User Id" }` if `commentedBy` is not a valid user ID.
- 400 Bad Request with response object `{ response: false, message: "commentedOn Id not found" }` if `commentedOn` is not a valid post, user, or reply ID.
- 500 Internal Server Error with response object `{ response: false }` for any other error.

### POST /comment/like

Likes a comment with the given `commentId` by the user with `userId`. Accepts the following parameters in the request body:

- `commentId`: (string) ID of the comment to be liked. Required.
- `userId`: (string) ID of the user who likes the comment. Required.

Returns:
- 200 OK with response object `{ response: true }` if the comment is liked successfully.
- 400 Bad Request with response object `{ response: false, message: "Invalid Data" }` if `commentId` or `userId` is missing.
- 400 Bad Request with response object `{ response: false, message: "commentId not found" }` if `commentId` is not a valid comment ID.
- 400 Bad Request with response object `{ response: false, message: "userId not found" }` if `userId` is not a valid user ID.
- 500 Internal Server Error with response object `{ response: false }` for any other error.

### GET /users

Retrieves a list of all users.

Returns:
- 200 OK with response object `{ response: true, data: [users] }` if users are retrieved successfully.
- 500 Internal Server Error with response object `{ response: false, message: "Error occurred while fetching users" }` for any error.

### GET /user/:userId

Retrieves information about a specific user with the given `userId`.

Parameters:
- `userId`: (string) ID of the user to retrieve information for.

Returns:
- 200 OK with response object `{ response: true, data: user }` if the user is found and retrieved successfully.
- 400 Bad Request with response object `{ response: false, message: "Bad Request" }` if `userId` is missing.
- 404 Not Found with response object `{ response: false, message: "userId not found" }` if `userId` is not a valid user ID.
- 500 Internal Server Error with response object `{ response: false, message: "Error occurred while fetching user" }` for any other error.

### GET /comment/:userId

Retrieves comments for a specific user with the given `userId`.

Parameters:
- `userId`: (string) ID of the user to retrieve comments for.

Query Parameters:
- `personalityFilter`: (string, optional) Filters comments based on personality type (e.g., "mbti", "enneagram", "variant"). If not provided, all comments for the user are retrieved.
- `sortOption`: (string, optional) Sorts comments based on the (e.g., "best","recent")