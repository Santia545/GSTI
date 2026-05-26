function showModal(title, bodyContent, onclick = null, script = null, buttonText = 'OK', properties = { closeOnFailure: false }) {
    const closeFunction = () => {
        document.body.removeChild(modal);
    };
    const modal = document.createElement('div');
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';

    const modalTitle = document.createElement('h2');
    modalTitle.textContent = title;

    const closeButton = document.createElement('span');
    closeButton.className = 'close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => closeFunction();

    const modalButtons = document.createElement('div');
    if (onclick) {
        modalButtons.className = 'modal-buttons';
        const button = document.createElement('button');
        button.textContent = buttonText;
        button.onclick = async () => {
            try {
                await onclick();
                closeFunction();
            } catch (error) {
                if (properties.closeOnFailure)
                    closeFunction();
            }
        };
        modalButtons.appendChild(button);
    }
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.innerHTML = bodyContent;
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalButtons);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);


    window.onpointerdown = function (event) {
        if (event.target == modal) {
            closeFunction();
        }
    };
    if (script) {
        script();

        /* Alternative, i need to try the simpler form first
                const scriptElement = document.createElement('script');
                scriptElement.innerHTML = script;
                modal.appendChild(scriptElement);*/
    }
}
export { showModal };
