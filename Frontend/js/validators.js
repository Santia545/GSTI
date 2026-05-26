function validateEmail(email) {
    return (String(email)
        .toLowerCase()
        .match(
            /^\S+@\S+\.\S+$/
        ))
}

function validatePassword(password) {
    return (String(password)
        .match(
            /^([a-zA-Z0-9._-]{5,60})$/
        ))
}

export { validateEmail, validatePassword };