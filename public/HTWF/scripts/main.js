// Check if a user is logged in
const user = window.localStorage.getItem("user");
let userDetails = {};
const parseJwt = token => {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function(c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
};

if (!user) {
  $(".logged-in").hide();
  $(".logged-out").show();
} else {
  userDetails = parseJwt(user);
  if (Date.now() >= userDetails.exp * 1000) {
    window.localStorage.removeItem("user");
    window.location = "/login";
  } else {
    $("#userDetails").text(`${userDetails.firstName} ${userDetails.lastName}`);
    $(".logged-in").show();
    $(".logged-out").hide();
  }
}
$(".alert").hide();

const apiUrl = "https://bbmpcs.herokuapp.com/api/";

const urlParams = new URLSearchParams(window.location.search);

$(() => {
  // Login Section
  $("#login-form").on("submit", e => {
    e.preventDefault();
    $("#login-button").attr("disabled", true);
    const email = $("#email").val();
    const password = $("#password").val();
    const data = { email, password };
    $.ajax({
      url: apiUrl + "auth/login",
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      error: res => {
        console.log(res);

        $("#login-alert").addClass("alert-danger");
        $("#login-alert").removeClass("alert-success");
        if (res.statusText === "error") {
          $("#login-alert").text(
            "Oops! Something went wrong, It's not you, it's us. Please try again later."
          );
        } else {
          $("#login-alert").text(res.responseJSON.message);
          if (
            res.responseJSON.message ===
            "Account is not confirmed. Please confirm your account."
          ) {
            $("#main-form").hide();
            $(".alert").addClass("alert-success");
            $(".alert").removeClass("alert-danger");
            $(".alert").text("Enter the OTP sent to your email");
            $("#verify-email").val(email);
            $("#otp").show();
          }
        }
        $("#login-alert").show();
        $("#login-button").attr("disabled", false);
      }
    }).done(res => {
      window.localStorage.setItem("user", res.data.token);
      $("#login-alert").addClass("alert-success");
      $("#login-alert").removeClass("alert-danger");
      $("#login-alert").text("Login Successful");
      $("#login-alert").show();
      window.location = "/dashboard";
    });
  });

  // Password Rest Section
  $("#password-reset-form").on("submit", e => {
    e.preventDefault();
    $("#password-reset-button").attr("disabled", true);
    const email = $("#email").val();
    const data = { email };
    $.ajax({
      url: apiUrl + "auth/init-reset",
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      error: res => {
        $("#password-reset-alert").addClass("alert-danger");
        $("#password-reset-alert").removeClass("alert-success");
        if (res.statusText === "error") {
          $("#password-reset-alert").text(
            "Oops! Something went wrong, It's not you, it's us. Please try again later."
          );
        } else {
          $("#password-reset-alert").text("Email not found");
        }
        $("#password-reset-alert").show();
        $("#password-reset-button").attr("disabled", false);
      }
    }).done(res => {
      $("#password-reset-alert").addClass("alert-success");
      $("#password-reset-alert").removeClass("alert-danger");
      $("#password-reset-alert").text(
        "An email with a link to reset your password has been sent"
      );
      $("#password-reset-alert").show();
      window.location = "/login";
    });
  });

  $("#new-password-form").on("submit", e => {
    e.preventDefault();
    $("#password-reset-button").attr("disabled", true);
    const password = $("#new-password").val();
    const verifyPassword = $("#verify-password").val();
    const email = urlParams.get("email");
    if (password !== verifyPassword) {
      $("#password-reset-alert").addClass("alert-danger");
      $("#password-reset-alert").removeClass("alert-success");
      $("#password-reset-alert").text("Password Mismatch");
      $("#password-reset-alert").show();
      $("#password-reset-button").attr("disabled", false);
    } else {
      $.ajax({
        url: apiUrl + "auth/reset",
        type: "POST",
        data: JSON.stringify({ email, password }),
        contentType: "application/json",
        error: res => {
          console.log(res);
          $("#password-reset-alert").addClass("alert-danger");
          $("#password-reset-alert").removeClass("alert-success");
          $("#password-reset-alert").text(res.responseJSON.message);
          $("#password-reset-alert").show();
          $("#password-reset-button").attr("disabled", false);
        }
      }).done(res => {
        console.log(res);
        $("#password-reset-alert").addClass("alert-success");
        $("#password-reset-alert").removeClass("alert-danger");
        $("#password-reset-alert").text(res.message);
        $("#password-reset-alert").show();
        window.location = "/login";
      });
    }
  });

  // Log out section
  $("#logout").on("click", e => {
    e.preventDefault();
    window.localStorage.removeItem("user");
    window.location = "/login";
  });

  // Register section
  $("#register-form").on("submit", e => {
    e.preventDefault();
    $("#register-button").attr("disabled", true);
    const firstName = $("#firstName").val();
    const lastName = $("#lastName").val();
    const email = $("#email").val();
    const password = $("#password").val();
    const data = { firstName, lastName, email, password };
    $.ajax({
      url: apiUrl + "auth/register",
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      timeout: 15000,
      error: res => {
        console.log(res);
        $("#register-alert").addClass("alert-danger");
        $("#register-alert").removeClass("alert-success");
        if (res.statusText === "error") {
          $("#register-alert").text(
            "Oops! Something went wrong, It's not you, it's us. Please try again later."
          );
        } else {
          $("#register-alert").text(res.responseJSON.data[0].msg);
        }
        $("#register-alert").show();
        $("#register-button").attr("disabled", false);
      }
    }).done(res => {
      console.log(res.responseJSON);
      $("#main-form").hide();
      $("#register-alert").addClass("alert-success");
      $("#register-alert").removeClass("alert-danger");
      $("#register-alert").text(
        "Registeration Successful, please verify your email by entering the OTP sent"
      );
      $("#verify-email").val(email);
      $("#otp").show();
      $("#otp-form").show();
      $("#register-alert").show();
    });
  });

  // OTP Section
  $("#otp-form").on("submit", e => {
    e.preventDefault();
    $("#otp-button").attr("disabled", true);
    const email = $("#verify-email").val();
    const otp = $("#otp-code").val();
    const data = { email, otp };
    $.ajax({
      url: apiUrl + "auth/verify-otp",
      type: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      timeout: 15000,
      error: res => {
        $(".alert").addClass("alert-danger");
        $(".alert").removeClass("alert-success");
        if (res.statusText === "error") {
          $(".alert").text(
            "Oops! Something went wrong, It's not you, it's us. Please try again later."
          );
        } else {
          $(".-alert").text(res.responseJSON.data[0].msg);
        }
        $(".alert").show();
        $("#otp-button").attr("disabled", false);
      }
    }).done(res => {
      console.log(res.responseJSON);
      $("#reg").hide();
      $("#otp").hide();
      $(".alert").addClass("alert-success");
      $(".alert").removeClass("alert-danger");
      $(".alert").text("Verification Successful, please login");
      $(".alert").show();
      window.location = "/login";
    });
  });

  // List Accounts
  if (user) {
    $.ajax({
      url: apiUrl + "account/u/" + userDetails._id,
      method: "GET",
      headers: {
        Authorization: `Bearer ${user}`
      },
      contentType: "application/json",
      timeout: 15000,
      error: res => {
        if (res.statusText === "error") {
        } else {
          console.log(res);
        }
      }
    }).done(res => {
      const { data } = res;
      const accounts = data.map(
        c =>
          `
        <div class="col-md-4">
          <div class="advs-box boxed-inverse shadow-1">
            <h3>${c.accountType}<br><small>${c.accountNumber}</small></h3>
            <a href="/dashboard/plan/?accountNumber=${c.accountNumber}" class="btn btn-primary">View More</a>
          </div>
        </div>
        `
      );
      $("#products").html(accounts);
    });
  }

  // Account Section
  const accountNumber = urlParams.get("accountNumber");
  if (accountNumber) {
    $.ajax({
      url: apiUrl + "account/n/" + accountNumber,
      headers: {
        Authorization: `Bearer ${user}`
      },
      method: "GET",
      contentType: "application/json",
      timeout: 15000,
      error: res => {
        if (res.statusText === "error") {
        } else {
          console.log(res);
        }
      }
    }).done(res => {
      $("#accountNumber").text(res.data.accountNumber);
      $("#accountType").text(res.data.accountType);
    });
    $.ajax({
      url: apiUrl + "transaction/a/" + accountNumber,
      headers: {
        Authorization: `Bearer ${user}`
      },
      method: "GET",
      contentType: "application/json",
      timeout: 15000,
      error: res => {
        if (res.statusText === "error") {
        } else {
          console.log(res);
        }
      }
    }).done(res => {
      console.log(res);
      const transactions = res.data;
      const debits = transactions.filter(c => c.transactionType === "debit");
      const totalDebit = debits.reduce((c, t) => t.amount + c, 0);
      const credits = transactions.filter(c => c.transactionType === "credit");
      const totalCredit = credits.reduce((c, t) => t.amount + c, 0);
      const accountBalance = totalCredit - totalDebit;
      $("#accountBalance").text(
        accountBalance.toLocaleString("en-NG", {
          style: "currency",
          currency: "NGN"
        })
      );
      $(".loaded").attr("disabled", false);
      const trans = transactions.map(
        c =>
          `<tr>
        <td>${new Date(c.updatedAt).toDateString("en-NG")}</td>
        <td>${c.transactionType}</td>
        <td>${c.amount.toLocaleString("en-NG", {
          style: "currency",
          currency: "NGN"
        })}</td>
        <td>${c.channel}</td>
      </tr>`
      );
      $("#transactions").html(trans);
    });
  }
});
