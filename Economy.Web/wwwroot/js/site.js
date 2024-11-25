// Define the custom event on the window object
window.dispatchDataUpdatedEvent = function (latestRevision) {
    const event = new CustomEvent('dataUpdated', { detail: latestRevision });
    window.dispatchEvent(event);
};

// Add event listener for the custom event
window.addEventListener('dataUpdated', function (event) {
    const reloadButton = document.getElementById('reload-button');
    const dynamicContainer = document.getElementById('dynamic-container');

    if (!dynamicContainer) return;

    const latestRevision = event.detail;
    const currentRevision = document.getElementById('latestRevision')?.value;

    if (latestRevision == currentRevision) return;

    // Change button text and disable it
    reloadButton.textContent = 'Reloading...';
    reloadButton.disabled = true;

    // Add reloading class to the container
    dynamicContainer.classList.add('reloading');

    fetch(window.location.pathname + '?handler=Reload')
        .then(response => response.text())
        .then(html => {
            // Update the container with new content
            dynamicContainer.innerHTML = html;

            // Reset button text and enable it
            reloadButton.textContent = 'Reload';
            reloadButton.disabled = false;

            // Remove reloading class
            dynamicContainer.classList.remove('reloading');
        })
        .catch(error => {
            // Handle error: clear container and set button text to "Error"
            dynamicContainer.innerHTML = '';
            reloadButton.textContent = 'Error';
            reloadButton.disabled = false;

            // Remove reloading class
            dynamicContainer.classList.remove('reloading');
        });
});

document.getElementById('reload-button').addEventListener('click', function () {
    window.dispatchDataUpdatedEvent(null);
});