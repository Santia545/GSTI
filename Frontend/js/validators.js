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
            /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9._-]{5,60}$/
        ))
}

export { validateEmail, validatePassword };