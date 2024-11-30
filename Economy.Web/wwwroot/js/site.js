window.dispatchDataUpdatedEvent = function (latestRevision) {
    const event = new CustomEvent('dataUpdated', { detail: latestRevision });
    window.dispatchEvent(event);
};

// Function to retrieve the currently selected ordering
function getCurrentOrdering() {
    const orderingRadios = document.getElementsByName('Ordering');
    for (const radio of orderingRadios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return null; // Return null if no ordering is selected
}

// Function to handle the reload logic
function reloadListPage(isExternalTrigger = false, latestRevision = null) {
    const reloadButton = document.getElementById('reload-button');
    const dynamicContainer = document.getElementById('dynamic-container');

    if (!dynamicContainer || !reloadButton) return;

    const currentRevision = document.getElementById('latestRevision')?.value;

    // If triggered by an external event, check revisions
    if (isExternalTrigger) {
        if (latestRevision == currentRevision) return;
    }

    // Retrieve current ordering
    const ordering = getCurrentOrdering();

    // Construct URL with or without Ordering parameter
    let url = `${window.location.pathname}?handler=Reload`;
    if (ordering) {
        url += `&Ordering=${encodeURIComponent(ordering)}`;
    }

    // Update Reload button state
    reloadButton.textContent = 'Reloading...';
    reloadButton.disabled = true;

    // Add loading indicator to the dynamic container
    dynamicContainer.classList.add('reloading');

    // Perform the fetch request
    fetch(url)
        .then(response => response.text())
        .then(html => {
            // Update the dynamic container with the fetched HTML
            dynamicContainer.innerHTML = html;

            // Reset Reload button state
            reloadButton.textContent = 'Reload';
            reloadButton.disabled = false;

            // Remove loading indicator
            dynamicContainer.classList.remove('reloading');
        })
        .catch(() => {
            // Handle errors by clearing the container and updating button text
            dynamicContainer.innerHTML = '';
            reloadButton.textContent = 'Error';
            reloadButton.disabled = false;

            // Remove loading indicator
            dynamicContainer.classList.remove('reloading');
        });
}

// Event listener for external 'dataUpdated' events
window.addEventListener('dataUpdated', function (event) {
    const latestRevision = event.detail;
    reloadListPage(true, latestRevision);
});

// Initialize event listeners for the Reload button and Radio buttons after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const reloadButton = document.getElementById('reload-button');
    const orderingRadios = document.getElementsByName('Ordering');

    if (reloadButton) {
        reloadButton.addEventListener('click', function () {
            reloadListPage();
        });
    }

    // Add change event listeners to all ordering radio buttons
    orderingRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            reloadListPage();
        });
    });
});
