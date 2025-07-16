export const generateUserVerificationTemplate = (
  email: string,
  error: string
) => {
  return /*HTML*/ `<!DOCTYPE html>
<html>
  <head>
    <title>Email Verification</title>
    <style type="text/css" media="all">
      body {
        padding: 25px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .title {
        color: #5c6ac4;
      }
      .success {
        color: green;
      }
      .failure {
        color: red;
      }
    </style>
  </head>
  <body>
    <h1 class="${error ? "failure" : "success"}">${
    error ? "An Error Ocurred" : "Email Verified"
  }</h1>
    <p>
      ${
        error
          ? error
          : `Your email <strong>${email}</strong> has been
      successfully verified, now you can login with your account`
      }
    </p>
  </body>
</html>
`;
};

export const generateResetPasswordTemplate = (token: string) => {
  return /*HTML*/ `<!DOCTYPE html>
<html>
  <head>
    <title>Email Verification</title>
    <style type="text/css" media="all">
      body {
        padding: 25px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .form-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
    </style>
  </head>
  <body>
    <h1>Reset Your Password</h1>
    <form action="/auth/reset-password?xt=${token}" method="post">
      <div class="form-item">
        <label for="new-password">Enter new password: </label>
        <input id="new-password" type="password" name="new_password" value="" />
      </div>
      <div class="form-item">
        <label for="confirm-password">Confirm new password: </label>
        <input
          id="confirm-password"
          type="password"
          name="confirm_password"
          value=""
        />
      </div>

      <input type="submit" value="Submit" />
    </form>
  </body>
</html>
`;
};

export const generateSuccessfulResetPasswordTemplate = () => {
  return /*HTML*/ `<!DOCTYPE html>
<html>
  <head>
    <title>Password Reset</title>
    <style type="text/css" media="all">
      body {
        padding: 25px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    </style>
  </head>
  <body>
    <h1>Password Successfully Reset!</h1>
    <p>
     Your password has been successfully updated
    </p>
  </body>
</html>
`;
};
