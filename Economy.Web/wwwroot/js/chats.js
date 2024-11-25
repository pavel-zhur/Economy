﻿document.addEventListener('DOMContentLoaded', function () {
    const connectionIndicator = document.getElementById('connectionIndicator');
    const chatsContainer = document.getElementById('chatsContainer');
    let connection;

    const initializeConnection = () => {
        try {
            connection = new signalR.HubConnectionBuilder()
                .withUrl("/chathub")
                .withHubProtocol(new signalR.protocols.msgpack.MessagePackHubProtocol())
                .withAutomaticReconnect({
                    nextRetryDelayInMilliseconds: retryContext => {
                        if (retryContext.elapsedMilliseconds < 60000) {
                            return Math.random() * 3000;
                        } else {
                            return null;
                        }
                    }
                })
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Event handlers
            connection.onclose(error => {
                updateConnectionStatus('disconnected');
                hideAll();
                logError('Connection closed', error);
            });

            connection.onreconnecting(error => {
                updateConnectionStatus('connecting');
                hideAll();
                logError('Connection reconnecting', error);
            });

            connection.onreconnected(connectionId => {
                updateConnectionStatus('connected');
                sendHello();
                logInfo('Reconnected with connectionId:', connectionId);
            });

            connection.on('HelloResponse', (state, renderedChats) => {
                handleHelloResponse(state, renderedChats);
            });

            connect();
        } catch (err) {
            console.error('Error initializing SignalR connection:', err);
        }
    };

    const connect = () => {
        // if disconnected
        if (connection.state === signalR.HubConnectionState.Disconnected) {
            updateConnectionStatus('connecting');
            connection.start()
                .then(() => {
                    updateConnectionStatus('connected');
                    console.info('SignalR connection established.');
                    sendHello();
                })
                .catch(err => {
                    console.error('Connection error:', err.toString());
                    updateConnectionStatus('disconnected');
                });
        } else {
            console.info('SignalR connection already established, connect button click ignored.');
        }
    };

    const hideAll = () => {
        renderChatView(null);
    }

    const handleHelloResponse = (state, renderedChats) => {
        // Handle versioning or other properties if needed in the future
        // Initial render can be handled here if necessary
        if (renderedChats) {
            renderChatView(renderedChats);
        }
    };

    const renderChatView = (renderedView) => {
        try {
            // Store current input values, focused element, and offcanvas state
            const inputValues = {};
            const inputs = chatsContainer.querySelectorAll('input[type="text"]:not([disabled])');
            let activeOffcanvasId = null;

            const activeOffcanvas = document.querySelector('.offcanvas.offcanvas-chat.show:not(.hiding), .offcanvas.offcanvas-chat.showing');
            if (activeOffcanvas) {
                activeOffcanvasId = activeOffcanvas.id;
            }

            inputs.forEach(input => {
                inputValues[input.id] = input.value;
            });


            const oldOffcanvasElements = document.querySelectorAll('.offcanvas-chat');
            oldOffcanvasElements.forEach(offcanvasElement => {
                const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if (offcanvasInstance) {
                    offcanvasInstance.dispose();
                }
            });

            // Update the chat container
            chatsContainer.innerHTML = renderedView;

            updateOffcanvasPlacement();

            // Reinitialize offcanvas elements and restore offcanvas state
            const offcanvasElements = document.querySelectorAll('.offcanvas-chat');
            offcanvasElements.forEach(offcanvasElement => {
                const chatId = offcanvasElement.id.replace('chatOffcanvas-', '');
                const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if (offcanvasInstance) {
                    offcanvasInstance.dispose();
                }

                // Subscribe to the 'shown.bs.offcanvas' event to focus the textbox
                offcanvasElement.addEventListener('shown.bs.offcanvas', () => {
                    const textbox = offcanvasElement.querySelector('input[type="text"]');
                    if (textbox) {
                        // Prevent the keyboard from showing by making the textbox readonly
                        textbox.setAttribute('readonly', true);
                        textbox.focus();
                        // Remove the readonly attribute to allow user input
                        textbox.removeAttribute('readonly');
                    }

                    const chatButtons = document.querySelectorAll('.toggle-chat-button');
                    chatButtons.forEach(function (button) {
                        var buttonChatId = button.id.replace('toggleChatOffcanvas-', '');
                        var icon = button.querySelector('i');

                        if (buttonChatId === chatId) {
                            icon.classList.remove('fa-regular');
                            icon.classList.add('fa-solid');
                        } else {
                            icon.classList.remove('fa-solid');
                            icon.classList.add('fa-regular');
                        }
                    });
                });

                offcanvasElement.addEventListener('shown.bs.offcanvas', () => {
                    const chatButton = document.querySelector('#toggleChatOffcanvas-' + chatId);
                    var icon = chatButton.querySelector('i');

                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                });

                offcanvasElement.addEventListener('hide.bs.offcanvas', () => {
                    const chatButton = document.querySelector('#toggleChatOffcanvas-' + chatId);
                    var icon = chatButton.querySelector('i');

                    icon.classList.add('fa-regular');
                    icon.classList.remove('fa-solid');
                });

                const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);

                if (activeOffcanvasId === offcanvasElement.id) {
                    // Temporarily disable transitions
                    offcanvasElement.style.transition = 'none';
                    offcanvasElement.classList.add('show');
                    bsOffcanvas.show();
                    // Force reflow to apply the 'show' class without animation
                    void offcanvasElement.offsetWidth;
                    // Re-enable transitions
                    offcanvasElement.style.transition = '';
                }
            });

            // Restore input values
            Object.keys(inputValues).forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.value = inputValues[id];
                }
            });
        } catch (err) {
            console.error('Error rendering chat view:', err);
            chatsContainer.innerHTML = '';
        }
    };

    const updateConnectionStatus = (status) => {
        connectionIndicator.classList.remove('connected', 'connecting', 'disconnected');
        connectionIndicator.classList.add(status);
    };

    const sendHello = () => {
        connection.invoke('Hello')
            .catch(err => {
                console.error('Error sending Hello:', err.toString());
                hideAll();
            });
    };

    const generateRandomId = () => {
        // Simple function to generate a random ID
        return 'id-' + Math.random().toString(36).substr(2, 9);
    };

    const tryCancelMessage = (chatId, messageId) => {
        connection.invoke('TryCancel', chatId, messageId)
            .catch(err => {
                console.error('TryCancel error:', err.toString());
            });
    };

    const sendMessage = (chatId) => {
        const messageInput = document.getElementById('messageInput-' + chatId);
        const sendButton = document.getElementById('sendButton-' + chatId);
        messageInput.disabled = true;
        sendButton.disabled = true;

        connection.invoke('SendMessage', chatId, generateRandomId(), messageInput.value)
            .catch(err => {
                console.error('Error sending message:', err.toString());
            });
    };

    const sendAudio = async (byteArray) => {
        let chatId = document.getElementById('default-chat-id').value;
        await connection.invoke('SendAudio', chatId, generateRandomId(), byteArray);
    };

    const closeChat = (chatId) => {
        const chat = document.getElementById('chat-' + chatId);
        chat.remove();
        connection.invoke('CloseChat', chatId)
            .catch(err => {
                console.error('Error closing chat:', err.toString());
            });
    };

    window.chatsComponent = {
        tryCancelMessage: tryCancelMessage,
        sendMessage: sendMessage,
        closeChat: closeChat,
        sendAudio: sendAudio
    };

    const logError = (message, error) => {
        console.error(message, error);
    };

    const logInfo = (message, info) => {
        console.info(message, info);
    };

    const updateOffcanvasPlacement = () => {
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

    // Initialize the connection
    initializeConnection();

    // Update offcanvas placement on window resize
    window.addEventListener('resize', updateOffcanvasPlacement);

    // Initial call to set the correct placement
    updateOffcanvasPlacement();

    // Bind the connect button
    connectionIndicator.addEventListener('click', () => {
        connect();
    });
});
