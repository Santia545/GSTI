function showSnackbar(message, persistent = false, onClick = () => { }) {
    let timeoutId;
    const snackbar = document.createElement('div');
    snackbar.className = 'snackbar';
    snackbar.textContent = message;
    snackbar.addEventListener('click', () => {
        document.body.removeChild(snackbar);
        if (!persistent && timeoutId) {
            clearTimeout(timeoutId);
        }
        onClick();
    });
    document.body.appendChild(snackbar);


    if (persistent) {
        snackbar.className = 'snackbar show-persistent';
        return;
    }
    snackbar.className = 'snackbar show';

    timeoutId = setTimeout(() => {
        snackbar.className = 'snackbar';
        setTimeout(() => {
            document.body.removeChild(snackbar);
        }, 500);
    }, 3000);
}
export { showSnackbar };