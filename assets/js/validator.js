const Validator = (options) => {
	getParent = (element, selector) => {
		while (element.parentElement) {
			if (element.parentElement.matches(selector)) {
				return element.parentElement
			}
			element = element.parentElement
		}
	}
	let selectorRules = []
	// Validate, check the form and return error if exist
	validate = (inputElement, rule) => {
		let errorElement = getParent(
			inputElement,
			options.formGroupSelector
		).querySelector(options.errorSelector)
		let errorMessage
		// Get rules of selector
		let rules = selectorRules[rule.selector]

		// Loop through each rule and check
		// If error => stop checking
		for (let i = 0; i < rules.length; ++i) {
			switch (inputElement.type) {
				case "radio":
				case "checkbox":
					errorMessage = rules[i](
						formElement.querySelector(rule.selector + ":checked")
					)
					break
				default:
					errorMessage = rules[i](inputElement.value)
			}

			if (errorMessage) break
		}

		if (errorMessage) {
			errorElement.innerText = errorMessage
			getParent(inputElement, options.formGroupSelector).classList.add(
				"invalid"
			)
		} else {
			errorElement.innerText = ""
			getParent(inputElement, options.formGroupSelector).classList.remove(
				"invalid"
			)
		}
		return !errorMessage
	}
	// Get form element that need to validate
	const formElement = document.querySelector(options.form)
	if (formElement) {
		// When submit form
		formElement.onsubmit = (e) => {
			e.preventDefault()
			let isFormValid = true

			// Loop through each rule and validate
			options.rules.forEach((rule) => {
				let inputElement = formElement.querySelector(rule.selector)
				let isValid = validate(inputElement, rule)
				if (!isValid) {
					isFormValid = false
				}
			})
			let enableInputs = formElement.querySelectorAll("[name]")
			if (isFormValid) {
				// If has onSubmit callback function
				if (typeof options.onSubmit === "function") {
					let formValues = Array.from(enableInputs).reduce((values, input) => {
						switch (input.type) {
							case "radio":
								if (input.matches(":checked")) {
									values[input.name] = input.value
								}
								break
							case "checkbox":
								if (!input.matches(":checked")) {
									values[input.name] = []
									return values
								}
								if (!Array.isArray(values[input.name])) {
									values[input.name] = []
								}
								values[input.name].push(input.value)
								break
							case "file":
								values[input.name] = input.files
								break
							default:
								values[input.name] = input.value
						}

						return values
					}, {})
					options.onSubmit(formValues)
				}
				// Default submit behavior
				else {
					formElement.submit()
				}
			}
		}

		// Loop through each rule and listen event (blur, input, ...)
		options.rules.forEach((rule) => {
			if (Array.isArray(selectorRules[rule.selector])) {
				selectorRules[rule.selector].push(rule.test)
			} else {
				selectorRules[rule.selector] = [rule.test]
			}
			let inputElements = formElement.querySelectorAll(rule.selector)

			Array.from(inputElements).forEach((inputElement) => {
				if (inputElement) {
					// Handle when user blur - out focus the input
					inputElement.onblur = () => {
						validate(inputElement, rule)
					}

					// Handle when user use input
					inputElement.oninput = () => {
						let errorElement = getParent(
							inputElement,
							options.formGroupSelector
						).querySelector(options.errorSelector)
						errorElement.innerText = ""
						getParent(inputElement, options.formGroupSelector).classList.remove(
							"invalid"
						)
					}
				}
			})
		})
	}
}

// Define rules
// 1. When error => return error message
// 2. When success => return nothing (undefined)
Validator.isRequired = (selector, message) => {
	return {
		selector,
		test: (value) => {
			return value ? undefined : message || "Please enter this field"
		},
	}
}

Validator.isEmail = (selector, message) => {
	return {
		selector,
		test: (value) => {
			let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
			return regex.test(value)
				? undefined
				: message || "Must be correct mail format"
		},
	}
}

Validator.minLength = (selector, min, message) => {
	return {
		selector,
		test: (value) => {
			return value.length >= min
				? undefined
				: message || `Password must be longer than ${min}`
		},
	}
}

Validator.isConfirmed = (selector, getConfirmValue, message) => {
	return {
		selector,
		test: (value) => {
			return value === getConfirmValue()
				? undefined
				: message || "Value entered is not correct"
		},
	}
}
