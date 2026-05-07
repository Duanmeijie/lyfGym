<template>
  <div class="ai-assistant">
    <button v-if="!isOpen" class="chat-toggle" @click="isOpen = true">
      AI Assistant
    </button>
    
    <div v-else class="chat-window">
      <div class="chat-header">
        <span>AI Assistant</span>
        <button @click="isOpen = false">&times;</button>
      </div>
      
      <div class="chat-body" ref="chatBody">
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          class="message" 
          :class="msg.role"
        >
          <div class="content">{{ msg.content }}</div>
        </div>
        <div v-if="loading" class="message ai">
          <div class="content">Thinking...</div>
        </div>
      </div>
      
      <div class="chat-input">
        <input 
          v-model="inputText" 
          placeholder="Ask me anything..." 
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage" :disabled="loading">Send</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import axios from 'axios'

const isOpen = ref(false)
const inputText = ref('')
const messages = ref([
  { role: 'ai', content: 'Hello! I am your fitness assistant. Ask me about members, coaches, or get management advice!' }
])
const loading = ref(false)
const chatBody = ref(null)

const sendMessage = async () => {
  if (!inputText.value.trim() || loading.value) return
  
  const userMsg = inputText.value
  messages.value.push({ role: 'user', content: userMsg })
  inputText.value = ''
  loading.value = true
  
  await nextTick()
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
  
  try {
    const response = await axios.post('/api/ai/chat', { message: userMsg })
    messages.value.push({ role: 'ai', content: response.data.reply })
  } catch (error) {
    messages.value.push({ role: 'ai', content: 'Sorry, service is temporarily unavailable.' })
  } finally {
    loading.value = false
    await nextTick()
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight
    }
  }
}
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.chat-toggle {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.2s;
}

.chat-toggle:hover {
  transform: scale(1.05);
}

.chat-window {
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: #10b981;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.chat-header button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 20px;
}

.chat-body {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f3f4f6;
}

.message {
  margin-bottom: 10px;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.ai {
  justify-content: flex-start;
}

.content {
  padding: 10px 15px;
  border-radius: 18px;
  max-width: 80%;
  font-size: 14px;
  line-height: 1.4;
}

.message.user .content {
  background: #10b981;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.ai .content {
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.chat-input {
  padding: 15px;
  background: white;
  display: flex;
  border-top: 1px solid #eee;
}

.chat-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  margin-right: 10px;
}

.chat-input button {
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
}

.chat-input button:disabled {
  background: #999;
  cursor: not-allowed;
}
</style>