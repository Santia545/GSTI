function showLoadingBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.className = 'loading-backdrop';

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    backdrop.appendChild(spinner);

    document.body.appendChild(backdrop);
}

function hideLoadingBackdrop() {
    const backdrop = document.querySelector('.loading-backdrop');
    if (backdrop) {
        document.body.removeChild(backdrop);
    }
}

export { showLoadingBackdrop, hideLoadingBackdrop };
