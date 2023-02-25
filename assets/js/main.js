Validator({
	form: "#form-1",
	errorSelector: ".form-message",
	formGroupSelector: ".form-group",
	rules: [
		Validator.isRequired(`#avatar`),
		Validator.isRequired("#fullname", "Please enter your full name"),
		Validator.isRequired("#email"),
		Validator.isEmail("#email"),
		Validator.minLength("#password", 6),
		Validator.isRequired("#password_confirmation"),
		Validator.isConfirmed(
			"#password_confirmation",
			function () {
				return document.querySelector("#form-1 #password").value
			},
			"Password is not matching"
		),
		Validator.isRequired(`input[name="gender"]`),
		Validator.isRequired(`#province`),
	],
	onSubmit: function (data) {
		console.log(data)
	},
})
