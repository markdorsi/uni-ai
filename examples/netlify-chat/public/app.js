// State
let messages = [
  {
    role: 'system',
    content: 'You are a helpful assistant. Be concise and friendly.',
  },
]
let isLoading = false

// DOM elements
const messagesContainer = document.getElementById('messages')
const chatForm = document.getElementById('chat-form')
const messageInput = document.getElementById('message-input')
const sendButton = document.getElementById('send-button')
const modelSelect = document.getElementById('model-select')
const errorContainer = document.getElementById('error')

// Add message to UI
function addMessage(role, content, isLoading = false) {
  const messageDiv = document.createElement('div')
  messageDiv.className = `message ${role === 'user' ? 'user-message' : 'assistant-message'} ${isLoading ? 'loading-message' : ''}`

  const roleDiv = document.createElement('div')
  roleDiv.className = 'message-role'
  roleDiv.textContent = role === 'user' ? '👤 You' : '🤖 AI'

  const contentDiv = document.createElement('div')
  contentDiv.className = 'message-content'

  if (isLoading) {
    contentDiv.innerHTML = `
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `
  } else {
    contentDiv.textContent = content
  }

  messageDiv.appendChild(roleDiv)
  messageDiv.appendChild(contentDiv)
  messagesContainer.appendChild(messageDiv)

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight

  return messageDiv
}

// Show error
function showError(message) {
  errorContainer.textContent = message
  errorContainer.classList.remove('hidden')
  setTimeout(() => {
    errorContainer.classList.add('hidden')
  }, 5000)
}

// Hide error
function hideError() {
  errorContainer.classList.add('hidden')
}

// Set loading state
function setLoading(loading) {
  isLoading = loading
  messageInput.disabled = loading
  sendButton.disabled = loading
  modelSelect.disabled = loading
  sendButton.textContent = loading ? 'Sending...' : 'Send'
}

// Handle form submit
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const userMessage = messageInput.value.trim()
  if (!userMessage || isLoading) return

  hideError()

  // Add user message to UI
  addMessage('user', userMessage)

  // Add user message to state
  messages.push({ role: 'user', content: userMessage })

  // Clear input
  messageInput.value = ''

  // Show loading message
  const loadingMessage = addMessage('assistant', '', true)
  setLoading(true)

  try {
    // Call API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: modelSelect.value,
        security: 'strict',
      }),
    })

    // Remove loading message
    loadingMessage.remove()

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to get response')
    }

    const data = await response.json()

    // Add assistant message to UI
    addMessage('assistant', data.message.content)

    // Add assistant message to state
    messages.push(data.message)
  } catch (error) {
    // Remove loading message
    loadingMessage.remove()

    console.error('Chat error:', error)
    showError(error.message || 'An error occurred. Please try again.')
  } finally {
    setLoading(false)
    messageInput.focus()
  }
})

// Focus input on load
messageInput.focus()
