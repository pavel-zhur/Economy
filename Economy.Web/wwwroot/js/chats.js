﻿document.addEventListener('DOMContentLoaded', function () {
    const secondaryButton = document.querySelector('.btn-secondary.chat-button');
    let offcanvasCount = 0;

    secondaryButton.addEventListener('click', function () {
        offcanvasCount++;

        // Create new primary button
        const newButton = document.createElement('button');
        newButton.className = 'btn btn-primary chat-button';
        newButton.type = 'button';
        newButton.innerHTML = `<i class="fas fa-microphone"></i>`;
        newButton.id = `toggleChatOffcanvas${offcanvasCount}`;

        // Create new offcanvas
        const newOffcanvas = document.createElement('div');
        newOffcanvas.className = window.innerWidth >= 768 ? 'offcanvas offcanvas-chat offcanvas-end' : 'offcanvas offcanvas-chat offcanvas-bottom';
        newOffcanvas.tabIndex = -1;
        newOffcanvas.id = `chatOffcanvas${offcanvasCount}`;
        newOffcanvas.setAttribute('aria-labelledby', `chatOffcanvasLabel${offcanvasCount}`);
        newOffcanvas.setAttribute('data-bs-scroll', 'true');
        newOffcanvas.setAttribute('data-bs-backdrop', 'false');
        newOffcanvas.innerHTML = `
                    <div class="offcanvas-header">
                        <h5 class="offcanvas-title" id="chatOffcanvasLabel${offcanvasCount}">Ассистент</h5>
                        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Закрыть"></button>
                    </div>
                    <div class="offcanvas-body">
                        <div id="chatHistory${offcanvasCount}" class="chat-history"></div>
                        <div class="input-group">
                            <input type="text" id="userInput${offcanvasCount}" class="form-control" placeholder="Введите ваше сообщение...">
                            <button class="btn btn-secondary" id="voiceInputBtn${offcanvasCount}">
                                <i class="fas fa-microphone"></i>
                            </button>
                            <button class="btn btn-primary" id="sendBtn${offcanvasCount}">Отправить</button>
                        </div>
                    </div>
                `;

        // Append new button and offcanvas to the DOM
        document.querySelector('.chat-buttons-container').appendChild(newButton);
        document.body.appendChild(newOffcanvas);

        // Create offcanvas instance and add event listener to the new button
        const bsOffcanvas = new bootstrap.Offcanvas(newOffcanvas);
        newButton.addEventListener('click', function () {
            // Hide all other offcanvas instances
            document.querySelectorAll('.offcanvas.show').forEach(offcanvas => {
                const instance = bootstrap.Offcanvas.getInstance(offcanvas);
                if (instance && instance != bsOffcanvas) {
                    instance.hide();
                }
            });
            // Toggle the new offcanvas
            bsOffcanvas.toggle();
        });
    });

    function updateOffcanvasPlacement() {
        document.querySelectorAll('.offcanvas-chat').forEach(offcanvasElement => {
            if (window.innerWidth >= 768) {
                offcanvasElement.classList.remove('offcanvas-bottom');
                offcanvasElement.classList.add('offcanvas-end');
            } else {
                offcanvasElement.classList.remove('offcanvas-end');
                offcanvasElement.classList.add('offcanvas-bottom');
            }
        });
    }

    window.addEventListener('resize', updateOffcanvasPlacement);
    updateOffcanvasPlacement(); // Initial call to set the correct placement
});
